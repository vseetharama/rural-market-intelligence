const mongoose = require('mongoose');

const REQUEST_STATUSES = ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED'];

const purchaseRequestSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Buyer is required'],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller is required'],
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductListing',
      required: [true, 'Listing is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.01, 'Quantity must be greater than 0'],
    },
    offeredPrice: {
      type: Number,
      required: [true, 'Offered price is required'],
      min: [0, 'Offered price must be greater than or equal to 0'],
    },
    message: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: REQUEST_STATUSES,
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PurchaseRequest', purchaseRequestSchema);
module.exports.REQUEST_STATUSES = REQUEST_STATUSES;
