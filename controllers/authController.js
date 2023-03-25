const util = require("util");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");
const createSendJwtToken = require("../utils/createSendJwtToken");
const User = require("../models/userModel");

exports.signUp = catchAsync(async (req, res, next) => {
  // Get the required data and create it in the database.
  // Validators are in the model.
  // Password encryption is in the model as well.
  const { name, email, password, passwordConfirm } = req.body;

  const user = await User.create({
    name: name,
    email: email,
    password: password,
    passwordConfirm: passwordConfirm,
  });

  createSendJwtToken(user, res, 201, "Account created.");
});

exports.login = catchAsync(async (req, res, next) => {
  // 1.) Check if email and password exists.
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new AppError("Please provide a valid email and password!", 400)
    );
  }

  // 2.) Check if user exists and password is correct.
  // We select the password explicitly because it is
  // hidden by default from the model (select: false).
  const user = await User.findOne({ email: email }).select("+password");

  if (!user || !(await user.isPasswordCorrect(password, user.password))) {
    return next(new AppError("Invalid email or password!", 401));
  }

  // 3.) If everything is correct, send token to the client.
  createSendJwtToken(user, res, 201, "Use the JWT for authentication.");
});

exports.protectRoute = catchAsync(async (req, res, next) => {
  // 1.) Check if token exists.
  const authorizationHeader = req.headers.authorization;
  let token;

  if (authorizationHeader && authorizationHeader.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in. Please login to get access!", 401)
    );
  }

  // 2.) Check if token is valid by finding the associated user with it.
  const decoded = await util.promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  const user = await User.findOne({ _id: decoded.id });

  if (!user) {
    return next(new AppError("Invalid token!", 401));
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

  // 5.) Save the user object for the next in the middleware
  // so they'll have copy of the current authenticated user.
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

  // 2.) Generate password reset token and its expiry time.
  const token = user.createRandomResetToken();

  // 3.) Save password reset token to the current user instance.
  // Validator will be off so the required files won't trigger errors.
  await user.save({ validateBeforeSave: false });

  // 4.) Send email of the reset link.
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${token}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and password confirm to ${resetUrl}. This link is only available for 10 minutes.`;

  // We manually catch the error here rather than allowing the global error
  // handler to do it because we need to clear the password reset token
  // and its expiration time when an error happens.
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token.",
      message: message,
    });

    res.status(200).json({
      status: "success",
      message: "Password reset link has been sent to your email.",
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

  createSendJwtToken(user, res, 201, "Password has been reset successfully.");
});

exports.updateMyPassword = catchAsync(async (req, res, next) => {
  // 1.) Get logged in user.
  // We select the password explicitly because it is
  // hidden by default from the model (select: false).
  const user = await User.findOne({ _id: req.user.id }).select("+password");

  // 2.) Getcurrent password and check if it is correct.
  const { passwordCurrent } = req.body;

  if (!passwordCurrent) {
    return next(new AppError("Please provide your old password.", 401));
  }

  if (!(await user.isPasswordCorrect(passwordCurrent, user.password))) {
    return next(new AppError("Old password is incorrect!", 400));
  }

  // 4.) Update password.
  // Validators are in the model.
  const { passwordNew, passwordConfirmNew } = req.body;

  user.password = passwordNew;
  user.passwordConfirm = passwordConfirmNew;

  await user.save();

  // 5.) Generate new authorization token.

  createSendJwtToken(user, res, 201, "Your password has been updated.");
});
