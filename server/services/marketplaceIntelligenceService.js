const MarketData = require('../models/MarketData');
const ProductListing = require('../models/ProductListing');
const analyticsService = require('./analyticsService');

function round(value, decimals = 2) {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractKeywords(question = '') {
  const knownProducts = [
    'tomato',
    'rice',
    'onion',
    'potato',
    'banana',
    'pulses',
    'coconut',
  ];
  const knownLocations = ['udupi', 'kundapura', 'mangalore', 'karkala'];
  const lower = question.toLowerCase();

  return {
    products: knownProducts.filter((item) => lower.includes(item)),
    locations: knownLocations.filter((item) => lower.includes(item)),
    wantsSellAdvice: /where should i sell|sell my|selling opportunity|best.*sell/i.test(
      question
    ),
    wantsStockAdvice: /what should i stock|what should i buy|stock recommendation/i.test(
      question
    ),
    wantsListings: /find|seller|sellers|available|near|buy/i.test(question),
  };
}

async function getMarketRecords(filters = {}) {
  const query = {};
  if (filters.product) {
    query.product = new RegExp(`^${escapeRegex(filters.product)}$`, 'i');
  }
  if (filters.location) {
    query.location = new RegExp(filters.location, 'i');
  }

  return MarketData.find(query).sort({ date: -1 }).limit(40).lean();
}

async function getActiveListings(filters = {}) {
  const query = { status: 'ACTIVE' };

  if (filters.product) {
    query.product = new RegExp(filters.product, 'i');
  }
  if (filters.location) {
    query.location = new RegExp(filters.location, 'i');
  }

  return ProductListing.find(query)
    .populate('seller', 'name role location phone')
    .sort({ price: 1 })
    .limit(30)
    .lean();
}

async function buildProductSummaries() {
  const products = await MarketData.distinct('product');
  const summaries = [];

  for (const product of products) {
    const analytics = await analyticsService.getProductAnalytics(product);
    if (analytics) {
      summaries.push({
        product: analytics.product,
        averagePrice: analytics.averagePrice,
        currentPrice: analytics.currentPrice,
        priceTrend: analytics.priceTrend,
        priceChangePercentage: analytics.priceChangePercentage,
        demandLevel: analytics.demandLevel,
        averageDemand: analytics.averageDemand,
        averageQuantity: analytics.averageQuantity,
      });
    }
  }

  return summaries;
}

async function getSellRecommendation({ product, quantity, location }) {
  const productName = product || 'Tomato';
  const qty = Number(quantity) || 0;
  const marketRecords = await getMarketRecords({ product: productName });
  const listings = await getActiveListings({ product: productName });
  const analytics = await analyticsService.getProductAnalytics(productName);

  const locationAverages = {};
  for (const record of marketRecords) {
    const key = record.location;
    if (!locationAverages[key]) {
      locationAverages[key] = { location: key, total: 0, count: 0 };
    }
    locationAverages[key].total += record.price;
    locationAverages[key].count += 1;
  }

  const marketOptions = Object.values(locationAverages)
    .map((item) => ({
      location: item.location,
      averagePrice: round(item.total / item.count),
      potentialGrossValue: qty > 0 ? round((item.total / item.count) * qty) : null,
    }))
    .sort((a, b) => b.averagePrice - a.averagePrice);

  const recommended = marketOptions[0] || null;
  const localAverage =
    marketOptions.find(
      (item) => item.location.toLowerCase() === String(location || '').toLowerCase()
    ) || null;

  return {
    product: productName,
    quantity: qty,
    currentLocation: location || null,
    analytics: analytics
      ? {
          averagePrice: analytics.averagePrice,
          currentPrice: analytics.currentPrice,
          priceTrend: analytics.priceTrend,
          demandLevel: analytics.demandLevel,
        }
      : null,
    recommendedOpportunity: recommended
      ? {
          market: recommended.location,
          recordedAveragePrice: recommended.averagePrice,
          yourQuantity: qty,
          potentialGrossValue: recommended.potentialGrossValue,
          comparedToCurrentLocation: localAverage
            ? round(recommended.averagePrice - localAverage.averagePrice)
            : null,
          disclaimer:
            'This is an informational recommendation based on recorded platform data, not a guaranteed selling price.',
        }
      : null,
    marketOptions,
    competingListings: listings.map((listing) => ({
      id: listing._id,
      product: listing.product,
      price: listing.price,
      quantity: listing.quantity,
      unit: listing.unit,
      location: listing.location,
      seller: listing.seller
        ? {
            name: listing.seller.name,
            role: listing.seller.role,
            location: listing.seller.location,
          }
        : null,
    })),
  };
}

async function getStockRecommendations() {
  const summaries = await buildProductSummaries();
  const listings = await getActiveListings();

  const listingCounts = {};
  for (const listing of listings) {
    const key = listing.product;
    if (!listingCounts[key]) {
      listingCounts[key] = { count: 0, totalQuantity: 0 };
    }
    listingCounts[key].count += 1;
    listingCounts[key].totalQuantity += listing.quantity;
  }

  return summaries
    .map((item) => {
      const supply = listingCounts[item.product] || { count: 0, totalQuantity: 0 };
      let recommendation = 'Maintain';

      if (item.demandLevel === 'High' && item.priceTrend === 'Increasing') {
        recommendation = 'Consider stocking';
      } else if (item.demandLevel === 'Low' || item.priceTrend === 'Decreasing') {
        recommendation = 'Reduce new stock';
      }

      return {
        ...item,
        activeListings: supply.count,
        listedQuantity: supply.totalQuantity,
        recommendation,
      };
    })
    .sort((a, b) => {
      const rank = { 'Consider stocking': 0, Maintain: 1, 'Reduce new stock': 2 };
      return rank[a.recommendation] - rank[b.recommendation];
    });
}

async function buildAiContext(question, user) {
  const keywords = extractKeywords(question);
  const productFilter = keywords.products[0]
    ? keywords.products[0].charAt(0).toUpperCase() + keywords.products[0].slice(1)
    : null;
  const locationFilter = keywords.locations[0]
    ? keywords.locations[0].charAt(0).toUpperCase() + keywords.locations[0].slice(1)
    : null;

  const [summary, insights, productSummaries, marketRecords, listings] = await Promise.all([
    analyticsService.getSummary(),
    analyticsService.getInsights(),
    buildProductSummaries(),
    getMarketRecords({
      product: productFilter || undefined,
      location: locationFilter || undefined,
    }),
    getActiveListings({
      product: productFilter || undefined,
      location: locationFilter || undefined,
    }),
  ]);

  const context = {
    askedAt: new Date().toISOString(),
    user: user
      ? {
          name: user.name,
          role: user.role,
          location: user.location,
        }
      : null,
    dashboardSummary: summary,
    marketInsights: insights,
    productAnalytics: productSummaries,
    relevantMarketRecords: marketRecords.map((record) => ({
      product: record.product,
      category: record.category,
      price: record.price,
      quantity: record.quantity,
      demand: record.demand,
      unit: record.unit,
      location: record.location,
      date: record.date,
    })),
    activeMarketplaceListings: listings.map((listing) => ({
      id: listing._id,
      product: listing.product,
      category: listing.category,
      price: listing.price,
      quantity: listing.quantity,
      unit: listing.unit,
      location: listing.location,
      description: listing.description,
      seller: listing.seller
        ? {
            name: listing.seller.name,
            role: listing.seller.role,
            location: listing.seller.location,
          }
        : null,
    })),
  };

  if (keywords.wantsSellAdvice) {
    context.sellRecommendation = await getSellRecommendation({
      product: productFilter || 'Tomato',
      quantity: 500,
      location: locationFilter || user?.location || 'Kundapura',
    });
  }

  if (keywords.wantsStockAdvice || /high demand|what should i stock/i.test(question)) {
    context.stockRecommendations = await getStockRecommendations();
  }

  const hasData =
    context.relevantMarketRecords.length > 0 ||
    context.activeMarketplaceListings.length > 0 ||
    context.productAnalytics.length > 0;

  context.dataAvailability = hasData
    ? 'Platform data is available for analysis.'
    : 'Insufficient platform data for a reliable answer.';

  return context;
}

module.exports = {
  extractKeywords,
  getMarketRecords,
  getActiveListings,
  buildProductSummaries,
  getSellRecommendation,
  getStockRecommendations,
  buildAiContext,
};
