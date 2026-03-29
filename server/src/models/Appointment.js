const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    barber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Barber',
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    // "HH:MM" format e.g. "10:00"
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Invalid time slot format'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
      default: 'pending',
    },
    // Price in smallest currency unit at time of booking
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes too long'],
    },
    cancelledAt: Date,
    cancelReason: {
      type: String,
      trim: true,
      maxlength: [300, 'Cancel reason too long'],
    },
  },
  { timestamps: true }
);

// Prevent double-booking: same barber + date + timeSlot (only for non-cancelled)
appointmentSchema.index(
  { barber: 1, date: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $nin: ['cancelled', 'no_show'] },
    },
  }
);

appointmentSchema.index({ date: 1, status: 1 });
appointmentSchema.index({ client: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
