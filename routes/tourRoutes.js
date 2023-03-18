const express = require("express");
const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");

const tourRouter = express.Router();

tourRouter
  .route("/top-5-cheap")
  .get(tourController.getTop5Cheap, tourController.getAllTours);

tourRouter.route("/get-tour-stats").get(tourController.getTourStats);

tourRouter.route("/monthly-plan/:year").get(tourController.getMonthlyPlan);

tourRouter
  .route("/")
  .get(authController.protectRoute, tourController.getAllTours)
  .post(tourController.createTour);

tourRouter
  .route("/:id")
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = tourRouter;
