// api/bloghashtag.js
const mongoose = require('mongoose');
const { BlogHashtag } = require('./database');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = async (req, res) => {
  try {
    if (req.method === 'POST') {
      // Handle adding data for blogHashtags
      const { blog_id, hashtag_id } = req.body;
      const blogHashtag = new BlogHashtag({
        blog_id,
        hashtag_id,
      });
      await blogHashtag.save();
      res.status(201).json({ message: 'BlogHashtag added successfully' });
    } else if (req.method === 'GET') {
      const bloghashtags = await BlogHashtag.find().lean(); // Use .lean() to convert to plain JavaScript objects
      const stringifiedBloghashtags = bloghashtags.map(bloghashtag => ({
        ...bloghashtag,
        blog_id: bloghashtag.blog_id.toString(),
        hashtag_id: bloghashtag.hashtag_id.toString(),
      }));
      res.json(stringifiedBloghashtags);
    } else {
      res.status(400).json({ error: 'Invalid request method' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
