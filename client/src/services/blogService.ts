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
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    const requestData = {
      title: blogData.title.trim(),
      content: blogData.content.trim(),
      category: blogData.category.trim(),
      coverImage: blogData.coverImage?.trim() || "",
      isDraft: Boolean(blogData.isDraft),
      status: blogData.isDraft ? "draft" : "published",
      publishedAt: blogData.isDraft ? null : new Date().toISOString(),
    };

    const contentLength = requestData.content.length;
    const maxContentLength = 100000; // 100KB limit

    // Validate content length before making the request
    if (contentLength > maxContentLength) {
      throw new Error(
        `Content exceeds maximum length of ${maxContentLength} characters (current: ${contentLength})`
      );
    }

    // Validate content length after stripping HTML
    const textContent = requestData.content.replace(/<[^>]*>/g, "").trim();

    // Basic validations
    if (!requestData.title || requestData.title.length < 5) {
      throw new Error("Title must be at least 5 characters long");
    }

    if (requestData.title.length > 200) {
      throw new Error("Title must be less than 200 characters");
    }

    if (!requestData.category) {
      throw new Error("Category is required");
    }

    if (textContent.length < 50) {
      throw new Error(
        "Content must be at least 50 characters long (without HTML)"
      );
    }

    console.log("Sending blog creation request:", {
      ...requestData,
      contentLength,
      title: requestData.title,
      category: requestData.category,
    });

    const response = await axios.post(API_URL, requestData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
      validateStatus: (status) => status < 500, // Don't reject if status < 500
    });

    if (response.status === 400) {
      throw new Error(response.data.message || "Validation failed");
    }

    return response.data;
  } catch (error: any) {
    console.error("Blog creation error details:", {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
      data: error.response?.data,
    });

    // Handle different types of errors
    if (error.response?.status === 400) {
      throw new Error(error.response.data.message);
    }

    throw new Error(error.message || "Failed to create blog post");
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
