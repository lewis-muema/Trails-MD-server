/* eslint-disable */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { promise, reject } = require('bcrypt/promises');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Hash password with salt before saving to DB
userSchema.pre('save', function(next) {
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }

  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }

    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  })
});

// Authenticate hashed password from DB against hashed user password using bcrypt
userSchema.methods.comparePassword = async function(candidatePassword) {
  const user = this;
  const hashedPassword = await new Promise((resolve, reject) => {
   bcrypt.compare(candidatePassword, user.password, (err, isMatch) => {
    if (err) {
      reject(err);
    }
    resolve(isMatch);
    });
  });
  return hashedPassword;
}

mongoose.model('User', userSchema);
