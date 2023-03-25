const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");

// Import routes.
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

// App instance.
const app = express();

// Global middlewares.
app.use(express.static(`${__dirname}/dev-data/`));

// 1.) Helmet for setting https headers.
app.use(helmet());

// 2.) Morgan for logging requests.
app.use(express.json());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// 3.) Rate limiting.
const limiter = rateLimit({
  max: 10,
  windowMs: 60 * 60 * 100, // in milliseconds
  message: "Too many requests from this IP, please try again in an hour.",
});
app.use("/api/v1", limiter);

// 4.) Test middleware.
app.use((req, res, next) => {
  console.log("Hello from middleware.");
  next();
});

// Routers.
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

// Route that will match if it doesn't match anything above.
app.all("*", (req, res, next) => {
  // res.status(404).json({
  //   status: "fail",
  //   message: `Can't find ${req.url} on this server!`,
  // });

  next(new AppError(`Can't find ${req.url} on this server`, 404));
});

// Global error handler.
// If 4 arguments has been passed in the callback function
// inside app.use, it will be automatically treated as the
// global error handler.
app.use(globalErrorHandler);

module.exports = app;
