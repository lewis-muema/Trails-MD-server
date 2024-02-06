/* eslint-disable no-underscore-dangle */
const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middlewares/requireAuth');
const hash = require('../utils/hash');

const Config = mongoose.model('Config');

const router = express.Router();
router.use(requireAuth);


router.post('/create-config', async (req, res) => {
  const { configuration, name } = req.body;
  Object.keys(configuration).forEach((key) => {
    configuration[key] = hash(true, typeof configuration[key] === 'string' ? configuration[key] : configuration[key].toString());
  });
  const config = new Config({ configuration, name });
  config.save().then(() => {
    res.status(200).send({ message: 'This config has been created' });
  }).catch((err) => {
    res.status(400).send({ message: `Failed to create config - ${err.message}` });
  });
});

router.put('/update-config/:id', async (req, res) => {
  const { configuration, name } = req.body;
  Object.keys(configuration).forEach((key) => {
    configuration[key] = hash(true, configuration[key]);
  });
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    try {
      const id = new mongoose.Types.ObjectId(req.params.id);
      const config = await Config.findOneAndUpdate({ _id: id }, { configuration, name }, {
        returnOriginal: false,
      });
      if (config) {
        res.status(200).send({
          name: config.name, message: 'Config updated successfully',
        });
      } else {
        res.status(200).send({ message: 'This config cannot be found' });
      }
    } catch (err) {
      res.status(400).send({ message: `Failed to update this config - ${err.message}` });
    }
  } else {
    res.status(400).send({ message: 'Could not find config' });
  }
});

module.exports = router;
