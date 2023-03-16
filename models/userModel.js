const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name!"],
  },
  email: {
    type: String,
    required: [true, "Please tell us your email"],
    unique: true,
    lowercase: true,
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  passwordConfirm: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
