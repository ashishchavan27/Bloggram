const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
      type: String,
      required: true
  },
  followers:{
    type: Array
  },
  imageUrl: {
    type: String
  },
  following:{
    type: Array
  }
});

module.exports = mongoose.model('users', userSchema);
