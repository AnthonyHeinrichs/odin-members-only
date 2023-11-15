const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
require('dotenv').config()

const app = express()

// Set up mongoose connection
const mongoDb = process.env.MONGO_CONNECTION_STRING;
mongoose.connect(mongoDb);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

// Set up view engine
app.set("views", __dirname);
app.set("view engine", "ejs");

passport.serializeUser((user, done) => {
  done(null, user.id);
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch(err) {
    done(err);
  };
});

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.get("/", (req, res) => res.render("index", { user: req.user }));

app.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/"
  })
);

app.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/")
  });
});

app.get("/sign-up", (req, res) => res.render("sign-up-form"));

app.listen(3000, () => console.log("App listening on port 3000"));