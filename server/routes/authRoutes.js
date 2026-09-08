const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  initiatePasswordReset,
} = require('../controllers/authController');
const { authenticate, requireRoles } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateProfile);
router.post('/initiate-password-reset', authenticate, requireRoles('ADMIN'), initiatePasswordReset);

module.exports = router;
