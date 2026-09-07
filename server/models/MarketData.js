const mongoose = require('mongoose');

const marketDataSchema = new mongoose.Schema(
  {
    product: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      validate: {
        validator: (value) => value && value.trim().length > 0,
        message: 'Product must not be empty',
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      validate: {
        validator: (value) => value && value.trim().length > 0,
        message: 'Category must not be empty',
      },
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be greater than or equal to 0'],
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
      validate: {
        validator: (value) => value && value.trim().length > 0,
        message: 'Unit must not be empty',
      },
    },
    demand: {
      type: Number,
      required: [true, 'Demand is required'],
      min: [0, 'Demand must be greater than or equal to 0'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      validate: {
        validator: (value) => value && value.trim().length > 0,
        message: 'Location must not be empty',
      },
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      validate: {
        validator: (value) => value instanceof Date && !Number.isNaN(value.getTime()),
        message: 'Date must be a valid date',
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MarketData', marketDataSchema);
