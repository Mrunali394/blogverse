import axios from "axios";

const API_URL = "http://localhost:5000/api/blogs"; // Changed from users to blogs

interface DashboardStats {
  totalPosts: number;
  followers: number;
  following: number;
  comments: number;
  stats: {
    views: number;
    likes: number;
    engagement: number;
  };
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(`${API_URL}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw new Error("Failed to fetch dashboard statistics");
  }
};

export const getRecentActivity = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(`${API_URL}/dashboard/activity`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    throw new Error("Failed to fetch recent activity");
  }
};
