const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { ROLES } = require('../config/constants');

// Public catalog routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Protected management routes (Admin & Manager)
router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MANAGER),
  productController.createProduct
);

router.put(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.MANAGER),
  productController.updateProduct
);

router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  productController.deleteProduct
);

module.exports = router;