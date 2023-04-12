const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const filterObj = require('../utils/filterObj');

exports.getAllReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find();

  res.status(200).json({
    status: 'success',
    length: reviews.length,
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
  const newReviewObj = filterObj(req.body, 'review', 'rating', 'tour');
  newReviewObj.user = req.user._id;

  const review = await Review.create(newReviewObj);

  res.status(200).json({
    status: 'success',
    data: {
      review: review,
    },
  });
});
