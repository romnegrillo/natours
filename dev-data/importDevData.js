const fs = require("fs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Tour = require("../models/tourModel");

dotenv.config({ path: `${__dirname}/../config.env` });

const DB = process.env.DATABASE.replace(
  "<DATABASE_PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to database.");
  });

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/data/tours-simple.json`, "utf8")
);

const insertData = async () => {
  try {
    await Tour.create(tours);
    console.log("Tours inserted successfully.");
    process.exit(0);
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log("Tours deleted successfully.");
    process.exit(0);
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === "--insert") {
  insertData();
} else if (process.argv[2] === "--delete") {
  deleteData();
} else {
  console.log("Not command sent.");
}
