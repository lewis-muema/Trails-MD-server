/* eslint-disable no-underscore-dangle */
const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');

const User = mongoose.model('User');

const router = express.Router();
router.use(requireAuth);


router.post('/reset-password', async (req, res) => {
  const user = await User.findOne({ _id: req.user._id });
  user.password = req.body.password;
  await user.save();
  res.status(200).send({ message: 'User password changed successfully', user: user.email });
});

module.exports = router;
