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

router.delete('/delete-account', async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.user._id });
    if (user) {
      res.status(200).send({
        email: user.email, message: 'This account has been deleted',
      });
    } else {
      res.status(200).send({ message: 'This account cannot be found' });
    }
  } catch (err) {
    res.status(400).send({ message: 'Failed to delete this account, Please try again later' });
  }
});

module.exports = router;
