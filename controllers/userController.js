const catchAsync = require('../utils/catchAsync');
const filterObj = require('../utils/filterObj');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    data: {
      users: users,
    },
  });
});

exports.updateMyProfile = catchAsync(async (req, res, next) => {
  // 1.) Create error if user POSTs a password    related data.
  if (req.body.password || req.body.passwordConfirmation) {
    return next(new AppError('Do not use this route to update password.', 400));
  }

  // 2. Get current user and update based on the POSTed data.
  // We need to filter the POSTed data to only include the valid
  // fields that can be updated.
  const filteredObj = filterObj(req.body, 'name', 'email');
  const user = await User.findByIdAndUpdate(req.user.id, filteredObj, {
    new: true,
    runValidators: true,
  });

  // 3. Get the required data to be
  res.status(200).json({
    status: 'success',
    message: 'Information updated.',
    user: user,
  });
});

exports.deleteMyProfile = catchAsync(async (req, res, next) => {
  // 1. Get current user and update it by settting the isActive
  // attribute to false. We don't really delete it incase the
  // user changed his mind of deleting the account just like
  // in most webapps.

  await User.findByIdAndUpdate(req.user.id, { isActive: false });

  res.status(204).json({ status: 'success', data: null });
});

exports.createUser = catchAsync(async (req, res) => {
  res.json({
    message: 'createUser',
  });
});

exports.getUser = catchAsync(async (req, res) => {
  res.json({
    message: 'getUser',
  });
});

exports.updateUser = catchAsync(async (req, res) => {
  res.json({
    message: 'updateUser',
  });
});

exports.deleteUser = catchAsync(async (req, res) => {
  res.json({
    message: 'deleteUser',
  });
});
