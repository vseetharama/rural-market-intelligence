const express = require('express');
const { askAi, getSellAdvice, getStockAdvice } = require('../controllers/aiController');
const { optionalAuthenticate, authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/ask', optionalAuthenticate, askAi);
router.post('/sell-advice', authenticate, getSellAdvice);
router.post('/stock-advice', authenticate, getStockAdvice);

module.exports = router;
