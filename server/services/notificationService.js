const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Creates a notification with duplicate prevention
 * @param {ObjectId} recipientId - ID of the notification recipient
 * @param {String} recipientRole - Role of the recipient (FARMER, BUYER, VENDOR)
 * @param {String} type - Notification type
 * @param {String} title - Notification title
 * @param {String} message - Notification message
 * @param {String} relatedEntityType - Type of related entity (PurchaseRequest, ProductListing)
 * @param {ObjectId} relatedEntityId - ID of the related entity
 * @returns {Promise<Object|null>} - Created notification or null if duplicate
 */
async function createNotification(
  recipientId,
  recipientRole,
  type,
  title,
  message,
  relatedEntityType,
  relatedEntityId
) {
  try {
    // Validate recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      console.error(`[Notification] Recipient not found: ${recipientId}`);
      return null;
    }

    // Check for duplicates: same recipient, type, and related entity within last 5 seconds
    const fiveSecondsAgo = new Date(Date.now() - 5000);
    const existingNotification = await Notification.findOne({
      recipient_id: recipientId,
      type,
      related_entity_id: relatedEntityId,
      createdAt: { $gte: fiveSecondsAgo },
    });

    if (existingNotification) {
      console.log(
        `[Notification] Duplicate prevented for recipient ${recipientId}, type ${type}, entity ${relatedEntityId}`
      );
      return null;
    }

    // Create the notification
    const notification = await Notification.create({
      recipient_id: recipientId,
      recipient_role: recipientRole,
      type,
      title,
      message,
      related_entity_type: relatedEntityType,
      related_entity_id: relatedEntityId,
      is_read: false,
    });

    console.log(`[Notification] Created notification ${notification._id} for recipient ${recipientId}`);
    return notification;
  } catch (error) {
    console.error('[Notification] Error creating notification:', error.message);
    return null;
  }
}

module.exports = {
  createNotification,
};
