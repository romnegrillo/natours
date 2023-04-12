const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
const reviewRouter = express.Router();

reviewRouter
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protectRoute,
    authController.restrictRouteTo('user'),
    reviewController.createReview
  );

reviewRouter.route('/:id').get(reviewController.getReview);

module.exports = reviewRouter;
