// Returns a new function that will be assigned
// to the controllers. It handles the catching the
// error and automatically pass the error object
// to the next function so it will call the
// global error handler.
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};

module.exports = catchAsync;
