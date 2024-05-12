const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  image: {
    type: String,
    },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref : 'User',
  },
  title: {
    type: String,
  },
  description:{
    type: String
  },
  link:{
    type: String,
  }
});


const Post = mongoose.model('Post', postSchema);

// Export the User model
module.exports = Post;
