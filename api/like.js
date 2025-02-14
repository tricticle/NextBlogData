// api/like.js
const mongoose = require('mongoose');
const { Like } = require('./database');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = async (req, res) => {
  try {
    if (req.method === 'POST') {
      const { user_id, blog_id } = req.body;
      const like = new Like({
        _id: new mongoose.Types.UUID(),
        user_id,
        blog_id,
        created_at: new Date(),
      });
      await like.save();
      res.status(201).json({ message: 'Like added successfully' });
    } else if (req.method === 'GET') {
      const { user_id } = req.query; // Retrieve user_id from query parameters
      if (user_id) {
        // If user_id is provided, fetch likes only for that user
        const likes = await Like.find({ user_id }).lean();
        const stringifiedLikes = likes.map(like => ({
          ...like,
          user_id: like.user_id.toString(),
          blog_id: like.blog_id.toString(),
        }));
        res.json(stringifiedLikes);
      } else {
        // If user_id is not provided, fetch all likes
        const likes = await Like.find().lean();
        const stringifiedLikes = likes.map(like => ({
          ...like,
          user_id: like.user_id.toString(),
          blog_id: like.blog_id.toString(),
        }));
        res.json(stringifiedLikes);
      }
    } else if (req.method === 'DELETE') {
      const { user_id, blog_id } = req.body;
      await Like.findOneAndDelete({ user_id, blog_id });
      res.json({ message: 'Like deleted successfully' });
    } else {
      res.status(400).json({ error: 'Invalid request method' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
