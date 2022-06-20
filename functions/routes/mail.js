const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const config = require("../config");
const OAuth2 = google.auth.OAuth2;
const express = require("express");
const mongoose = require("mongoose");
var nodeoutlook = require("nodejs-nodemailer-outlook");
const router = express.Router();

const OAuth2Client = new OAuth2(
  config.clientId,
  config.clientSecret,
  '"https://developers.google.com/oauthplayground"'
);
OAuth2Client.setCredentials({ refresh_token: config.refreshToken });
const accessToken = OAuth2Client.getAccessToken();

const sendMail = async (recepient, itemName, assignedBy, userId) => {
  const transport = nodemailer.createTransport({
    service: "Outlook365",
    host: "global.wfp.org",
    secureConnection: false,
    //  TLS requires secureConnection to be false
    port: 587, // port for secure SMTP
    auth: {
      user: "thangaraj.shagar@wfp.org",
      pass: "azsxdcfvgB2!",
      // type: "OAuth2",
      // user: config.user,
      // clientId: config.clientId,
      // clientSecret: config.clientSecret,
      // refreshToken: config.refreshToken,
      // accessToken: accessToken,
    },
    tls: {
      ciphers: "SSLv3",
    },
  });

  const MailOptions = {
    from: `GEMS <thangaraj.shagar@wfp.org>`,
    to: recepient,
    subject: "GEMS",
    html: getMessage(itemName, assignedBy, userId),
  };

  transport.sendMail(MailOptions, (error, result) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Success", result);
    }
    transport.close();
  });
};

const getMessage = (itemName, assignedBy, userId) => {
  return `
    <h3>Inventory Update</h3>
    <br>
    <br>
    <h5>Assigned To : ${userId} </h5>
    <h5>Assigned By : ${assignedBy} </h5>
    <ul>
        <li>Item : ${itemName}</li>
    </ul>
    `;
};

router.post("/sendMail", (req, res) => {
  const recepient = "shagyfox133@gmail.com";
  // const { itemName, assignedBy, userId } = req.body;
  sendMail(recepient, "itemName", "assignedBy", "userId");

  res.send("Success");
});
module.exports = router;
