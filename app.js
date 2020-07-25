//jshint esversion:6
require('dotenv').config();  // dotenv package for environment variables - place our secrets in .env
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

// For ease, we can encrypt with a long unguessable string (SECRET) instead of using an encryption key and signing key
// Pass in the plugin to the userSchema before creating the model
// This plugin will encrypt the password when we save a user document and decrypt when we find
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.post("/register", function(req, res) {
  const newUser = new User ({
    email: req.body.username,
    password: req.body.password
  });

  newUser.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      res.render("secrets");
    };
  });
});

app.post("/login", function(req, res) {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ email: username }, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (password === foundUser.password) {
          res.render("secrets");
        };
      };
    };
  });
});

app.listen(3000, function() {
  console.log("Server up and running on port 3000!");
});
