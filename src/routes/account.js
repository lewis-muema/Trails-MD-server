/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');

const User = mongoose.model('User');
const Track = mongoose.model('Track');

const router = express.Router();
router.use(requireAuth);


router.post('/edit-account', async (req, res) => {
  const user = await User.findOne({ _id: req.user._id });
  user.password = req.body.password;
  if (req.body.role) {
    user.role = req.body.role;
  }
  await user.save();
  res.status(200).send({ message: 'User account edited successfully', user: user.email });
});

router.delete('/delete-account', async (req, res) => {
  try {
    const trails = await Track.find({ userId: req.user._id });
    const trailIds = trails.map(({ id }) => id);
    const track = await Track.deleteMany({ _id: { $in: trailIds } });
    if (!track.acknowledged) {
      return res.status(400).send({ message: 'Failed to delete this account, Please try again later' });
    }
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
