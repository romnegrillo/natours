const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const filterObj = require('../utils/filterObj');

exports.getAllReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find();

  res.status(200).json({
    status: 'success',
    data: {
      reviews: reviews,
    },
  });
});

exports.getReview = catchAsync(async (req, res) => {
  const review = await Review.findById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      review: review,
    },
  });
});

exports.createReview = catchAsync(async (req, res) => {
  const review = filterObj(req.body, 'review', 'rating', 'tour', 'user');

  const newReview = await Review.create(review);
  console.log(newReview);
  res.status(200).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});
