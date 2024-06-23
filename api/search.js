// api/search.js
const mongoose = require('mongoose');
const axios = require('axios');
const { Profile, Blog } = require('./database');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = async (req, res) => {
    try {
      const { query } = req.query;
  
      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }
  
      // Search for profiles
      const profileResults = await Profile.find({
        username: { $regex: query, $options: 'i' },
      }).lean();
  
      // Search for blogs
      const blogResults = await Blog.find({
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
          { content: { $regex: query, $options: "i" } },
          { hashtags: { $regex: query, $options: "i" } },
        ],
      }).lean();
  
      res.json({
        profiles: profileResults.map(profile => ({
          _id: profile._id.toString(),
          username: profile.username,
          avatar: profile.avatar,
        })),
        blogs: blogResults.map(blog => ({
          _id: blog._id.toString(),
          title: blog.title,
          description: blog.description,
          content: blog.content,
          profile_id: blog.profile_id.toString(),
          created_at: blog.created_at,
          updated_at: blog.updated_at,
          hashtags: blog.hashtags,
          location: blog.location,
        })),
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };