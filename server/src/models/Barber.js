const mongoose = require('mongoose');

const barberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name too long'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    tier: {
      type: String,
      enum: ['junior', 'senior', 'master'],
      required: [true, 'Tier is required'],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio too long'],
    },
    image: {
      type: String,
      default: '',
    },
    // Extra charge on top of base service price (in pence/stotinki)
    tierSurcharge: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

barberSchema.index({ tier: 1, isActive: 1 });

module.exports = mongoose.model('Barber', barberSchema);
