const MarketData = require('../models/MarketData');

function round(value, decimals = 2) {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}

function classifyPriceTrend(changePercentage) {
  if (changePercentage > 5) return 'Increasing';
  if (changePercentage < -5) return 'Decreasing';
  return 'Stable';
}

function classifyDemandLevel(demand, quantity) {
  if (!quantity || quantity === 0) {
    return demand > 0 ? 'High' : 'Low';
  }

  const ratio = demand / quantity;

  if (ratio > 1.5) return 'High';
  if (ratio >= 0.8) return 'Medium';
  return 'Low';
}

function calculatePriceChangePercentage(currentPrice, previousPrice) {
  if (previousPrice === 0) {
    return currentPrice === 0 ? 0 : 100;
  }

  return round(((currentPrice - previousPrice) / previousPrice) * 100);
}

async function getSummary() {
  const records = await MarketData.find();

  if (records.length === 0) {
    return {
      totalRecords: 0,
      totalProducts: 0,
      averagePrice: 0,
      highestPrice: 0,
      lowestPrice: 0,
      totalQuantity: 0,
      totalDemand: 0,
    };
  }

  const products = new Set(records.map((record) => record.product.toLowerCase()));
  const totalPrice = records.reduce((sum, record) => sum + record.price, 0);
  const prices = records.map((record) => record.price);

  return {
    totalRecords: records.length,
    totalProducts: products.size,
    averagePrice: round(totalPrice / records.length),
    highestPrice: Math.max(...prices),
    lowestPrice: Math.min(...prices),
    totalQuantity: round(records.reduce((sum, record) => sum + record.quantity, 0)),
    totalDemand: round(records.reduce((sum, record) => sum + record.demand, 0)),
  };
}

function getDateKey(dateValue) {
  return new Date(dateValue).toISOString().slice(0, 10);
}

function averageOf(values) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

async function getProductAnalytics(productName) {
  const records = await MarketData.find({
    product: new RegExp(`^${escapeRegex(productName)}$`, 'i'),
  }).sort({ date: 1, createdAt: 1 });

  if (records.length === 0) {
    return null;
  }

  const prices = records.map((record) => record.price);
  const averagePrice = round(averageOf(prices));

  const pricesByDate = {};
  for (const record of records) {
    const key = getDateKey(record.date);
    if (!pricesByDate[key]) {
      pricesByDate[key] = [];
    }
    pricesByDate[key].push(record.price);
  }

  const dateKeys = Object.keys(pricesByDate).sort();
  const latestDateKey = dateKeys[dateKeys.length - 1];
  const currentPrice = round(averageOf(pricesByDate[latestDateKey]));

  let priceChangePercentage = 0;
  if (dateKeys.length > 1) {
    const midpoint = Math.floor(dateKeys.length / 2);
    const previousPeriodPrices = dateKeys
      .slice(0, midpoint)
      .flatMap((key) => pricesByDate[key]);
    const currentPeriodPrices = dateKeys
      .slice(midpoint)
      .flatMap((key) => pricesByDate[key]);

    const previousPeriodAverage = round(averageOf(previousPeriodPrices));
    const currentPeriodAverage = round(averageOf(currentPeriodPrices));
    priceChangePercentage = calculatePriceChangePercentage(
      currentPeriodAverage,
      previousPeriodAverage
    );
  }

  const averageDemand = round(averageOf(records.map((record) => record.demand)));
  const averageQuantity = round(averageOf(records.map((record) => record.quantity)));

  const history = records.map((record) => ({
    date: record.date,
    price: record.price,
    quantity: record.quantity,
    demand: record.demand,
    location: record.location,
    unit: record.unit,
  }));

  return {
    product: records[0].product,
    unit: records[records.length - 1].unit,
    averagePrice,
    currentPrice,
    minimumPrice: Math.min(...prices),
    maximumPrice: Math.max(...prices),
    priceChangePercentage,
    priceTrend: classifyPriceTrend(priceChangePercentage),
    averageDemand,
    averageQuantity,
    demandLevel: classifyDemandLevel(averageDemand, averageQuantity),
    history,
  };
}

async function getInsights() {
  const records = await MarketData.find().sort({ date: 1 });
  const insights = [];

  if (records.length === 0) {
    return insights;
  }

  const products = [...new Set(records.map((record) => record.product))];
  const locationInsights = [];

  for (const product of products) {
    const productRecords = records.filter(
      (record) => record.product.toLowerCase() === product.toLowerCase()
    );

    const latestByLocation = {};
    for (const record of productRecords) {
      const key = record.location;
      if (!latestByLocation[key] || record.date > latestByLocation[key].date) {
        latestByLocation[key] = record;
      }
    }

    const locationEntries = Object.values(latestByLocation).sort(
      (a, b) => b.price - a.price
    );

    if (locationEntries.length >= 2 && locationEntries[0].price > locationEntries[1].price) {
      locationInsights.push(
        `${locationEntries[0].location} currently has a higher ${product.toLowerCase()} price than ${locationEntries[1].location}.`
      );
    }

    if (productRecords.length >= 2) {
      const pricesByDate = {};
      for (const record of productRecords) {
        const key = getDateKey(record.date);
        if (!pricesByDate[key]) {
          pricesByDate[key] = [];
        }
        pricesByDate[key].push(record.price);
      }

      const dateKeys = Object.keys(pricesByDate).sort();
      if (dateKeys.length >= 2) {
        const midpoint = Math.floor(dateKeys.length / 2);
        const previousPeriodAverage = averageOf(
          dateKeys.slice(0, midpoint).flatMap((key) => pricesByDate[key])
        );
        const currentPeriodAverage = averageOf(
          dateKeys.slice(midpoint).flatMap((key) => pricesByDate[key])
        );
        const change = calculatePriceChangePercentage(
          currentPeriodAverage,
          previousPeriodAverage
        );
        const trend = classifyPriceTrend(change);

        if (trend === 'Increasing') {
          insights.push(`${product} prices are increasing.`);
        } else if (trend === 'Decreasing') {
          insights.push(`${product} prices are decreasing.`);
        }
      }
    }

    const totalDemand = productRecords.reduce((sum, record) => sum + record.demand, 0);
    const totalQuantity = productRecords.reduce((sum, record) => sum + record.quantity, 0);
    const demandLevel = classifyDemandLevel(totalDemand, totalQuantity);

    if (demandLevel === 'High') {
      insights.push(`Demand for ${product.toLowerCase()} is high.`);
    }

    if (totalQuantity > 0 && totalDemand > totalQuantity) {
      insights.push(`${product} demand is greater than the recorded supply.`);
    }
  }

  return [...locationInsights.slice(0, 2), ...insights].slice(0, 8);
}

async function getPopularProducts(limit = 5) {
  const records = await MarketData.find();
  const counts = {};

  for (const record of records) {
    const key = record.product;
    if (!counts[key]) {
      counts[key] = { product: key, count: 0, category: record.category };
    }
    counts[key].count += 1;
  }

  return Object.values(counts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
  getSummary,
  getProductAnalytics,
  getInsights,
  getPopularProducts,
  classifyPriceTrend,
  classifyDemandLevel,
  calculatePriceChangePercentage,
};
