const express = require("express");
const morgan = require("morgan");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

console.log("DEBUG");
console.log(globalErrorHandler);

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();
app.use(express.static(`${__dirname}/dev-data/`));

// Middlewares.
app.use((req, res, next) => {
  console.log("Hello from middleware.");
  next();
});
app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log("You are in developer mode. Morgan logger running...");
}

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
