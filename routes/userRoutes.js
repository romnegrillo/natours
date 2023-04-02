const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const userRouter = express.Router();

// Authentication and authorization-related routes.
userRouter.post('/signup', authController.signUp);
userRouter.post('/login', authController.login);
userRouter.post('/forgotPassword', authController.forgotPassword);
userRouter.patch(
  '/resetPassword/:passwordResetToken',
  authController.resetPassword
);
userRouter.post(
  '/updateMyPassword',
  authController.protectRoute,
  authController.updateMyPassword
);

// User-related routes.
// The authentication is in different controller to
// separate the routes that needs token based logic.
userRouter.post(
  '/updateMyProfile',
  authController.protectRoute,
  userController.updateMyProfile
);

userRouter.delete(
  '/deleteMyProfile',
  authController.protectRoute,
  userController.deleteMyProfile
);

userRouter
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
userRouter
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = userRouter;
