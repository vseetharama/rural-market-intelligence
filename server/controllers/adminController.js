const User = require('../models/User');
const MarketData = require('../models/MarketData');
const ProductListing = require('../models/ProductListing');
const PurchaseRequest = require('../models/PurchaseRequest');

async function getAllUsers(req, res) {
  try {
    const users = await User.find()
      .select('name email phone role location createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load users', error: error.message });
  }
}

async function getUserById(req, res) {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('name email phone role location createdAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load user', error: error.message });
  }
}

async function getAdminStats(req, res) {
  try {
    const totalUsers = await User.countDocuments();
    const farmers = await User.countDocuments({ role: 'FARMER' });
    const buyers = await User.countDocuments({ role: 'BUYER' });
    const vendors = await User.countDocuments({ role: 'VENDOR' });
    const totalListings = await ProductListing.countDocuments();
    const totalPurchaseRequests = await PurchaseRequest.countDocuments();
    const totalMarketData = await MarketData.countDocuments();

    res.status(200).json({
      totalUsers,
      farmers,
      buyers,
      vendors,
      totalListings,
      totalPurchaseRequests,
      totalMarketData,
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load statistics', error: error.message });
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  getAdminStats,
};
