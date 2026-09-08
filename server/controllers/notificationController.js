const mongoose = require('mongoose');
const Notification = require('../models/Notification');

/**
 * Get user's notifications with pagination
 * GET /api/notifications?skip=0&limit=20
 */
async function getNotifications(req, res) {
  try {
    const skip = Math.max(0, parseInt(req.query.skip || 0));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || 20)));

    const notifications = await Notification.find({ recipient_id: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Notification.countDocuments({ recipient_id: req.user._id });

    res.status(200).json({
      notifications,
      pagination: {
        skip,
        limit,
        total,
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    console.error('[Notification] Error fetching notifications:', error.message);
    res.status(500).json({ message: 'Unable to fetch notifications' });
  }
}

/**
 * Get count of unread notifications for user
 * GET /api/notifications/unread-count
 */
async function getUnreadCount(req, res) {
  try {
    const count = await Notification.countDocuments({
      recipient_id: req.user._id,
      is_read: false,
    });

    res.status(200).json({ unread_count: count });
  } catch (error) {
    console.error('[Notification] Error fetching unread count:', error.message);
    res.status(500).json({ message: 'Unable to fetch unread count' });
  }
}

/**
 * Mark a single notification as read
 * PUT /api/notifications/:id/read
 */
async function markAsRead(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid notification ID' });
    }

    const notification = await Notification.findOne({
      _id: id,
      recipient_id: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.is_read = true;
    await notification.save();

    res.status(200).json(notification);
  } catch (error) {
    console.error('[Notification] Error marking notification as read:', error.message);
    res.status(500).json({ message: 'Unable to mark notification as read' });
  }
}

/**
 * Mark all user's notifications as read
 * PATCH /api/notifications/read-all
 */
async function markAllAsRead(req, res) {
  try {
    const result = await Notification.updateMany(
      { recipient_id: req.user._id, is_read: false },
      { is_read: true }
    );

    res.status(200).json({
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('[Notification] Error marking all notifications as read:', error.message);
    res.status(500).json({ message: 'Unable to mark notifications as read' });
  }
}

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
