const jwt = require("jsonwebtoken");

const createSendJwtToken = (userId, res, statusCode, message) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(statusCode).send({
    status: "success",
    message: message,
    token: token,
  });
};

module.exports = createSendJwtToken;
