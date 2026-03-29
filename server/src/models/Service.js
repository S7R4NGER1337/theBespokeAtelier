const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Name too long'],
    },
    category: {
      type: String,
      enum: ['haircut', 'beard', 'facial'],
      required: [true, 'Category is required'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description too long'],
    },
    duration: {
      type: Number, // minutes
      required: [true, 'Duration is required'],
      min: [5, 'Duration must be at least 5 minutes'],
    },
    // Prices in smallest currency unit (e.g. pence / stotinki)
    pricing: {
      junior: { type: Number, required: true, min: 0 },
      senior: { type: Number, required: true, min: 0 },
      master: { type: Number, required: true, min: 0 },
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

serviceSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Service', serviceSchema);
