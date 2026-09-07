const express = require('express');
const {
  getListings,
  getMyListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
} = require('../controllers/listingController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', getListings);
router.get('/mine', authenticate, getMyListings);
router.get('/:id', getListingById);
router.post('/', authenticate, createListing);
router.put('/:id', authenticate, updateListing);
router.delete('/:id', authenticate, deleteListing);

module.exports = router;
