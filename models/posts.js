const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const postsSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  date:{
      type: Date
  },
  imageUrl: {
    type: String
  },
  email: {
    type: String
  },
  comments: {
      type: Array
  },
  likes:{
    type: Array
  },
  views: {
    type: Number
  }
});

module.exports = mongoose.model('posts', postsSchema);