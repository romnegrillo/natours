const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name!"],
  },
  email: {
    type: String,
    required: [true, "Please tell us your email!"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Invalid email address!"],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: true,
    validate: {
      validator: function (currentValue) {
        return currentValue === this.password;
      },
      message: "Password confirmation is not the same as password!",
    },
  },
});

userSchema.pre("save", async function (next) {
  // Only run this function if password is modified.
  if (!this.isModified("password")) {
    return next();
  }

  // Has the password and delete the password confirmation.
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
