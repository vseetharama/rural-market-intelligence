const analyticsService = require('../services/analyticsService');
const marketplaceIntelligenceService = require('../services/marketplaceIntelligenceService');
const MarketData = require('../models/MarketData');
const ProductListing = require('../models/ProductListing');
const PurchaseRequest = require('../models/PurchaseRequest');

async function getSummary(req, res) {
  try {
    const summary = await analyticsService.getSummary();
    const insights = await analyticsService.getInsights();
    const popularProducts = await analyticsService.getPopularProducts();
    const recentRecords = await MarketData.find().sort({ date: -1, createdAt: -1 }).limit(5);
    const activeListings = await ProductListing.countDocuments({ status: 'ACTIVE' });
    const recentListings = await ProductListing.find({ status: 'ACTIVE' })
      .populate('seller', 'name role location')
      .sort({ createdAt: -1 })
      .limit(5);
    const stockRecommendations = await marketplaceIntelligenceService.getStockRecommendations();
    const highDemandProducts = stockRecommendations.filter(
      (item) => item.demandLevel === 'High'
    );

    let roleStats = null;
    if (req.user) {
      const myListings = await ProductListing.countDocuments({ seller: req.user._id });
      const activeMyListings = await ProductListing.countDocuments({
        seller: req.user._id,
        status: 'ACTIVE',
      });
      const pendingBuying = await PurchaseRequest.countDocuments({
        buyer: req.user._id,
        status: 'PENDING',
      });
      const pendingSelling = await PurchaseRequest.countDocuments({
        seller: req.user._id,
        status: 'PENDING',
      });
      const acceptedBuying = await PurchaseRequest.countDocuments({
        buyer: req.user._id,
        status: 'ACCEPTED',
      });

      roleStats = {
        myListings,
        activeMyListings,
        pendingBuying,
        pendingSelling,
        acceptedBuying,
      };
    }

    res.status(200).json({
      ...summary,
      activeListings,
      highDemandCount: highDemandProducts.length,
      insights,
      popularProducts,
      recentRecords,
      recentListings,
      highDemandProducts,
      stockRecommendations: stockRecommendations.slice(0, 5),
      roleStats,
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load dashboard summary', error: error.message });
  }
}

async function getProductAnalytics(req, res) {
  try {
    const { product } = req.params;
    const analytics = await analyticsService.getProductAnalytics(product);

    if (!analytics) {
      return res.status(404).json({ message: `No analytics found for product: ${product}` });
    }

    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load product analytics', error: error.message });
  }
}

async function getProducts(req, res) {
  try {
    const products = await MarketData.distinct('product');
    res.status(200).json(products.sort());
  } catch (error) {
    res.status(500).json({ message: 'Unable to load products', error: error.message });
  }
}

module.exports = {
  getSummary,
  getProductAnalytics,
  getProducts,
};
