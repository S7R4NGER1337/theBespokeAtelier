const router = require('express').Router();
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth');
const {
  getBarbers,
  getBarber,
  createBarber,
  updateBarber,
  deleteBarber,
} = require('../controllers/barberController');

const barberValidation = [
  body('name').trim().notEmpty().withMessage('Name required').isLength({ max: 100 }),
  body('title').trim().notEmpty().withMessage('Title required'),
  body('tier').isIn(['junior', 'senior', 'master']).withMessage('Invalid tier'),
  body('tierSurcharge').isInt({ min: 0 }).withMessage('Surcharge must be non-negative'),
];

router.get('/', getBarbers);
router.get('/:id', param('id').isMongoId(), validate, getBarber);

router.use(protect, restrictTo('admin'));
router.post('/', barberValidation, validate, createBarber);
router.put('/:id', param('id').isMongoId(), barberValidation, validate, updateBarber);
router.delete('/:id', param('id').isMongoId(), validate, deleteBarber);

module.exports = router;
