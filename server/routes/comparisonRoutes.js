const express = require('express');
const { compareMarkets } = require('../controllers/comparisonController');

const router = express.Router();

// Public endpoint for market comparison (no authentication required)
router.post('/', compareMarkets);

module.exports = router;
