import axios from "axios";

const API_URL = "http://localhost:5000/api";

interface SocialLinks {
  website?: string; // This field must match exactly with what backend expects
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
}

interface ProfileUpdate {
  bio?: string;
  profilePicture?: string | File;
  socialLinks?: SocialLinks;
}

export const updateProfile = async (data: ProfileUpdate) => {
  try {
    const token = localStorage.getItem("token");
    const formData = new FormData();

    if (data.profilePicture instanceof File) {
      formData.append("profilePicture", data.profilePicture);
    }

    if (data.bio !== undefined) {
      formData.append("bio", data.bio);
    }

    if (data.socialLinks) {
      // Clean empty values before sending
      const cleanedLinks = Object.fromEntries(
        Object.entries(data.socialLinks).filter(([_, value]) => value)
      );
      formData.append("socialLinks", JSON.stringify(cleanedLinks));
    }

    const response = await axios.put(`${API_URL}/auth/profile`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update profile");
    }

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update profile"
    );
  }
};
