import axios from "axios";

const API_URL = "http://localhost:5000/api/users";

export const followUser = async (userId: string) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${API_URL}/${userId}/follow`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return {
      ...response.data,
      followersCount: response.data.followers?.length || 0,
      followingCount: response.data.following?.length || 0,
    };
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to follow user";
    console.error("Follow error:", error);
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
    return {
      ...response.data,
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
  const response = await axios.get(`${API_URL}/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
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

export const getUserProfile = async (userId: string) => {
  try {
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
    throw new Error(
      error.response?.data?.message || "Failed to fetch user profile"
    );
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
