const express = require('express');
const reviewController = require('../controllers/reviewController');

const reviewRouter = express.Router();

reviewRouter
  .route('/')
  .get(reviewController.getAllReviews)
  .post(reviewController.createReview);

reviewRouter.route('/:id').get(reviewController.getReview);

module.exports = reviewRouter;
