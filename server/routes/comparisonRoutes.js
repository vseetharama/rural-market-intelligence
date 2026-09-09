const express = require('express');
const { compareMarkets } = require('../controllers/comparisonController');

const router = express.Router();

// Public endpoint for market comparison (no authentication required)
// Handles POST requests to /api/market-comparison/compare
router.post('/compare', compareMarkets);

module.exports = router;
