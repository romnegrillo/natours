const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    data: {
      users: users,
    },
  });
});

exports.createUser = catchAsync(async (req, res) => {
  res.json({
    message: "createUser",
  });
});

exports.getUser = catchAsync(async (req, res) => {
  res.json({
    message: "getUser",
  });
});

exports.updateUser = catchAsync(async (req, res) => {
  res.json({
    message: "updateUser",
  });
});

exports.deleteUser = catchAsync(async (req, res) => {
  res.json({
    message: "deleteUser",
  });
});
