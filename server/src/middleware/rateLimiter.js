const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
  });

// Strict limiter for auth endpoints
const authLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  20,
  'Too many attempts, please try again in 15 minutes'
);

// General API limiter
const apiLimiter = createLimiter(
  60 * 1000, // 1 minute
  100,
  'Too many requests, please slow down'
);

// Public booking endpoint
const bookingLimiter = createLimiter(
  60 * 60 * 1000, // 1 hour
  30,
  'Booking limit reached, please try again later'
);

module.exports = { authLimiter, apiLimiter, bookingLimiter };
