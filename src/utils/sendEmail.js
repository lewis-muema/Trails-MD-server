const nodemailer = require('nodemailer');
const axios = require('axios');
const mongoose = require('mongoose');
const hash = require('./hash');

const Config = mongoose.model('Config');

const senderEmail = 'mdkkcontact@gmail.com';

const sendEmail = async (email, subject, text) => {
  try {
    const id = new mongoose.Types.ObjectId('65c2391d867b6af066953c4c');
    let config = await Config.findOne({ _id: id });
    if (!config) {
      config = await Config.findOne({ name: 'oauth' });
    }
    const response = await axios.post(
      'https://www.googleapis.com/oauth2/v3/token',
      {
        client_id: hash(false, config.configuration.clientId),
        client_secret: hash(false, config.configuration.clientSecret),
        refresh_token: hash(false, config.configuration.refreshToken),
        grant_type: 'refresh_token',
      },
    );

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: senderEmail,
        clientId: hash(false, config.configuration.clientId),
        clientSecret: hash(false, config.configuration.clientSecret),
        refreshToken: hash(false, config.configuration.refreshToken),
        accessToken: response.data.access_token,
      },
    });

    await transporter.sendMail({
      from: email,
      to: email,
      subject,
      text,
      html: `<head><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap" rel="stylesheet"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></head><html><body><div><img style="width:200px;margin:auto;display:flex" src="https://lh3.googleusercontent.com/pw/ABLVV85jAHR6l8ZnPHf9b8od59qc2j6itCm72hBE0Q7LvHrY86dJljh9EbxeyElYSxZzLhtQy3w333s-oTyEiZHFaFegNMAMCBMPt4OtKtTE04HtAZeapg=w2400"><div style="background-color:#faeed9;display:grid;padding:50px;border-radius:20px;width:max-content;margin:auto;text-align:center"><p style="font-family:Roboto,sans-serif;font-weight:400;font-size:22px;margin:10px;color:#113231">Here is your password reset token, It expires in 1 hour</p><p style="font-family:Roboto,sans-serif;font-weight:900;font-size:45px;margin:10px;color:#113231;letter-spacing:10px">${text}</p></div></div></body></html>`,
    });
    return true;
  } catch (error) {
    return false;
  }
};

module.exports = sendEmail;
