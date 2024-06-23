import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Profile = ({ profileId }) => {
  const { isAuthenticated, user, loginWithRedirect } = useAuth0();
  const [profileData, setProfileData] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [selectedBlogId, setSelectedBlogId] = useState(null);
  const [repliesBlogs, setRepliesBlogs] = useState([]);
  const [likedBlogs, setLikedBlogs] = useState([]);
  const [bookmarkedBlogs, setBookmarkedBlogs] = useState([]);
  const [showOptions, setShowOptions] = useState(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followerUsernames, setFollowerUsernames] = useState([]);
  const [followingUsernames, setFollowingUsernames] = useState([]);
  const [isFollowingOpen, setIsFollowingOpen] = useState(false);
  const [isFollowerOpen, setIsFollowerOpen] = useState(false);
    const [expandedBlogId, setExpandedBlogId] = useState(null);

    const toggleContentVisibility = (id) => {
      setExpandedBlogId((prevId) => (prevId === id ? null : id));
    };

    const toggleFollower = () => {
      setIsFollowerOpen(!isFollowerOpen);
    };

    const closeFollower = () => {
      setIsFollowerOpen(false);
    };

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (isFollowerOpen && !event.target.closest(".follower-list")) {
          closeFollower();
        }
      };

      document.addEventListener("click", handleClickOutside);

      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }, [isFollowerOpen]);

    useEffect(() => {
      const handleScroll = () => {
        if (isFollowerOpen) {
          closeFollower();
        }
      };

      window.addEventListener("scroll", handleScroll);

      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }, [isFollowerOpen]);

    const togglefollowing = () => {
      setIsFollowingOpen(!isFollowingOpen);
    };

    const closefollowing = () => {
      setIsFollowingOpen(false);
    };

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (isFollowingOpen && !event.target.closest(".following-list")) {
          closefollowing();
        }
      };

      document.addEventListener("click", handleClickOutside);

      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }, [isFollowingOpen]);

    useEffect(() => {
      const handleScroll = () => {
        if (isFollowingOpen) {
          closefollowing();
        }
      };

      window.addEventListener("scroll", handleScroll);

      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }, [isFollowingOpen]);

  const fetchFollowerCounts = async () => {
    try {
      const response = await axios.get(`/api/follow?following_id=${profileId}`);
      if (response.data) {
        const followers = response.data;
        const followerCount = followers.length;
        setFollowerCount(followerCount);
        const followerUsernames = response.data;
        setFollowerUsernames(followerUsernames);
      }
    } catch (error) {
      console.error("Error fetching follower counts:", error);
    }
  };

  const fetchFollowingCounts = async () => {
    try {
      const response = await axios.get(`/api/follow?follower_id=${profileId}`);
      if (response.data) {
        const following = response.data;
        const followingCount = following.length;
        setFollowingCount(followingCount);
        const followingUsernames = response.data;
        setFollowingUsernames(followingUsernames);
      }
    } catch (error) {
      console.error("Error fetching following counts:", error);
    }
  };

  useEffect(() => {
    const fetchCounts = async () => {
      if (profileData && profileData._id) {
        await fetchFollowerCounts();
        await fetchFollowingCounts();
      }
    };

    fetchCounts();
  }, [profileData]);

  const handleLike = async (blogId) => {
    try {
      if (!isAuthenticated) {
        loginWithRedirect();
        return;
      }
      const isLiked = likedBlogs.includes(blogId);
      const method = isLiked ? "DELETE" : "POST";

      const response = await fetch("/api/like", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: profileData._id,
          blog_id: blogId,
        }),
      });

      if (response.ok) {
        console.log(`Blog ${isLiked ? "unliked" : "liked"} successfully`);
        toast.success(`Blog ${isLiked ? "unliked" : "liked"} successfully`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        fetchLikes();
      } else {
        console.error(`Failed to ${isLiked ? "unlike" : "like"} blog`);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleBookmark = async (blogId) => {
    try {
      if (!isAuthenticated) {
        loginWithRedirect();
        return;
      }
      const isBookmarked = bookmarkedBlogs.includes(blogId);
      const method = isBookmarked ? "DELETE" : "POST";

      const response = await fetch("/api/bookmark", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: profileData._id,
          blog_id: blogId,
        }),
      });

      if (response.ok) {
        console.log(
          `Blog ${isBookmarked ? "unbookmarked" : "bookmarked"} successfully`
        );
        toast.success(
          `Blog ${isBookmarked ? "unbookmarked" : "bookmarked"} successfully`,
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          }
        );
        fetchBookmarks();
      } else {
        console.error(
          `Failed to ${isBookmarked ? "unbookmark" : "bookmark"} blog`
        );
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchLikes = async () => {
    try {
      if (profileData) {
        const response = await fetch(`/api/like?user_id=${profileData._id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const likes = await response.json();
          setLikedBlogs(likes.map((like) => like.blog_id));
          console.log("Likes:", likes);
        } else {
          console.error("Failed to fetch likes");
        }
      } else {
        console.error("Profile data is not available");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchBookmarks = async () => {
    try {
      if (profileData) {
        const response = await fetch(
          `/api/bookmark?user_id=${profileData._id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const bookmarks = await response.json();
          setBookmarkedBlogs(bookmarks.map((bookmark) => bookmark.blog_id));
          console.log("Bookmarks:", bookmarks);
        } else {
          console.error("Failed to fetch bookmarks");
        }
      } else {
        console.error("Profile data is not available");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const toggleOptions = (blogId) => {
    setShowOptions((prevBlogId) => (prevBlogId === blogId ? null : blogId));
  };

  const handleProfile = async () => {
    try {
      const response = await axios.post("/api/profile", {
        username: user.name,
        avatar: user.picture, // Include the avatar from Auth0
      });
      console.log(response.data.message);
      await addProfile();
    } catch (error) {
      console.error("Error creating profile:", error);
    }
  };

  const addProfile = async () => {
    try {
      const response = await fetch(
        `/api/profile?username=${user.name || user.sub}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const profileData = await response.json();

        if (profileData.username === user.name) {
          setProfileData(profileData);
          console.log("Profile ID:", profileData._id);
          console.log("Profile added successfully");
        } else {
          console.error("Profile username does not match Auth0 user name");
        }
      } else {
        console.error("Failed to add profile");
        // Throw an error to trigger the catch block
        throw new Error("Failed to add profile");
      }
    } catch (error) {
      console.error("Error:", error);
      // If an error occurs, run handleProfile
      await handleProfile();
    }
  };

  const handleDeleteBlog = async (blogId) => {
    try {
      if (!isAuthenticated) {
        loginWithRedirect();
        return;
      }
      const response = await fetch("/api/blog", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blog_id: blogId,
        }),
      });

      if (response.ok) {
        console.log("Blog deleted successfully");
        toast.success("Blog deleted successfully", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        fetchBlogs();
      } else {
        console.error("Failed to delete blog");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchBlogs = async () => {
    try {
      const response = await fetch(`/api/blog?profileId=${profileId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const blogs = await response.json();

        // Fetch profile information for each blog's author
        const blogsWithProfile = await Promise.all(
          blogs.map(async (blog) => {
            const profileResponse = await fetch(
              `/api/profile?id=${blog.profile_id}`
            );
            const profileData = await profileResponse.json();
            return {
              ...blog,
              avatar: profileData.avatar,
              username: profileData.username,
            };
          })
        );

        setBlogs(blogsWithProfile);
      } else {
        console.error("Failed to fetch blogs");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const postReply = async (blogId) => {
    try {
      if (!isAuthenticated) {
        loginWithRedirect();
        return;
      }
      const response = await fetch("/api/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: replyText,
          user_id: profileData._id,
          blog_id: blogId,
        }),
      });

      if (response.ok) {
        console.log("Reply posted successfully");
        toast.success("reply posted successfully", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        fetchReplies();
        setReplyText("");
      } else {
        console.error("Failed to post reply");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchReplies = async () => {
    try {
      const response = await fetch("/api/reply", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const replies = await response.json();

        // Fetch profile information for each reply
        const repliesWithProfile = await Promise.all(
          replies.map(async (reply) => {
            const profileResponse = await fetch(
              `/api/profile?id=${reply.user_id}`
            );
            const profileData = await profileResponse.json();
            return {
              ...reply,
              avatar: profileData.avatar,
              username: profileData.username,
            };
          })
        );

        setRepliesBlogs(repliesWithProfile);
      } else {
        console.error("Failed to fetch replies");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      addProfile();
      fetchReplies();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (profileData && profileData._id) {
      fetchLikes();
      fetchBookmarks();
    }
  }, [profileData]);

  return (
    <>
      <div className="profile-container">
        <div className="p-back">
          <img src="./assets/p-back.png" alt="background" />
        </div>
        {isAuthenticated && (
          <div className="profi">
            <img loading="lazy" src={user.picture} alt={user.name} />
            <div className="padj">
              <div className="u-info">
                <h4>{user.name}!</h4>
                <h4>{profileId}</h4>
              </div>
              <div className="u-info">
                <a href="https://myaccount.google.com/profile">
                  <i className="fas fa-pen"></i>edit Profile
                </a>
              </div>
            </div>
          </div>
        )}
        <div className="follower-following-counts">
          <h3 className="following-list" onClick={togglefollowing}>
            {followingCount} Following
          </h3>
          <div className={`f-list ${isFollowingOpen ? "open" : ""}`}>
            <h3>Following</h3>
            <div>
              {followingUsernames.map((username, index) => (
                <Link to={`/userprofile/${username.following_id}`} key={index}>
                  <h5>{username.following_username}</h5>
                </Link>
              ))}
            </div>
          </div>
          <h3 className="follower-list" onClick={toggleFollower}>
            {followerCount} Follower
          </h3>
          <div className={`f-list ${isFollowerOpen ? "open" : ""}`}>
            <h3>Follower</h3>
            <div>
              {followerUsernames.map((username, index) => (
                <Link to={`/userprofile/${username.follower_id}`} key={index}>
                  <h5>{username.follower_username}</h5>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="post-section">
        <div className="blog-grid">
          <div className="twee-map">
            {blogs
              .filter((blog) => blog.profile_id === profileId)
              .map((blog) => (
                <div className="blog" key={blog._id}>
                  <div className="opos">
                    <Link to={`/userprofile/${blog.profile_id}`}>
                      <div className="avatar">
                        {blog.avatar && (
                          <img
                            src={blog.avatar}
                            alt={`${blog.profile_id} Avatar`}
                          />
                        )}
                        <div className="user-info">
                          <h3>{blog.username}</h3>
                          {blog.location && blog.location.placeName && (
                            <>
                              ,<i className="fa-solid fa-location-dot"></i>
                              <h6>{blog.location.placeName}</h6>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                    <div className="options">
                      <i
                        className="fa-solid fa-ellipsis-vertical"
                        onClick={() => toggleOptions(blog._id)}
                      ></i>
                      {showOptions === blog._id && (
                        <div className="options-menu">
                          {profileData?._id !== blog.profile_id && (
                            <button
                              className="opb"
                              onClick={() => handleBookmark(blog._id)}
                            >
                              <i className="fa-regular fa-bookmark"></i>
                              {bookmarkedBlogs.includes(blog._id)
                                ? "remove"
                                : "Bookmark"}
                            </button>
                          )}
                          {isAuthenticated &&
                            (user.name === "tricticle" ||
                              profileData?._id === blog.profile_id) && (
                              <button
                                className="opb"
                                onClick={() => handleDeleteBlog(blog._id)}
                              >
                                <i className="fa-regular fa-trash-can"></i>
                                Delete
                              </button>
                            )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div
                    className="blog-area"
                    onClick={() => toggleContentVisibility(blog._id)}
                  >
                    {blog.hashtags && (
                      <p>
                        {blog.hashtags.map((tag, index) => (
                          <span key={index} className="hashtag">
                            {" "}
                            #{tag}
                          </span>
                        ))}
                      </p>
                    )}
                    <h1>{blog.title}</h1>
                    {expandedBlogId === blog._id && (
                      <>
                        <h3>{blog.description}</h3>
                        <h4>{blog.content}</h4>
                      </>
                    )}
                  </div>
                  <div className="button-group">
                    {selectedBlogId === blog._id ? (
                      <>
                        <input
                          type="text"
                          placeholder="Type your Comment here"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                        />
                        <button onClick={() => postReply(blog._id)}>
                          Comment
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setSelectedBlogId(blog._id)}>
                        Comment
                      </button>
                    )}
                    <button
                      className={likedBlogs.includes(blog._id) ? "liked" : ""}
                      onClick={() => handleLike(blog._id)}
                    >
                      <i className="fas fa-heart"></i>
                    </button>
                  </div>
                  {repliesBlogs.map((reply) => {
                    if (reply.blog_id === blog._id) {
                      return (
                        <div className="replies" key={reply._id}>
                          <Link to={`/userprofile/${reply.user_id}`}>
                            <div className="user-info">
                              <img
                                className="avatar"
                                src={reply.avatar}
                                alt={`${reply.user_id} Avatar`}
                              />
                              <h3>{reply.username}</h3>
                            </div>
                          </Link>
                          <div className="reptext">
                            <p>{reply.text}</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
