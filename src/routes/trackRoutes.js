/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
const express = require('express');
const mongoose = require('mongoose');

const requireAuth = require('../middlewares/requireAuth');

const Track = mongoose.model('Track');

const router = express.Router();

// Makes sure all routes in this file will only work if youre logged in
router.use(requireAuth);

// Getting all tracks
router.get('/tracks', async (req, res) => {
  const tracks = await Track.find({ userId: req.user._id });
  const filteredTracks = [];
  tracks.forEach((track) => {
    filteredTracks.push({
      name: track.name,
      id: track._id,
      locations: track.locations,
    });
  });
  if (filteredTracks.length > 0) {
    res.status(200).send({ tracks: filteredTracks, message: 'Tracks fetched successfully' });
  } else {
    res.status(404).send({ message: 'No tracks found' });
  }
});

// Getting a single track
router.get('/tracks/:id', async (req, res) => {
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    const id = new mongoose.Types.ObjectId(req.params.id);
    try {
      const track = await Track.findOne({ _id: id });
      if (track) {
        res.status(200).send({
          name: track.name, id: track._id, locations: track.locations, message: 'Track found successfully',
        });
      } else {
        res.status(200).send({ message: 'This trail cannot be found' });
      }
    } catch (err) {
      res.status(400).send({ message: 'Something went wrong, Please try again later' });
    }
  } else {
    res.status(400).send({ message: 'This trail cannot be found' });
  }
});

// Adding a new track
router.post('/tracks', async (req, res) => {
  const { name, locations } = req.body;

  if (!name || !(locations && Array.isArray(locations) && locations.length > 0)) {
    return res.status(422).send({ message: 'You must provide a name and location' });
  }

  const existingTrack = await Track.findOne({ name });
  if (existingTrack
     && existingTrack.locations[0].timestamp === locations[0].timestamp) {
    if (existingTrack.locations.length === locations.length) {
      return res.status(401).send({ message: 'This track already exists' });
    }
    const track = await Track.findOneAndUpdate({ _id: existingTrack.id }, req.body, {
      returnOriginal: false,
    });
    if (track) {
      return res.status(200).send({
        name: track.name, id: track._id, locations: track.locations, message: 'Track updated successfully',
      });
    }
  }
  try {
    const track = new Track({ name, locations, userId: req.user._id });
    await track.save();
    res.status(200).send({
      name: track._doc.name, id: track._doc._id, locations: track._doc.locations, message: 'Track created successfully',
    });
  } catch (err) {
    res.status(401).status({ message: 'Sorry, Could not create a track. Please try again later' });
  }
});

// Updating a single track
router.put('/tracks/:id', async (req, res) => {
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    const id = new mongoose.Types.ObjectId(req.params.id);
    try {
      const track = await Track.findOneAndUpdate({ _id: id }, req.body, {
        returnOriginal: false,
      });
      if (track) {
        res.status(200).send({
          name: track.name, id: track._id, locations: track.locations, message: 'Track updated successfully',
        });
      } else {
        res.status(200).send({ message: 'This trail cannot be found' });
      }
    } catch (err) {
      res.status(400).send({ message: 'Failed to update this track, Please try again later' });
    }
  } else {
    res.status(400).send({ message: 'This trail cannot be found' });
  }
});

// Deleting a single track
router.delete('/tracks/:id', async (req, res) => {
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    const id = new mongoose.Types.ObjectId(req.params.id);
    try {
      const track = await Track.findOneAndDelete({ _id: id });
      if (track) {
        res.status(200).send({
          name: track.name, id: track._id, locations: track.locations, message: 'Track deleted successfully',
        });
      } else {
        res.status(200).send({ message: 'This trail cannot be found' });
      }
    } catch (err) {
      res.status(400).send({ message: 'Failed to delete this track, Please try again later' });
    }
  } else {
    res.status(400).send({ message: 'This trail cannot be found' });
  }
});

module.exports = router;
