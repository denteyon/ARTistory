var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ArtSchema = new Schema({
    title: {type: String, required: true},
    author: { type: String, required: true },
    checksum: {type: String, required: true},
    time : { type : Date, default: Date.now }
});

// Export model.
module.exports = mongoose.model('Art', ArtSchema);