const express = require('express');
const router = express.Router();

// Require user controller module
const user_controller = require("../controllers/userController");

// Get user sign-up form
router.get("/sign-up", user_controller.user_sign_up_get);

module.exports = router;