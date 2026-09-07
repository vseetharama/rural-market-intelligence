const mongoose = require('mongoose');

const LISTING_STATUSES = ['ACTIVE', 'SOLD', 'CANCELLED'];

const productListingSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller is required'],
    },
    product: {
      type: String,
      required: [true, 'Product is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity must be greater than or equal to 0'],
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be greater than or equal to 0'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    availableFrom: {
      type: Date,
      required: [true, 'Available from date is required'],
    },
    availableUntil: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: LISTING_STATUSES,
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ProductListing', productListingSchema);
module.exports.LISTING_STATUSES = LISTING_STATUSES;
