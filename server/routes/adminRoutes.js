const express = require('express');
const { authenticate, requireRoles } = require('../middleware/auth');
const { getAllUsers, getUserById, getAdminStats } = require('../controllers/adminController');

const router = express.Router();

router.use(authenticate, requireRoles('ADMIN'));

router.get('/users', getAllUsers);
router.get('/users/:userId', getUserById);
router.get('/stats', getAdminStats);

module.exports = router;
