const jwt = require("jsonwebtoken");

const createSendJwtToken = (user, res, statusCode, message) => {
  // 1.) Create the token.
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  // 2.) Create cookie option and send it via cookie.
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.environment === "production") {
    cookieOptions.secure = true;
  }

  res.cookie("jwt", token, cookieOptions);

  // 3.) Send response hide password by setting it to undefined.
  // This won't save it, it's just for the sake of hiding
  // the password before sending the response.

  user.password = undefined;
  res.status(statusCode).send({
    status: "success",
    message: message,
    token: token,
    data: {
      user: user,
    },
  });
};

module.exports = createSendJwtToken;
