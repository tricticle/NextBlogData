//api/database.js
const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.UUID },
    updated_at: { type: Date, required: true },
    username: { type: String, minLength: 3, required: true, unique: true },
    avatar: { type: String },
  });

  const Profile = mongoose.model('Profile', profileSchema);

  const blogSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.UUID },
    title: { type: String, required: true },
    description: { type: String, required: true },
    content: { type: String, required: true },
    profile_id: { type: mongoose.Schema.Types.UUID, required: true },
    created_at: { type: Date, required: true },
    updated_at: { type: Date, required: true },
    hashtags: [{ type: String }],
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
      },
      placeName: String,
    },
  });
  
  const Blog = mongoose.model('Blog', blogSchema);

  const bookmarkSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.UUID },
    user_id: { type: mongoose.Schema.Types.UUID, required: true },
    blog_id: { type: mongoose.Schema.Types.UUID, required: true },
    created_at: { type: Date, required: true },
  });
  
  const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

  const hashtagSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.UUID },
    name: { type: String, required: true },
  });
  
  const Hashtag = mongoose.model('Hashtag', hashtagSchema);

  const likeSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.UUID },
    user_id: { type: mongoose.Schema.Types.UUID, required: true },
    blog_id: { type: mongoose.Schema.Types.UUID, required: true },
    created_at: { type: Date, required: true },
  });

  const blogHashtagSchema = new mongoose.Schema({
    blog_id: { type: mongoose.Schema.Types.UUID, required: true },
    hashtag_id: { type: mongoose.Schema.Types.UUID, required: true },
  });
  
  const BlogHashtag = mongoose.model('BlogHashtag', blogHashtagSchema);

  
  const Like = mongoose.model('Like', likeSchema);

  const replySchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.UUID },
    text: { type: String, required: true },
    user_id: { type: mongoose.Schema.Types.UUID, required: true },
    blog_id: { type: mongoose.Schema.Types.UUID },
    reply_id: { type: mongoose.Schema.Types.UUID },
  });
  
  const Reply = mongoose.model('Reply', replySchema);

  const followSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.UUID },
    follower_id: { type: mongoose.Schema.Types.UUID, required: true },
    follower_username: { type: String, required: true },
    following_id: { type: mongoose.Schema.Types.UUID, required: true },
    following_username: { type: String, required: true },
    created_at: { type: Date, required: true },
  });

  const Follow = mongoose.model('Follow', followSchema);
  
const blocklistSchema = new mongoose.Schema({
    word: String,
  });

const Blocklist = mongoose.model('Blocklist', blocklistSchema);
  
  module.exports = {
    Profile,
    Blog,
    Like,
    Hashtag,
    BlogHashtag,
    Bookmark,
    Reply,
    Follow,
    Blocklist,
  };
  