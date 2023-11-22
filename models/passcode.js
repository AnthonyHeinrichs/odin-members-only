const mongoose = require("mongoose")

const Schema = mongoose.Schema;

const PasscodeSchema = new Schema({
  passcode: { type: String },
})

module.exports = mongoose.model("Passcode", PasscodeSchema);