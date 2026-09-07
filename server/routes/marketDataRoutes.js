const express = require('express');
const {
  getAllMarketData,
  getMarketDataById,
  createMarketData,
  updateMarketData,
  deleteMarketData,
} = require('../controllers/marketDataController');

const router = express.Router();

router.get('/', getAllMarketData);
router.get('/:id', getMarketDataById);
router.post('/', createMarketData);
router.put('/:id', updateMarketData);
router.delete('/:id', deleteMarketData);

module.exports = router;
