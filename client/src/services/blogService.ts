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
    const formattedCategory = encodeURIComponent(category.toLowerCase().trim());
    const response = await axios.get(
      `${API_URL}/category/${formattedCategory}`
    );
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

export const getBlogStats = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching stats:", error);
    throw new Error("Failed to fetch blog stats");
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
