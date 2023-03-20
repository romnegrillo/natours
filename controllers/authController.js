const util = require("util");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/userModel");

const signToken = (userId) => {
  const signedToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return signedToken;
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  const token = signToken(newUser._id);

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
    return next(
      new AppError("Please provide a valid email and password!", 400)
    );
  }

  // 2.) Check if user exists and password is correct.
  const user = await User.findOne({ email: email }).select("+password");

  if (!user || !(await user.isPasswordCorrect(password, user.password))) {
    return next(new AppError("Invalid email or password!", 401));
  }

  // 3.) If everything is correct, send token to the client.
  const token = signToken(user._id);

  res.status(200).send({
    message: "success",
    token: token,
  });
});

exports.protectRoute = catchAsync(async (req, res, next) => {
  // 1.) Check if token exists.
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new Error("You are not logged in. Please login to get access!"),
      401
    );
  }

  // 2.) Check if token is valid.
  const decoded = await util.promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  // 3.) Check if user exists with that token.
  const user = await User.findOne({ _id: decoded.id });

  if (!user) {
    return next(
      new AppError("The id belonging to this user does not exists!", 401)
    );
  }

  // 4.) Check if user changed password after token was issued.
  const isPasswordChanged = await user.isPasswordChanged(decoded.iat);

  if (isPasswordChanged) {
    return next(
      new AppError(
        "Password has recently changed, please login again to gain access.",
        401
      )
    );
  }

  req.user = user;
  next();
});

exports.restrictRouteTo = (...roles) => {
  const wrapper = (req, res, next) => {
    const isAuthorized = roles.includes(req.user.role);

    if (!isAuthorized) {
      return next(
        new AppError("You don't have permission to access this route.", 401)
      );
    }

    next();
  };

  return wrapper;
};
