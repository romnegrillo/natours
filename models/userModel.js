const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please tell us your email!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Invalid email address!'],
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
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
      message: 'Password confirmation is not the same as password!',
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  isActive: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// DOCUMENT MIDDLEWARE.
// It runs before or after the .save() and .create() method.
userSchema.pre('save', async function (next) {
  // Hash the password everytime a new user is created
  // or existing user modified the password.

  // Only run this function if password is modified.
  if (!this.isModified('password')) {
    return next();
  }

  // Hash the password and delete the password confirmation.
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre('save', function (next) {
  // If password is changed, update the passwordChangedAt time property.
  if (!this.isModified('password') || this.isNew) {
    return next();
  }

  this.passwordChangedAt = Date.now();

  next();
});

userSchema.pre(/^find/, function (next) {
  // Only return the active users. Becase when we delete users,
  // we don't actually delete it, we set isActive to false.
  this.find({ isActive: true });

  next();
});

// INSTANCE METHODS.
// Can be directly called by the query instance in
// the controllers.
userSchema.methods.isPasswordCorrect = async function (
  // Function to check if input password is the same
  // as the password in the database. This can placed in the
  // cotroller but as always, follow "Fat controllers thin views."
  inputPassword,
  actualPassword
) {
  return await bcrypt.compare(inputPassword, actualPassword);
};

userSchema.methods.isPasswordChanged = async function (jwtTimeStamp) {
  // If passwordChangedAt property does not exists in the current user,
  // password has not been changed yet, return false immediately.
  if (this.passwordChangedAt) {
    // Check if password changed time is greater than the jwtTimeStamp.
    // If it is, that means the password has been changed, return true,
    // else return false.

    // Convert the passwordChangedAt to to timestamp format.
    const passwordChangedAtTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return passwordChangedAtTimeStamp > jwtTimeStamp;
  }

  return false;
};

userSchema.methods.createRandomResetToken = function () {
  // Generate random string and encrypt it.
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Make the reset password to be available 10 minutes only.
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// THe User model.
const User = mongoose.model('User', userSchema);

module.exports = User;
