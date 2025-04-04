import axios from "axios";

const API_URL = "http://localhost:5000/api/blogs";

interface BlogData {
  title: string;
  content: string;
  category: string;
  coverImage?: string;
  isDraft: boolean;
  status?: string;
  publishedAt?: Date | null;
}

export const createBlog = async (blogData: BlogData) => {
  const token = localStorage.getItem("token");
  try {
    console.log("Creating blog with data:", blogData); // Add logging

    const response = await axios.post(
      API_URL,
      {
        ...blogData,
        isDraft: Boolean(blogData.isDraft), // Ensure boolean conversion
        status: blogData.isDraft ? "draft" : "published",
        publishedAt: blogData.isDraft ? null : new Date(),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Blog creation response:", response.data); // Add logging
    return response.data;
  } catch (error: any) {
    console.error("Error creating blog:", error.response?.data || error);
    throw error;
  }
};

export const getUserDrafts = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    const response = await axios.get(`${API_URL}/drafts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching drafts:", error);
    if (error.response?.status === 404) {
      return []; // Return empty array if no drafts found
    }
    throw new Error(error.response?.data?.message || "Failed to fetch drafts");
  }
};

export const publishDraft = async (blogId: string) => {
  const token = localStorage.getItem("token");
  const response = await axios.put(
    `${API_URL}/${blogId}/publish`,
    {
      isDraft: false,
      status: "published",
      publishedAt: new Date(),
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const getBlog = async (id: string) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const getAllBlogs = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching blogs:",
      error.response?.data || error.message || error
    );
    throw new Error(error.response?.data?.message || "Failed to fetch blogs");
  }
};

export const getBlogsByCategory = async (category: string) => {
  try {
    // Keep original case but trim whitespace
    const formattedCategory = encodeURIComponent(category.trim());
    console.log("Requesting category:", formattedCategory);

    const response = await axios.get(
      `${API_URL}/category/${formattedCategory}`
    );
    console.log("Category response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching blogs by category:", error);
    throw new Error(
      error.response?.data?.message ||
        `Failed to fetch blogs for category "${category}"`
    );
  }
};

export const getCategories = async () => {
  try {
    const response = await axios.get(`${API_URL}/categories`);
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  }
};

interface BlogStats {
  totalViews: number;
  totalComments: number;
  averageReadTime: number;
  engagementRate: number;
  categoryCounts: Array<{ name: string; value: number }>;
  viewTrend: Array<{ name: string; views: number; trend: number }>;
}

export const getBlogStats = async (): Promise<BlogStats> => {
  try {
    const response = await axios.get(`${API_URL}/stats`);
    return {
      totalViews: response.data.totalViews || 0,
      totalComments: response.data.totalComments || 0,
      averageReadTime: response.data.averageReadTime || 0,
      engagementRate: response.data.engagementRate || 0,
      categoryCounts: response.data.categoryCounts || [],
      viewTrend: response.data.viewTrend || [],
    };
  } catch (error) {
    console.error("Error fetching blog stats:", error);
    throw new Error("Failed to fetch blog statistics");
  }
};

export const getAnalytics = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/analytics`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching analytics:", error);
    throw new Error("Failed to fetch analytics data");
  }
};

export const getRecentActivity = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/recent-activity`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching activity:", error);
    throw new Error("Failed to fetch recent activity");
  }
};

export const likeBlog = async (blogId: string) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/${blogId}/like`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error liking blog:", error);
    throw new Error("Failed to like blog");
  }
};

export const addComment = async (blogId: string, text: string) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await axios.post(
      `${API_URL}/${blogId}/comments`,
      { text },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.data) {
      throw new Error("No data received from server");
    }

    return response.data;
  } catch (error: any) {
    console.error("Error adding comment:", error);
    throw new Error(
      error.response?.data?.message || error.message || "Failed to add comment"
    );
  }
};

export const addReply = async (
  blogId: string,
  commentId: string,
  text: string
) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await axios.post(
      `${API_URL}/${blogId}/comments/${commentId}/replies`,
      { text },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data) {
      throw new Error("No data received from server");
    }

    // Return the updated comments array
    return response.data;
  } catch (error: any) {
    console.error("Error adding reply:", error.response?.data || error);
    throw new Error(
      error.response?.data?.message || error.message || "Failed to add reply"
    );
  }
};

export const searchBlogs = async (query: string, page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${API_URL}/v1/search`, {
      params: { query, page, limit },
    });
    return response.data;
  } catch (error) {
    console.error("Search error:", error);
    throw new Error("Failed to search blogs");
  }
};

export const getUserLikedPosts = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(`${API_URL}/user/liked`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching liked posts:", error);
    throw new Error("Failed to fetch liked posts");
  }
};

export const getUserBookmarkedPosts = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(`${API_URL}/user/bookmarks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching bookmarked posts:", error);
    throw new Error("Failed to fetch bookmarked posts");
  }
};

export const getUserPosts = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    const response = await axios.get(`${API_URL}/user/posts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching user posts:", error);
    if (error.response?.status === 404) {
      return []; // Return empty array if no posts found
    }
    throw new Error(
      error.response?.data?.message || "Failed to fetch your posts"
    );
  }
};
