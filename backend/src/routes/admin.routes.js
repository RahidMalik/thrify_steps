/**
 * Admin Routes
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { admin } = require('../middlewares/admin.middleware');
const {
  getStats,
  getAllUsers,
  updateUserRole
} = require('../controllers/admin.controller');

// All routes require admin access
router.use(protect, admin);

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);

module.exports = router;
