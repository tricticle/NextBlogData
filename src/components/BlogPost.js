import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

const BlogPost = () => {
  const [blogTitle, setBlogTitle] = useState("");
  const [blogDescription, setBlogDescription] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [useLocation, setUseLocation] = useState(false);
  const { isAuthenticated, user } = useAuth0();
  const [profileData, setProfileData] = useState(null);

  const handleProfile = async () => {
    try {
      const response = await axios.post("/api/profile", {
        username: user.name,
        avatar: user.picture,
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
        throw new Error("Failed to add profile");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      addProfile();
    }
  }, [isAuthenticated, user]);

  const postBlog = async () => {
    try {
      // Check if profileData is available
      if (!profileData || !profileData._id) {
        console.error("Profile data is not available");
        return;
      }

      // Use navigator.geolocation to get the user's current location
      let location = null;
      if (navigator.geolocation && useLocation) {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        location = {
          type: "Point",
          coordinates: [position.coords.longitude, position.coords.latitude],
        };
      }

      const response = await fetch("/api/blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: blogTitle,
          description: blogDescription,
          content: blogContent,
          profile_id: profileData._id,
          hashtags: hashtags.split(/[\s,]+/).filter((tag) => tag !== ""),
          location,
        }),
      });

      if (response.ok) {
        console.log("Blog posted successfully");
        setBlogTitle("");
        setBlogDescription("");
        setBlogContent("");
        setHashtags("");
      } else {
        const data = await response.json();
        if (
          response.status === 400 &&
          data.error === "Blog contains blocked words"
        ) {
          alert(`Blog contains blocked word: ${data.blockedWord}`);
        } else {
          console.error("Failed to post blog");
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="tpsec">
      <div className="blog-post-2">
        <input
          type="text"
          placeholder="Add Title"
          value={blogTitle}
          onChange={(e) => setBlogTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Add description"
          value={blogDescription}
          onChange={(e) => setBlogDescription(e.target.value)}
        />
        <textarea
          placeholder="What's happening?"
          value={blogContent}
          onChange={(e) => setBlogContent(e.target.value)}
        />
        <input
          type="text"
          placeholder="Add hashtags"
          value={hashtags}
          onChange={(e) => setHashtags(e.target.value)}
        />
        <div className="location">
          <input
            type="checkbox"
            checked={useLocation}
            onChange={() => setUseLocation(!useLocation)}
          />
          location
        </div>
        <button onClick={postBlog}>Blog</button>
      </div>
    </div>
  );
};

export default BlogPost;
