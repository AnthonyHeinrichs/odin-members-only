const express = require("express");
const asyncHandler = require("express-async-handler");
const { validationResult, body } = require('express-validator');
const path = require("path");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const hashPassword = require("./utils/passwordUtils")

// Bring in models
const User = require("./models/user");
const Message = require("./models/message");
const Passcode = require('./models/passcode'); 

require('dotenv').config()

const app = express()

// Set up mongoose connection
const mongoDb = process.env.MONGODB_URI;
mongoose.connect(mongoDb);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

// Set up view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: "Username does not exist" });
      };

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      };

      return done(null, user);
    } catch(err) {
      return done(err);
    };
  })
);

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

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use(asyncHandler(async (req, res, next) => {
  const messages = await Message.find().exec();
  req.messages = messages; 
  next();
}));

app.get("/", (req, res) => {
  const year = new Date().getFullYear()

  res.render("index", { user: req.user, messages: req.messages, year: year});
});

app.post("/log-in", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      // Handle failure and return error message
      return res.status(401).json({ success: false, message: info.message });
    }
    // If authentication is successful, log in the user
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.json({ success: true, message: 'Login successful' });
    });
  })(req, res, next);
});

app.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/")
  });
});

app.post(
  '/sign-up',
  [
    // Validate username
    body('username')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Username must be at least 1 character'),

    // Validate password
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
      .matches(/^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/)
      .withMessage('Password must contain at least one special character'),

    // Validate passcode
    body('passcode')
      .custom(async (value, { req }) => {
        try {
          // Query the database for the passcode
          const passcodeDoc = await Passcode.findOne({ passcode: value });
    
          if (!passcodeDoc) {
            throw new Error('Invalid passcode');
          }
    
          return true;
        } catch (error) {
          throw new Error('Error checking passcode');
        }
      })
      .withMessage('Invalid passcode'),
  ],
  
  async (req, res, next) => {
    // Check for validation errors
    const errors = validationResult(req);

    // If there are any error messages, return them as JSON
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // If validation passes, proceed with creating the user
    const hashedPassword = await hashPassword(req.body.password);

    try {
      const user = new User({
        username: req.body.username,
        password: hashedPassword,
      });

      const result = await user.save();

      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.json({ success: true, message: 'User created successfully' });
      });
    } catch (err) {
      return next(err);
    }
  }
);

app.post("/new-message", async(req, res, next) => {
  const date = new Date();
  
  try {
    const message = new Message({
      name: req.user.username,
      date: date,
      time: date,
      message: req.body.message,
    });

    const result = await message.save();
  
    return res.redirect("/");

  } catch (err) {
      return next(err);
  }
})

app.listen(3000, () => console.log("App listening on port 3000"));