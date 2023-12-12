/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const User = mongoose.model('User');

const router = express.Router();
const expiry = '24h';

router.post('/signup', (req, res) => {
  const { email, password } = req.body;
  const user = new User({ email, password });
  user.save().then(() => {
    const token = jwt.sign({ userId: user._id }, 'SECRET', { expiresIn: expiry });
    res.status(200).send({ message: 'User created successfully', token });
  }).catch((err) => {
    if (err.message.includes('duplicate key')) {
      res.status(400).send({ message: 'This email account already exists' });
    } else if (err.message.includes('User validation failed')) {
      res.status(400).send({ message: 'Please make sure you are sending the required fields' });
    } else {
      res.status(400).send({ message: err.message });
    }
  });
});

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(401).send({ message: 'Please provide the email and password' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).send({ message: 'Email not found' });
  }

  user.comparePassword(password).then((status) => {
    if (status) {
      const token = jwt.sign({ userId: user._id }, 'SECRET', { expiresIn: expiry });
      res.status(200).send({ token, message: 'Successfully logged in' });
    } else {
      res.status(401).send({ message: 'Invalid email or password' });
    }
  }).catch(() => {
    res.status(401).send({ message: 'Invalid email or password' });
  });
});

module.exports = router;
