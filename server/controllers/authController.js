const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { signToken } = require('../middleware/auth');
const { sendPasswordResetEmail } = require('../services/emailService');

function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return 'Password is required';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  return null;
}

async function register(req, res) {
  try {
    const { name, email, phone, password, role, location } = req.body;

    if (!name || !email || !phone || !password || !role || !location) {
      return res.status(400).json({ message: 'All registration fields are required' });
    }

    // Reject ADMIN role during registration
    if (role === 'ADMIN') {
      return res.status(400).json({ message: 'ADMIN role cannot be assigned during registration' });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      passwordHash,
      role,
      location: location.trim(),
    });

    const token = signToken(user);
    res.status(201).json({
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)
        .map((item) => item.message)
        .join(', ');
      return res.status(400).json({ message });
    }

    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    res.status(500).json({ message: 'Unable to register user' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user);
    res.status(200).json({
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to login' });
  }
}

async function getMe(req, res) {
  res.status(200).json(req.user.toSafeObject());
}

async function updateProfile(req, res) {
  try {
    const { name, phone, location } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = String(name).trim();
    if (phone !== undefined) updates.phone = String(phone).trim();
    if (location !== undefined) updates.location = String(location).trim();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No profile fields provided' });
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(user.toSafeObject());
  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)
        .map((item) => item.message)
        .join(', ');
      return res.status(400).json({ message });
    }

    res.status(500).json({ message: 'Unable to update profile' });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      user.passwordResetToken = resetTokenHash;
      user.passwordResetExpires = Date.now() + 60 * 60 * 1000;
      await user.save();

      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      await sendPasswordResetEmail(user.email, resetToken, clientUrl);
    }

    res.status(200).json({
      message: 'If the account exists, a password reset link has been sent.',
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to process password reset request' });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Token, new password, and confirmation are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const resetTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: resetTokenHash,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to reset password' });
  }
}

async function initiatePasswordReset(req, res) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findById(userId).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    await sendPasswordResetEmail(user.email, resetToken, clientUrl);

    res.status(200).json({
      message: 'Password reset email has been sent to the user',
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to initiate password reset' });
  }
}

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  initiatePasswordReset,
};
