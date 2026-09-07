const express = require('express');
const {
  getSummary,
  getProductAnalytics,
  getProducts,
} = require('../controllers/analyticsController');
const { optionalAuthenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/summary', optionalAuthenticate, getSummary);
router.get('/products', getProducts);
router.get('/product/:product', getProductAnalytics);

module.exports = router;
