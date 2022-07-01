const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const entrySchema = new Schema({
  deviceID: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  County: {
    type: Array,
    required: true,
  },
  Trail: {
    type: Object,
    required: true,
  },
});

module.exports = mongoose.model("Entry", entrySchema);
