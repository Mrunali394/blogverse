import axios from "axios";

const API_URL = "http://localhost:5000/api";

interface ProfileUpdate {
  bio?: string;
  socialLinks?: Array<{
    platform: string;
    url: string;
  }>;
  avatar?: string;
}

export const updateProfile = async (data: ProfileUpdate) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.put(`${API_URL}/users/profile`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to update profile";
    throw new Error(message);
  }
};
