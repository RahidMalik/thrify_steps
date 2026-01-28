/**
 * Promo Code Routes
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { admin } = require('../middlewares/admin.middleware');
const {
  validatePromoCode,
  getAllPromoCodes,
  getPromoCode,
  createPromoCode,
  updatePromoCode,
  deletePromoCode
} = require('../controllers/promoCode.controller');

// Public route
router.post('/validate', validatePromoCode);

// Admin routes
router.use(protect, admin);
router.get('/', getAllPromoCodes);
router.get('/:id', getPromoCode);
router.post('/', createPromoCode);
router.put('/:id', updatePromoCode);
router.delete('/:id', deletePromoCode);

module.exports = router;
