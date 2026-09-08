const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notificationController');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get unread count (must come before /:id to avoid route conflicts)
router.get('/unread-count', getUnreadCount);

// Mark all notifications as read (must come before /:id to avoid route conflicts)
router.patch('/read-all', markAllAsRead);

// Get user's notifications with pagination
router.get('/', getNotifications);

// Mark single notification as read
router.put('/:id/read', markAsRead);

module.exports = router;
