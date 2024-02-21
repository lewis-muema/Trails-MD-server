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
    res.status(200).send({ tracks: filteredTracks, message: 'Trails fetched successfully' });
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
          name: track.name, id: track._id, locations: track.locations, message: 'Trail found successfully',
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
      return res.status(401).send({ message: 'This trail already exists' });
    }
    const track = await Track.findOneAndUpdate({ _id: existingTrack.id }, req.body, {
      returnOriginal: false,
    });
    if (track) {
      return res.status(200).send({
        name: track.name, id: track._id, locations: track.locations, message: 'Trail updated successfully',
      });
    }
  }
  try {
    const track = new Track({ name, locations, userId: req.user._id });
    await track.save();
    res.status(200).send({
      name: track._doc.name, id: track._doc._id, locations: track._doc.locations, message: 'Trail created successfully',
    });
  } catch (err) {
    res.status(401).status({ message: 'Sorry, Could not create a trail. Please try again later' });
  }
});

// Adding multiple tracks
router.post('/tracks/many', async (req, res) => {
  const { tracks } = req.body;
  const validTracks = [];
  const createdTracks = [];
  const updatePromises = [];
  tracks.forEach((track) => {
    const { name, locations } = track;
    if (name || (locations && Array.isArray(locations) && locations.length > 0)) {
      validTracks.push(track);
    }
  });

  if (validTracks.length === 0) {
    return res.status(422).send({ message: 'You must provide a name and location' });
  }

  validTracks.forEach(async (track) => {
    const { id, action } = track;
    if (action === 'create') {
      createdTracks.push(track);
    }
    if (action === 'edit') {
      updatePromises.push(new Promise(async (resolve) => {
        const editedTrack = await Track.findOneAndUpdate({ _id: id }, track, {
          returnOriginal: false,
        });
        resolve(editedTrack);
      }));
    }
  });

  Promise.all(updatePromises).then((updates) => {
    if (createdTracks.length > 0) {
      Track.insertMany(createdTracks).then((trails) => {
        res.status(200).send({
          created: trails, updated: updates, message: 'Process complete',
        });
      }).catch(() => {
        res.status(401).status({ message: 'Something went wrong. Please try again later' });
      });
    } else {
      res.status(401).status({ created: createdTracks, updated: updates, message: 'Process complete' });
    }
  });
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
          name: track.name, id: track._id, locations: track.locations, message: 'Trail updated successfully',
        });
      } else {
        res.status(200).send({ message: 'This trail cannot be found' });
      }
    } catch (err) {
      res.status(400).send({ message: 'Failed to update this trail, Please try again later' });
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
          name: track.name, id: track._id, locations: track.locations, message: 'Trail deleted successfully',
        });
      } else {
        res.status(200).send({ message: 'This trail cannot be found' });
      }
    } catch (err) {
      res.status(400).send({ message: 'Failed to delete this trail, Please try again later' });
    }
  } else {
    res.status(400).send({ message: 'This trail cannot be found' });
  }
});

// Delete many tracks
router.post('/delete-tracks', async (req, res) => {
  if (Array.isArray(req.body) && req.body.length > 0) {
    try {
      const track = await Track.deleteMany({ _id: { $in: req.body } });
      res.status(200).send({ message: 'These trails have been deleted', deleted: track.deletedCount });
    } catch (err) {
      res.status(400).send({ message: 'Failed to delete these trails, Please try again later' });
    }
  } else {
    res.status(400).send({ message: 'Please send an array of ids in the payload', data: req.body });
  }
});

module.exports = router;
