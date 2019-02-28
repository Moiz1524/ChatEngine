const mongoose = require('mongoose');

var messageSchema = mongoose.Schema({
  body: String,
  from: String,
  to: String,
  time: Number
});

module.exports = mongoose.model('Message', messageSchema);
