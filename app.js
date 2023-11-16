const express = require("express");
const path = require("path");
const logger = require('morgan');
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
const helmet = require('helmet');
const RateLimit = require('express-rate-limit');
require('dotenv').config()

const indexRouter = require('./routes/index');
const userRouter = require('./routes/users');

const app = express()

// Set up mongoose connection
const mongoDb = process.env.MONGO_CONNECTION_STRING;
mongoose.connect(mongoDb);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

// Set up view engine
app.set("views", path.join(__dirname, "views"));
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

// Setup public folder
app.use(express.static(__dirname + '/public'));

// Setup logging & authentication services
app.use(logger('dev'));
app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
});
// Apply rate limiter to all requests
app.use(limiter);

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["'self'", "code.jquery.com", "cdn.jsdelivr.net"],
    },
  }),
);

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

app.use('/', indexRouter, userRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 404);
  res.render("404");
});


app.listen(3000, () => console.log("App listening on port 3000"));