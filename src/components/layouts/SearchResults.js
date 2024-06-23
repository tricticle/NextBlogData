import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const SearchResults = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ profiles: [], blogs: [] });

  const handleSearch = async () => {
    try {
      const response = await axios.get(`/api/search?query=${query}`);
      setResults(response.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    if (query.trim() !== "") {
      handleSearch();
    } else {
      setResults({ profiles: [], blogs: [] });
    }
  }, [query]);

  const showPopup = results.profiles.length > 0 || results.blogs.length > 0;

  return (
    <div className="explore">
      <div className="widgets__input">
        <span className="material-icons widgets__searchIcon"> search </span>
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            {results.profiles.length > 0 && (
              <div className="pop-prop">
                <h3>Profiles</h3>

                {results.profiles.map((profile) => (
                  <Link to={`/userprofile/${profile._id}`}>
                    <div key={profile._id} className="prop-cont">
                      <img
                        src={profile.avatar}
                        alt={`${profile.username}'s avatar`}
                      />
                      <h4>{profile.username}</h4>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {results.blogs.length > 0 && (
              <div className="pop-prop">
                <h3>Blogs</h3>
                {results.blogs.map((blog) => (
                  <div key={blog._id} className="prop-cont-blog">
                    <h4>{blog.profile_id}</h4>
                    <h5>{blog.title}</h5>
                    <h5>{blog.description}</h5>
                    <h5>{blog.content}</h5>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
