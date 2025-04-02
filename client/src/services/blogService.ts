import axios from "axios";

const API_URL = "http://localhost:5000/api/blogs";

export const createBlog = async (blogData: {
  title: string;
  content: string;
  category: string;
  coverImage?: string;
}) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(API_URL, blogData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
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
