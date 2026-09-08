const express = require('express');
const { authenticate, requireRoles } = require('../middleware/auth');
const {
  getAllMarketData,
  getMarketDataById,
  createMarketData,
  updateMarketData,
  deleteMarketData,
} = require('../controllers/marketDataController');

const router = express.Router();

// Public read-only routes (no authentication required)
router.get('/', getAllMarketData);
router.get('/:id', getMarketDataById);

// Protected write routes (ADMIN only)
router.post('/', authenticate, requireRoles('ADMIN'), createMarketData);
router.put('/:id', authenticate, requireRoles('ADMIN'), updateMarketData);
router.delete('/:id', authenticate, requireRoles('ADMIN'), deleteMarketData);

module.exports = router;
