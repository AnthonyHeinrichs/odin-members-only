const User = require("../models/user");
const createError = require('http-errors');
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const { hashPassword, checkPasswordValidity } = require("../utils/passwordUtils");
const LocalStrategy = require("passport-local").Strategy;
const passport = require("passport");

// Displaying user sign up form on get
exports.user_sign_up_get = (req, res, next) => {
  res.render("sign-up");
}

// Handling user creation on post
exports.user_create_post = [
  body("username")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Name is required"),
  body("password")
    .isLength({ min: 3 })
    .withMessage("Password is required"),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const hashedPassword = await hashPassword(req.body.password);

    const user = new User({
      username: req.body.username,
      password: hashedPassword,
    });
  
    if (!errors.isEmpty()) {
      res.render("sign-up");
      return;
    } else {
      await user.save();
      res.redirect("/");
    };
  }),
];

// Handling username & password check on log-in
exports.user_login_check = [
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await User.findOne({ username: username });
        if (!user) {
          return done(null, false, { message: "Username does not exist" });
        };
        const match = await checkPasswordValidity(password, user.password);
        if (!match) {
          return done(null, false, { message: "Incorrect password" });
        };
        return done(null, user);
      } catch(err) {
        return done(err);
      };
    })
  )
]