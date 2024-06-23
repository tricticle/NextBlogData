import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

const Admin = () => {
  const { isAuthenticated, user, loginWithRedirect } = useAuth0();
  const [adminData, setAdminData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [selectedBlogs, setSelectedBlogs] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("UserManage");
  const [blocklistWords, setBlocklistWords] = useState([]);
  const [filteredWords, setFilteredWords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWords, setSelectedWords] = useState([]);
  const [newWord, setNewWord] = useState([]);

  useEffect(() => {
    fetchBlocklistWords();
  }, []);

  const fetchBlocklistWords = async () => {
    try {
      const response = await axios.get("/api/blocklist");
      setBlocklistWords(response.data);
      setFilteredWords(response.data);
    } catch (error) {
      console.error("Error fetching blocklist words:", error);
    }
  };

  const handleWordSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchTerm(searchTerm);
    const filtered = blocklistWords.filter((word) =>
      word.toLowerCase().includes(searchTerm)
    );
    setFilteredWords(filtered);
  };

  const handleAddWord = async () => {
    try {
      await axios.post("/api/blocklist", { word: newWord });
      setNewWord("");
      fetchBlocklistWords();
    } catch (error) {
      console.error("Error adding word to blocklist:", error);
    }
  };

  const handleWordCheckboxChange = (word) => {
    const isSelected = selectedWords.includes(word);
    if (isSelected) {
      setSelectedWords(selectedWords.filter((selected) => selected !== word));
    } else {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const handleDeleteSingleWord = async (wordToDelete) => {
    try {
      await axios.delete("/api/blocklist", { data: { word: wordToDelete } });
      fetchBlocklistWords();
    } catch (error) {
      console.error("Error deleting word from blocklist:", error);
    }
  };

  const handleWordDeleteSelected = async () => {
    try {
      await Promise.all(
        selectedWords.map(async (word) => {
          await axios.delete("/api/blocklist", { data: { word } });
        })
      );
      setSelectedWords([]);
      fetchBlocklistWords();
    } catch (error) {
      console.error("Error deleting selected words from blocklist:", error);
    }
  };

  const handleTabClick = (tab) => {
    if (!isAuthenticated) {
      loginWithRedirect();
      return;
    }
    setActiveTab(tab);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get("/api/blog");
      setBlogs(response.data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };

  const handleSearch = async () => {
    try {
      let filteredBlogs = [];

      const [searchQuery, profileId] = searchText
        .split("@")
        .map((str) => str.trim());

      if (searchQuery) {
        const response = await axios.get(`/api/blog?search=${searchQuery}`);
        filteredBlogs = response.data.filter((blog) =>
          blog.text.toLowerCase().includes(searchQuery.toLowerCase())
        );
      } else if (profileId) {
        const response = await axios.get(`/api/blog?profile_id=${profileId}`);
        filteredBlogs = response.data;
      } else {
        // If no search query or profile ID is provided, fetch all blogs
        fetchBlogs();
        return;
      }

      setBlogs(filteredBlogs);
    } catch (error) {
      console.error("Error searching blogs:", error);
      setBlogs([]); // Resetting blogs to an empty array in case of error
    }
  };

  const handleDeleteBlog = async (blogId) => {
    try {
      await axios.delete("/api/blog", { data: { blog_id: blogId } });
      // Remove the deleted blog from the UI
      setBlogs(blogs.filter((blog) => blog._id !== blogId));
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await axios.delete("/api/blog", { data: { blog_id: selectedBlogs } });
      // Remove deleted blogs from UI
      setBlogs(blogs.filter((blog) => !selectedBlogs.includes(blog._id)));
      setSelectedBlogs([]);
    } catch (error) {
      console.error("Error deleting blogs:", error);
    }
  };

  const handleCheckboxChange = (blogId) => {
    if (selectedBlogs.includes(blogId)) {
      setSelectedBlogs(selectedBlogs.filter((id) => id !== blogId));
    } else {
      setSelectedBlogs([...selectedBlogs, blogId]);
    }
  };

  const fetchAdminData = async () => {
    try {
      const response = await fetch("/api/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const adminData = await response.json();
        setAdminData(adminData);
        console.log("Admin data:", adminData);
      } else {
        console.error("Failed to fetch admin data");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    // Fetch admin data when component mounts
    if (isAuthenticated && user.name === "tricticle") {
      fetchAdminData();
    }
  }, [isAuthenticated, user.name]); // Fetch data when authentication status or username changes

  const handleDeleteProfile = async (profileId) => {
    try {
      const response = await fetch(`/api/profile?id=${profileId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        console.log("Profile deleted successfully");
        fetchAdminData(); // Reload admin data after deletion
      } else {
        console.error("Failed to delete profile");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredAdminData = adminData
    ? adminData.filter((profile) =>
        profile.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="back-cen">
      <div className="post-tab">
        <button
          onClick={() => handleTabClick("UserManage")}
          className={`post-button ${
            activeTab === "UserManage" ? "active" : ""
          }`}
        >
          <i className="fa-solid fa-sliders"></i>User Manage
        </button>
        <button
          onClick={() => handleTabClick("BlogManage")}
          className={`post-button ${
            activeTab === "BlogManage" ? "active" : ""
          }`}
        >
          <i className="fa-solid fa-list"></i>Blog Manage
        </button>
        <button
          onClick={() => handleTabClick("banManage")}
          className={`post-button ${activeTab === "banManage" ? "active" : ""}`}
        >
          <i className="fa-solid fa-ban"></i>Ban Manage
        </button>
      </div>
      {activeTab === "UserManage" && (
        <>
          {isAuthenticated && user.name === "tricticle" && (
            <div className="admin-section">
              <div className="widgets__input">
                <span className="material-icons widgets__searchIcon">
                  {" "}
                  search{" "}
                </span>
                <input
                  type="text"
                  placeholder="Search user..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              {filteredAdminData.length > 0 ? (
                <div className="ad-man">
                  {filteredAdminData.map((adminProfile) => (
                    <div key={adminProfile._id} className="admin-profile">
                      <img
                        src={adminProfile.avatar}
                        alt={adminProfile.username}
                      />
                      <div className="u-info">
                        <h3>{adminProfile.username}</h3>
                        <button
                          onClick={() => handleDeleteProfile(adminProfile._id)}
                        >
                          Delete Profile
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No matching users found.</p>
              )}
            </div>
          )}
        </>
      )}
      {activeTab === "BlogManage" && (
        <div className="back-center">
          <h1>Blog Management</h1>
          <div className="back-grey">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="blog or @profileId"
            />
            <button className="search-blog" onClick={handleSearch}>
              Search
            </button>
          </div>
          <table className="blog-table">
            <thead>
              <tr>
                <th>Select</th>
                <th>Blog Title</th>
                <th>Profile ID</th>
                <th>Hashtags</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog._id}>
                  <td>
                    <input
                      type="checkbox"
                      onChange={() => handleCheckboxChange(blog._id)}
                      checked={selectedBlogs.includes(blog._id)}
                    />
                  </td>
                  <td>{blog.title}</td>
                  <td>{blog.profile_id}</td>
                  <td>{blog.hashtags.join(", ")}</td>
                  <td>{blog.location ? blog.location.placeName : ""}</td>
                  <td>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteBlog(blog._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            className="delete-button"
            onClick={handleDeleteSelected}
            disabled={selectedBlogs.length === 0}
          >
            Delete Selected Blogs
          </button>
        </div>
      )}
      {activeTab === "banManage" && (
        <div className="back-center">
          <h2>Blocklist Words</h2>
          <div className="back-grey">
            <input
              type="text"
              value={searchTerm}
              onChange={handleWordSearch}
              placeholder="Search..."
            />
          </div>
          <div className="back-grey">
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="Enter a new word"
            />
            <button className="search-blog" onClick={handleAddWord}>
              <i className="fa-solid fa-ban"></i>Ban
            </button>
          </div>
          <table className="blog-table">
            <thead>
              <tr>
                <th></th>
                <th>Word</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredWords.map((word, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedWords.includes(word)}
                      onChange={() => handleWordCheckboxChange(word)}
                    />
                  </td>
                  <td>{word}</td>
                  <td>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteSingleWord(word)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            <button
              className="delete-button"
              onClick={handleWordDeleteSelected}
              disabled={selectedWords.length === 0}
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
