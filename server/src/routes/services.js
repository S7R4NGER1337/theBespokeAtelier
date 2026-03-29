const router = require('express').Router();
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth');
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');

const serviceValidation = [
  body('name').trim().notEmpty().withMessage('Name required').isLength({ max: 100 }),
  body('category').isIn(['haircut', 'beard', 'facial']).withMessage('Invalid category'),
  body('duration').isInt({ min: 5 }).withMessage('Duration must be at least 5 minutes'),
  body('pricing.junior').isInt({ min: 0 }).withMessage('Junior price required'),
  body('pricing.senior').isInt({ min: 0 }).withMessage('Senior price required'),
  body('pricing.master').isInt({ min: 0 }).withMessage('Master price required'),
];

router.get('/', getServices);
router.get('/:id', param('id').isMongoId(), validate, getService);

router.use(protect, restrictTo('admin'));
router.post('/', serviceValidation, validate, createService);
router.put('/:id', param('id').isMongoId(), serviceValidation, validate, updateService);
router.delete('/:id', param('id').isMongoId(), validate, deleteService);

module.exports = router;
