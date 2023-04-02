const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name.'],
      unique: true,
      minlength: [10, 'A tour must have minimum of 10 characters.'],
      maxlength: [20, 'A tour must have maximum of 20 characters.'],
      //validate: [validator.isAlpha, "Tour name must only contain characters."],
    },
    slug: {
      type: String,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration.'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a max group size.'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty.'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty must easy, medium, or difficult.',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 0.0,
      min: [1, 'Rating should be greater than zero.'],
      max: [5, 'Rating should be lower than 5.'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price.'],
    },
    discount: {
      type: Number,
      default: 0,
      validate: {
        validator: function (val) {
          // This will only work on creating a new document, not updating it.
          return this.price >= val;
        },
        message:
          'Discount price ({VALUE}) should be below or equal to the regular price.',
      },
    },
    summary: {
      type: String,
      required: [true, 'A tour must have a summary.'],
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have an image.'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: { type: String, default: 'Point', enum: ['Point'] },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        // GeoJSON
        type: { type: String, default: 'Point', enum: ['Point'] },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

// VIRTUAL PROPERTY.
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE.
// It runs before or after the .save() and .create() method.
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.post('save', function (doc, next) {
  console.log('Document has been created!');
  next();
});

tourSchema.post('save', function (doc, next) {
  console.log(this);
  next();
});

// QUERY MIDDLEWARE.
// It runs before or after query.
tourSchema.pre(/^find/, function (next) {
  // Running the query automatically applies before
  // going into the next middleware or in the controllers.
  this.find({ secretTour: { $ne: true } });
  this.startTime = Date.now();

  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

tourSchema.post(/^find/, function (doc, next) {
  console.log(`Query took ${Date.now() - this.startTime} ms.`);
  next();
});

// AGGREGATION MIDDLEWARE.
// It runs before or after aggragation has been performed.
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

  console.log(this.pipeline());
  next();
});

// The Tour model.
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
