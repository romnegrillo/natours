const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/userModel");

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(201).send({
    message: "status",
    token: token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1.) Check if email and password exits.
  if (!email || !password) {
    return next(new AppError("Please provide a valid email and password", 400));
  }

  // 2.) Check if user exists and password is correct.
  const user = await User.findOne({ email: email }).select("+password");

  // 3.) If everything is correct, send token to the client.

  const token = "faketoken";

  res.status(200).send({
    message: "success",
    token: token,
    data: {
      user: user,
    },
  });
});
