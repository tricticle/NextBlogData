import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Like = ({ profileId }) => {
  const { isAuthenticated, user, loginWithRedirect } = useAuth0();
  const [profileData, setProfileData] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [selectedBlogId, setSelectedBlogId] = useState(null);
  const [repliesBlogs, setRepliesBlogs] = useState([]);
  const [likedBlogs, setLikedBlogs] = useState([]);
  const [bookmarkedBlogs, setBookmarkedBlogs] = useState([]);
  const [showOptions, setShowOptions] = useState(null);
  const [followStatus, setFollowStatus] = useState({});
    const [expandedBlogId, setExpandedBlogId] = useState(null);

    const toggleContentVisibility = (id) => {
      setExpandedBlogId((prevId) => (prevId === id ? null : id));
    };

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

  const handleFollow = async (followingId, followingUsername) => {
    try {
      if (!isAuthenticated) {
        loginWithRedirect();
        return;
      }
      const isFollowing = followStatus[followingId];
      const method = isFollowing ? "DELETE" : "POST";

      const response = await fetch("/api/follow", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          follower_id: profileData._id,
          follower_username: profileData.username,
          following_id: followingId,
          following_username: followingUsername,
        }),
      });

      if (response.ok) {
        // Instead of relying on the current state, check the response from the server
        const newFollowStatus = await fetchFollowStatus(followingId);
        console.log(
          `User ${isFollowing ? "unfollowed" : "followed"} successfully`
        );
        toast.success(
          `User ${isFollowing ? "unfollowed" : "followed"} successfully`,
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
        setFollowStatus((prevStatus) => ({
          ...prevStatus,
          [followingId]: newFollowStatus,
        }));
      } else {
        console.error(`Failed to ${isFollowing ? "unfollow" : "follow"} user`);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchFollowStatus = async (userId) => {
    try {
      const response = await fetch(
        `/api/follow?follower_id=${profileData._id}&following_id=${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const follow = await response.json();
        setFollowStatus((prevStatus) => ({
          ...prevStatus,
          [userId]: follow ? "Following" : "Follow",
        }));
        return follow ? "Following" : "Follow"; // Return the follow status
      } else if (
        response.status === 404 &&
        response.statusText === "Not Found"
      ) {
        // Follow relationship not found, assuming not being followed
        setFollowStatus((prevStatus) => ({
          ...prevStatus,
          [userId]: "Follow",
        }));
        console.log(
          "Follow relationship not found, assuming not being followed"
        );
        return "Follow";
      } else {
        console.error("Failed to fetch follow status");
        return null; // or handle the error appropriately
      }
    } catch (error) {
      console.error("Error:", error);
      return null; // or handle the error appropriately
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
      blogs.forEach((blog) => fetchFollowStatus(blog.profile_id));
    }
  }, [profileData]);

  useEffect(() => {
    if (profileData && profileData._id) {
      blogs.forEach((blog) => fetchFollowStatus(blog.profile_id));
    }
  }, [blogs]);

  return (
    <>
      <div className="post-section">
        <div className="blog-grid">
          <div className="twee-map">
            {blogs
              .filter((blog) => likedBlogs.includes(blog._id))
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
                    <div className="fobtn">
                      {profileData?._id !== blog.profile_id && (
                        <button
                          className="fbtn"
                          onClick={() =>
                            handleFollow(blog.profile_id, blog.username)
                          }
                        >
                          {followStatus[blog.profile_id] === "Following"
                            ? "Following"
                            : "Follow"}
                        </button>
                      )}
                    </div>
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

export default Like;
