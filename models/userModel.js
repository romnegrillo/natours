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
  passwordChangedAt: {
    type: Date,
  },
});

// Called when before save() or create() in User model in the controller.
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

// Function to check if input password is the same
// as the password in the database. This can placed in the
// cotroller but as always, follow "Fat controllers thin views."
userSchema.methods.isPasswordCorrect = async function (
  inputPassword,
  actualPassword
) {
  return await bcrypt.compare(inputPassword, actualPassword);
};

userSchema.methods.isPasswordChanged = async function (jwtTimeStamp) {
  // If passwordChangedAt property does not exists in the current user,
  // password has not been changed yet, return false immediately.
  if (!this.passwordChangedAt) {
    // Check if password changed time is greater than the jwtTimeStamp.
    // If it is, that means the password has been changed, return true,
    // else return false.
    console.log(jwtTimeStamp);

    return true;
  }

  return false;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
