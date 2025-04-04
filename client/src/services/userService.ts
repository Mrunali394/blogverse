import axios from "axios";

const API_URL = "http://localhost:5000/api/users";

interface FollowResponse {
  isFollowing: boolean;
  followers: number;
  following: number;
  message: string;
}

export const followUser = async (userId: string): Promise<FollowResponse> => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post<FollowResponse>(
      `${API_URL}/${userId}/follow`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.data) {
      throw new Error("No response data");
    }

    return response.data;
  } catch (error: any) {
    if (
      error.response?.status === 400 &&
      error.response.data?.message === "Already following this user"
    ) {
      return {
        isFollowing: true,
        followers: error.response.data.followers || 0,
        following: error.response.data.following || 0,
        message: "Already following this user",
      };
    }

    const message = error.response?.data?.message || "Failed to follow user";
    throw new Error(message);
  }
};

export const unfollowUser = async (userId: string) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${API_URL}/${userId}/unfollow`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    // Return the updated state immediately
    return {
      isFollowing: false,
      followersCount: response.data.followers?.length || 0,
      followingCount: response.data.following?.length || 0,
    };
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to unfollow user";
    console.error("Unfollow error:", error);
    throw new Error(message);
  }
};

export const bookmarkBlog = async (blogId: string) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${API_URL}/bookmarks/${blogId}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const getNotifications = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await axios.get(`${API_URL}/notifications`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const searchBlogs = async (query: string, filters: any = {}) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/search`, {
    params: { query, ...filters },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const searchUsers = async (query: string) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/search`, {
      params: { query },
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (error: any) {
    console.error("Error searching users:", error);
    throw new Error(error.response?.data?.message || "Failed to search users");
  }
};

export const getUserLikedPosts = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/liked-posts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getUserBookmarkedPosts = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/bookmarks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getUserProfile = async (userId: string | undefined) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const token = localStorage.getItem("token");
    console.log("Fetching profile for user:", userId);

    const response = await axios.get(`${API_URL}/profile/${userId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.data) {
      throw new Error("No profile data received");
    }

    console.log("Profile data received:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    if (error.response?.status === 404) {
      throw new Error("User not found");
    }
    if (error.response?.status === 500) {
      throw new Error("Server error while fetching profile");
    }
    throw new Error(error.message || "Failed to fetch user profile");
  }
};

export const getDiscoverUsers = async (page = 1, limit = 10) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/discover`, {
      params: { page, limit },
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching users:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch users");
  }
};

export const getFollowers = async (userId: string) => {
  const response = await axios.get(`${API_URL}/${userId}/followers`);
  return response.data;
};

export const getFollowing = async (userId: string) => {
  const response = await axios.get(`${API_URL}/${userId}/following`);
  return response.data;
};

export const getFeedPosts = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get("/api/blogs/feed", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getRecommendedPosts = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get("/api/blogs/recommendations", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
