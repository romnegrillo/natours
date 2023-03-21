const util = require("util");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");
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
      new AppError("You are not logged in. Please login to get access!", 401)
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

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1.) Get user from email.
  const { email } = req.body;
  const user = await User.findOne({ email: email });

  if (!user) {
    return next(new AppError("User with that email is not registered.", 401));
  }

  // 2.) Generate password reset token.
  const token = user.createRandomResetToken();

  // 3.) Save password reset token to the current user instance.
  // The token and its expiration time is already saved in the
  // createRandomResetToken function.
  // Validator will be off so the required files won't trigger errors.
  await user.save({ validateBeforeSave: false });

  // 4.) Send email of the reset link.
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${token}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and password confirm to ${resetUrl}. This link is only available for 10 minutes.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token.",
      message: message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email.",
    });
  } catch (err) {
    // Set the token and token expiration to none.
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new AppError("Error sending email.", 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1.) Get user based on token and check if the the time is greater than its expiration.
  const { passwordResetToken } = req.params;
  const hashedToken = crypto
    .createHash("sha256")
    .update(passwordResetToken)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2. If token has not expired and there is user, set the new password.
  if (!user) {
    return next(new AppError("Invalid or expired token.", 400));
  }

  // 3.) Update the changePassword at time.
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 4.) Log the user in, send JWT.
  const jwtToken = signToken(user.id);

  res.status(200).json({
    status: "success",
    token: jwtToken,
  });
});

exports.updatePassword = (req, res, next) => {
  console.log(req.user);
  res.status(200).json({
    message: "updatePassword",
  });
};
