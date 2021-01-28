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
  },
  facebook: {
    type: String
  },
  twitter: {
    type: String
  },
  instagram: {
    type: String
  },
  linkedin: {
    type: String
  },
});

module.exports = mongoose.model('users', userSchema);
