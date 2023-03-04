const mongoose = require("mongoose");
const slugify = require("slugify");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name."],
      unique: true,
    },
    slug: {
      type: String,
    },
    duration: {
      type: Number,
      required: [true, "A tour must have a duration."],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a max group size."],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty."],
    },
    ratingsAverage: {
      type: Number,
      default: 0.0,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price."],
    },
    discount: {
      type: Number,
      default: 0,
    },
    summary: {
      type: String,
      required: [true, "A tour must have a summary."],
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have an image."],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
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

// Virtul property.
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

// Document middleware.
// It runs before the .save() command and .create() method.
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.post("save", function (doc, next) {
  console.log("Document has been created!");
  next();
});

tourSchema.post("save", function (doc, next) {
  console.log(doc);
  next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
