const mongoose = require('mongoose');
const PurchaseRequest = require('../models/PurchaseRequest');
const ProductListing = require('../models/ProductListing');
const User = require('../models/User');
const notificationService = require('../services/notificationService');

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function createPurchaseRequest(req, res) {
  try {
    if (!['BUYER', 'VENDOR', 'FARMER'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only buyers and vendors can send purchase requests' });
    }

    const { listingId, quantity, offeredPrice, message } = req.body;

    if (!listingId || quantity === undefined) {
      return res.status(400).json({ message: 'Listing and quantity are required' });
    }

    if (!isValidObjectId(listingId)) {
      return res.status(400).json({ message: 'Invalid listing ID' });
    }

    if (Number(quantity) <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    const listing = await ProductListing.findById(listingId).populate('seller', 'role name email');
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'Listing is not active' });
    }

    if (listing.seller._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot buy your own listing' });
    }

    if (Number(quantity) > listing.quantity) {
      return res.status(400).json({
        message: `Requested quantity exceeds available quantity (${listing.quantity} ${listing.unit})`,
      });
    }

    const purchaseRequest = await PurchaseRequest.create({
      buyer: req.user._id,
      seller: listing.seller._id,
      listing: listing._id,
      quantity: Number(quantity),
      offeredPrice: offeredPrice !== undefined ? Number(offeredPrice) : listing.price,
      message: message ? String(message).trim() : '',
      status: 'PENDING',
    });

    const populated = await PurchaseRequest.findById(purchaseRequest._id)
      .populate('buyer', 'name email phone role location')
      .populate('seller', 'name email phone role location')
      .populate('listing');

    // Create notifications (non-blocking)
    const sellerRole = listing.seller.role;

    setImmediate(async () => {
      // Notification for buyer
      await notificationService.createNotification(
        req.user._id,
        req.user.role,
        'ORDER_PLACED',
        'Order Placed Successfully',
        `You placed an order for ${quantity} ${listing.unit} of ${listing.product}`,
        'PurchaseRequest',
        purchaseRequest._id
      );

      // Notification for seller
      await notificationService.createNotification(
        listing.seller._id,
        sellerRole,
        'NEW_ORDER_RECEIVED',
        'New Order Received',
        `${req.user.name} ordered ${quantity} ${listing.unit} of ${listing.product}`,
        'PurchaseRequest',
        purchaseRequest._id
      );
    });

    res.status(201).json(populated);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)
        .map((item) => item.message)
        .join(', ');
      return res.status(400).json({ message });
    }
    res.status(500).json({ message: 'Unable to create purchase request' });
  }
}

async function getMyPurchaseRequests(req, res) {
  try {
    const requests = await PurchaseRequest.find({ buyer: req.user._id })
      .populate('buyer', 'name email phone role location')
      .populate('seller', 'name email phone role location')
      .populate('listing')
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load purchase requests' });
  }
}

async function getSellingRequests(req, res) {
  try {
    const requests = await PurchaseRequest.find({ seller: req.user._id })
      .populate('buyer', 'name email phone role location')
      .populate('seller', 'name email phone role location')
      .populate('listing')
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load selling requests' });
  }
}

async function updatePurchaseRequestStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid purchase request ID' });
    }

    const allowedStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const purchaseRequest = await PurchaseRequest.findById(id);
    if (!purchaseRequest) {
      return res.status(404).json({ message: 'Purchase request not found' });
    }

    const isBuyer = purchaseRequest.buyer.toString() === req.user._id.toString();
    const isSeller = purchaseRequest.seller.toString() === req.user._id.toString();

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: 'Not authorized for this purchase request' });
    }

    if (status === 'CANCELLED') {
      if (!isBuyer) {
        return res.status(403).json({ message: 'Only the buyer can cancel this request' });
      }
      if (!['PENDING'].includes(purchaseRequest.status)) {
        return res.status(400).json({ message: 'Only pending requests can be cancelled' });
      }
    }

    if (['ACCEPTED', 'REJECTED', 'COMPLETED'].includes(status)) {
      if (!isSeller) {
        return res.status(403).json({ message: 'Only the seller can update this status' });
      }
    }

    if (status === 'ACCEPTED') {
      if (purchaseRequest.status !== 'PENDING') {
        return res.status(400).json({ message: 'Only pending requests can be accepted' });
      }

      const listing = await ProductListing.findById(purchaseRequest.listing);
      if (!listing || listing.status !== 'ACTIVE') {
        return res.status(400).json({ message: 'Listing is no longer active' });
      }

      if (purchaseRequest.quantity > listing.quantity) {
        return res.status(400).json({
          message: `Cannot accept: only ${listing.quantity} ${listing.unit} remaining`,
        });
      }

      listing.quantity -= purchaseRequest.quantity;
      if (listing.quantity === 0) {
        listing.status = 'SOLD';
      }
      await listing.save();
      purchaseRequest.status = 'ACCEPTED';
    } else if (status === 'COMPLETED') {
      if (purchaseRequest.status !== 'ACCEPTED') {
        return res.status(400).json({ message: 'Only accepted requests can be completed' });
      }
      purchaseRequest.status = 'COMPLETED';
    } else {
      purchaseRequest.status = status;
    }

    await purchaseRequest.save();

    const populated = await PurchaseRequest.findById(purchaseRequest._id)
      .populate('buyer', 'name email phone role location')
      .populate('seller', 'name email phone role location')
      .populate('listing');

    // Create notifications for status changes (non-blocking)
    setImmediate(async () => {
      if (status === 'ACCEPTED') {
        const listing = await ProductListing.findById(purchaseRequest.listing);
        const buyer = await User.findById(purchaseRequest.buyer).select('role');
        await notificationService.createNotification(
          purchaseRequest.buyer,
          buyer.role,
          'ORDER_ACCEPTED',
          'Order Accepted',
          `Your order for ${purchaseRequest.quantity} ${listing.unit} of ${listing.product} from ${populated.seller.name} has been accepted`,
          'PurchaseRequest',
          purchaseRequest._id
        );
      } else if (status === 'REJECTED') {
        const listing = await ProductListing.findById(purchaseRequest.listing);
        const buyer = await User.findById(purchaseRequest.buyer).select('role');
        await notificationService.createNotification(
          purchaseRequest.buyer,
          buyer.role,
          'ORDER_REJECTED',
          'Order Rejected',
          `Your order for ${purchaseRequest.quantity} ${listing.unit} of ${listing.product} has been rejected`,
          'PurchaseRequest',
          purchaseRequest._id
        );
      } else if (status === 'CANCELLED') {
        const listing = await ProductListing.findById(purchaseRequest.listing);
        const seller = await User.findById(purchaseRequest.seller).select('role');
        await notificationService.createNotification(
          purchaseRequest.seller,
          seller.role,
          'ORDER_CANCELLED',
          'Order Cancelled',
          `The order for ${purchaseRequest.quantity} ${listing.unit} of ${listing.product} has been cancelled by the buyer`,
          'PurchaseRequest',
          purchaseRequest._id
        );
      }
    });

    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Unable to update purchase request' });
  }
}

module.exports = {
  createPurchaseRequest,
  getMyPurchaseRequests,
  getSellingRequests,
  updatePurchaseRequestStatus,
};
