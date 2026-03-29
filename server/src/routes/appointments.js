const router = require('express').Router();
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, restrictTo } = require('../middleware/auth');
const { bookingLimiter } = require('../middleware/rateLimiter');
const {
  getAppointments,
  getAppointment,
  getAvailableSlots,
  createAppointment,
  updateStatus,
  getStats,
} = require('../controllers/appointmentController');

// Public routes
router.get('/available-slots', getAvailableSlots);

router.post(
  '/',
  bookingLimiter,
  [
    body('clientName').trim().notEmpty().withMessage('Name required').isLength({ max: 100 }),
    body('clientPhone')
      .trim()
      .notEmpty()
      .withMessage('Phone required')
      .matches(/^\+?[\d\s\-().]{7,20}$/)
      .withMessage('Invalid phone'),
    body('barberId').isMongoId().withMessage('Invalid barber'),
    body('serviceId').isMongoId().withMessage('Invalid service'),
    body('date').isISO8601().withMessage('Invalid date'),
    body('timeSlot')
      .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
      .withMessage('Invalid time slot'),
    body('notes').optional().trim().isLength({ max: 500 }),
  ],
  validate,
  createAppointment
);

// Admin routes
router.use(protect, restrictTo('admin'));

router.get('/stats', getStats);
router.get('/', getAppointments);
router.get('/:id', param('id').isMongoId(), validate, getAppointment);
router.patch(
  '/:id/status',
  param('id').isMongoId(),
  body('status')
    .isIn(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'])
    .withMessage('Invalid status'),
  validate,
  updateStatus
);

module.exports = router;
