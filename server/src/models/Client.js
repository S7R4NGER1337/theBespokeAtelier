const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name too long'],
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
      match: [/^\+?[\d\s\-().]{7,20}$/, 'Invalid phone number'],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
      default: '',
    },
    isVip: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes too long'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual to count appointments (populated on demand)
clientSchema.virtual('appointments', {
  ref: 'Appointment',
  localField: '_id',
  foreignField: 'client',
});

clientSchema.index({ phone: 1 });
clientSchema.index({ name: 'text' });

module.exports = mongoose.model('Client', clientSchema);
