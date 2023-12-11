/* eslint-disable import/no-extraneous-dependencies */
require('./models/Users');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const auth = require('./routes/auth');
const requireAuth = require('./middlewares/requireAuth');

const app = express();

app.use(bodyParser.json());
app.use(auth);

const mongoURI = 'mongodb+srv://admin:PassworD@cluster0.8dands8.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(mongoURI);
mongoose.connection.on('connected', () => {
  console.log('Successfully connected');
});

mongoose.connection.on('error', (err) => {
  console.error('Error connecting to MonngoDB', err);
});

app.get('/', requireAuth, (req, res) => {
  res.send(`Your email: ${req.user.email}`);
});

app.listen(3000, () => {
  console.log('Listening on port 3000');
});
