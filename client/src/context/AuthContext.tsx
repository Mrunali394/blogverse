import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
  role: string;
  followers: string[];
  following: string[];
  postsCount: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  clearError: () => void;
  updateFollowerCount: (isFollowing: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create axios instance with default config
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log("API Request:", {
      method: config.method,
      url: config.url,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log("API Response:", {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("API Response Error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );

  // Update axios authorization header when token changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await api.get("/auth/me");
          // Get posts count
          const statsRes = await api.get("/blogs/dashboard/stats");
          setUser({
            ...res.data,
            postsCount: statsRes.data.totalPosts || 0,
          });
        } catch (err) {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      console.log("Attempting login with email:", email);
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      console.log("Login response:", res.data);
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(userData);
      setError(null);
    } catch (err: any) {
      console.error("Login error details:", {
        response: err.response?.data,
        status: err.response?.status,
        error: err,
      });
      const errorMessage =
        err.response?.data?.msg ||
        err.response?.data?.message ||
        "An error occurred during login";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      if (!res.data.success) {
        throw new Error(res.data.message || "Registration failed");
      }

      const { token: newToken, user: userData } = res.data;
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(userData);
      setError(null);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.msg ||
        err.message ||
        "An error occurred during registration";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const forgotPassword = async (email: string) => {
    try {
      await api.post("/auth/forgot-password", { email });
      setError(null);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.msg ||
        err.response?.data?.message ||
        "An error occurred";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      await api.put(`/auth/reset-password/${token}`, { password });
      setError(null);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.msg ||
        err.response?.data?.message ||
        "An error occurred";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const clearError = () => setError(null);

  const updateFollowerCount = (isFollowing: boolean) => {
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        following: isFollowing
          ? [...(prev.following || []), user.id]
          : (prev.following || []).filter((id) => id !== user.id),
      };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        token,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        clearError,
        updateFollowerCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
