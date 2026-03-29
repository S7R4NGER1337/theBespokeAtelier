const router = require('express').Router();
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth');
const {
  getClients,
  getClient,
  updateClient,
} = require('../controllers/clientController');

router.use(protect, restrictTo('admin'));

router.get('/', getClients);
router.get('/:id', param('id').isMongoId(), validate, getClient);
router.put(
  '/:id',
  param('id').isMongoId(),
  [
    body('name').optional().trim().notEmpty(),
    body('phone').optional().trim().notEmpty(),
    body('isVip').optional().isBoolean(),
  ],
  validate,
  updateClient
);

module.exports = router;
