/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');

const Track = mongoose.model('Track');

const router = express.Router();

// Makes sure all routes in this file will only work if youre logged in
router.use(requireAuth);

router.get('/tracks', async (req, res) => {
  const tracks = await Track.find({ userId: req.user._id });
  const filteredTracks = [];
  tracks.forEach((track) => {
    filteredTracks.push({
      name: track.name,
      locations: track.locations,
    });
  });
  if (filteredTracks.length > 0) {
    res.status(200).send({ tracks: filteredTracks, message: 'Tracks fetched successfully' });
  } else {
    res.status(404).send({ message: 'No tracks found' });
  }
});

router.post('/tracks', async (req, res) => {
  const { name, locations } = req.body;

  if (!name || !(locations && Array.isArray(locations) && locations.length > 0)) {
    return res.status(422).send({ message: 'You must provide a name and location' });
  }

  try {
    const track = new Track({ name, locations, userId: req.user._id });
    await track.save();
    res.status(200).send({ name: track._doc.name, locations: track._doc.locations, message: 'Track created successfully' });
  } catch (err) {
    res.status(401).status({ message: 'Sorry, Could not create a track. Please try again later' });
  }
});

module.exports = router;
