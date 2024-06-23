// api/blog.js
const mongoose = require('mongoose');
const axios = require('axios');
const { Blog, Like, Reply, Bookmark, Blocklist } = require('./database');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const getPlaceName = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );

    const place = response.data;
    if (place.locality) {
      return place.locality;
    }

    return null;
  } catch (error) {
    console.error('Error fetching place name:', error);
    return null;
  }
};

module.exports = async (req, res) => {
  try {
    if (req.method === 'POST') {
      const { title, description, content, profile_id, hashtags, location } = req.body;
      const blocklistWords = await Blocklist.find({}, "word");
      const blockedWords = blocklistWords.map((item) => item.word);
      const blockedWord = blockedWords.find((word) => text.includes(word)); // Capture the blocked word
      const containsBlockedWords = blockedWords.some((word) =>
        text.includes(word)
      );
      if (containsBlockedWords) {
        return res.status(400).json({ error: 'Blog contains blocked words',blockedWord });
      }
      const blog = new Blog({
        _id: new mongoose.Types.UUID(),
        title,
        description,
        content,
        profile_id,
        created_at: new Date(),
        updated_at: new Date(),
        hashtags,
        location,
      });

      // Check if location is provided
      if (location && location.coordinates && location.coordinates.length === 2) {
        const [longitude, latitude] = location.coordinates;
        const placeName = await getPlaceName(latitude, longitude);
        blog.location.placeName = placeName;
      }

      await blog.save();
      res.status(201).json({ message: 'Blog added successfully' });
    } else if (req.method === 'GET') {
      // Update the logic to fetch blogs for a specific user
      const { profile_id } = req.query;
      const query = profile_id ? { profile_id: new mongoose.Types.UUID(profile_id) } : {};
      const blogs = await Blog.find(query);

      // Convert _id and profile_id to strings
      const blogsWithStrings = blogs.map(blog => ({
        ...blog._doc,
        _id: blog._id.toString(),
        profile_id: blog.profile_id.toString(),
      }));

      res.json(blogsWithStrings);
    } else if (req.method === 'DELETE') {
      const { blog_id } = req.body;
      if (!blog_id) {
        return res.status(400).json({ error: 'blog_id is required for deletion' });
      }

      await Like.deleteMany({ blog_id });
      await Reply.deleteMany({ blog_id });
      await Bookmark.deleteMany({ blog_id });



      const deletedBlog = await Blog.findByIdAndDelete(blog_id);
      if (!deletedBlog) {
        return res.status(404).json({ error: 'Blog not found' });
      }

      res.json({ message: 'Blog deleted successfully' });
    } else {
      res.status(400).json({ error: 'Invalid request method' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
