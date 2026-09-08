const mongoose = require('mongoose');

const NOTIFICATION_TYPES = [
  'ORDER_PLACED',
  'ORDER_ACCEPTED',
  'ORDER_REJECTED',
  'ORDER_CANCELLED',
  'NEW_ORDER_RECEIVED',
];

const ENTITY_TYPES = ['PurchaseRequest', 'ProductListing'];

const notificationSchema = new mongoose.Schema(
  {
    recipient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
    },
    recipient_role: {
      type: String,
      enum: {
        values: ['FARMER', 'BUYER', 'VENDOR'],
        message: 'Recipient role must be FARMER, BUYER, or VENDOR',
      },
      required: [true, 'Recipient role is required'],
    },
    type: {
      type: String,
      enum: {
        values: NOTIFICATION_TYPES,
        message: `Type must be one of: ${NOTIFICATION_TYPES.join(', ')}`,
      },
      required: [true, 'Notification type is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    related_entity_type: {
      type: String,
      enum: {
        values: ENTITY_TYPES,
        message: `Related entity type must be one of: ${ENTITY_TYPES.join(', ')}`,
      },
      required: [true, 'Related entity type is required'],
    },
    related_entity_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Related entity ID is required'],
    },
    is_read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
notificationSchema.index({ recipient_id: 1 });
notificationSchema.index({ recipient_id: 1, is_read: 1 });
notificationSchema.index({ recipient_id: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
module.exports.ENTITY_TYPES = ENTITY_TYPES;
