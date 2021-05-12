const mongoose = require('mongoose');

const { Schema } = mongoose;

const ArtSchema = new Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  filename: { type: String, required: true },
  checksum: { type: String, required: true },
  time: { type: Date, default: Date.now },
});

// Export model.
module.exports = mongoose.model('Art', ArtSchema);
