const mongoose = require("mongoose")

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  name: { type: String, required: true},
  time: { type: Date },
  message: { type: String, required: true }
})

module.exports = mongoose.model("Message", MessageSchema);