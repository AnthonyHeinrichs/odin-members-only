const mongoose = require("mongoose")
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  name: { type: String, required: true},
  date: { type: Date },
  message: { type: String, required: true }
})

MessageSchema.virtual("date_formatted").get(function () {
  return this.date ?
  DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_MED) : '';
});

MessageSchema.virtual("time_formatted").get(function () {
  return this.date ?
    DateTime.fromJSDate(this.date).setZone('Europe/Paris').toFormat("HH:mm 'CET'") : '';
});

module.exports = mongoose.model("Message", MessageSchema);