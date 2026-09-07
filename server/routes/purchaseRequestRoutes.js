const express = require('express');
const {
  createPurchaseRequest,
  getMyPurchaseRequests,
  getSellingRequests,
  updatePurchaseRequestStatus,
} = require('../controllers/purchaseRequestController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, createPurchaseRequest);
router.get('/my', authenticate, getMyPurchaseRequests);
router.get('/selling', authenticate, getSellingRequests);
router.put('/:id/status', authenticate, updatePurchaseRequestStatus);

module.exports = router;
