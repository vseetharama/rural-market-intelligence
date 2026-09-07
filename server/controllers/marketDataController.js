const mongoose = require('mongoose');
const MarketData = require('../models/MarketData');

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function formatValidationError(error) {
  if (error.name === 'ValidationError') {
    return Object.values(error.errors)
      .map((item) => item.message)
      .join(', ');
  }

  return error.message || 'Invalid request data';
}

async function getAllMarketData(req, res) {
  try {
    const { product, location, category } = req.query;
    const filter = {};

    if (product) {
      filter.product = new RegExp(product, 'i');
    }
    if (location) {
      filter.location = new RegExp(location, 'i');
    }
    if (category) {
      filter.category = new RegExp(category, 'i');
    }

    const records = await MarketData.find(filter).sort({ date: -1, createdAt: -1 });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load market data', error: error.message });
  }
}

async function getMarketDataById(req, res) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid market data ID' });
    }

    const record = await MarketData.findById(id);

    if (!record) {
      return res.status(404).json({ message: 'Market record not found' });
    }

    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load market record', error: error.message });
  }
}

async function createMarketData(req, res) {
  try {
    const record = await MarketData.create(req.body);
    res.status(201).json(record);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: formatValidationError(error) });
    }

    res.status(500).json({ message: 'Unable to create market data', error: error.message });
  }
}

async function updateMarketData(req, res) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid market data ID' });
    }

    const record = await MarketData.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!record) {
      return res.status(404).json({ message: 'Market record not found' });
    }

    res.status(200).json(record);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: formatValidationError(error) });
    }

    res.status(500).json({ message: 'Unable to update market data', error: error.message });
  }
}

async function deleteMarketData(req, res) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid market data ID' });
    }

    const record = await MarketData.findByIdAndDelete(id);

    if (!record) {
      return res.status(404).json({ message: 'Market record not found' });
    }

    res.status(200).json({ message: 'Market data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to delete market data', error: error.message });
  }
}

module.exports = {
  getAllMarketData,
  getMarketDataById,
  createMarketData,
  updateMarketData,
  deleteMarketData,
};
