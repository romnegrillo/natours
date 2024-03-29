const mongoose = require('mongoose');
const Tour = require('./tourModel');
const User = require('./userModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty.'],
      maxlength: 500,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

// QUERY MIDDLEWARE.
reviewSchema.pre(/^find/, function (next) {
  // Populate the referenced document.

  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

// The Review model.
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
