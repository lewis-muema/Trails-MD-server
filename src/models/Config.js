const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  configuration: {
    type: Object,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

mongoose.model('Config', configSchema);
