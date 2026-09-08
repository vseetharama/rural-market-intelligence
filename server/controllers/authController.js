const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken } = require('../middleware/auth');

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

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};
