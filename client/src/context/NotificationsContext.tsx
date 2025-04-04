import React, { createContext, useContext, useState, useEffect } from "react";
import { getNotifications } from "../services/userService";
import socketService from "../services/socketService";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "../hooks/useAuth"; // Corrected import path

interface Notification {
  _id: string;
  type: "follow" | "like" | "comment" | "mention";
  from: {
    _id: string;
    name: string;
    profilePicture: string;
  };
  blog?: {
    _id: string;
    title: string;
  };
  text: string;
  read: boolean;
  createdAt: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const { user } = useAuth();

  const fetchNotifications = async () => {
    try {
      // Only fetch if user is logged in
      if (!user?._id) {
        return;
      }

      const data = await getNotifications();
      setNotifications(data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Handle unauthorized error silently
        console.warn("User not authenticated for notifications");
        return;
      }
      const message =
        error.response?.data?.message || "Failed to fetch notifications";
      toast.error(message);
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user?._id) {
      const socket = socketService.connect(user._id);

      socket.on("notification", (newNotification: Notification) => {
        setNotifications((prev) => [newNotification, ...prev]);
        // Show toast notification
        toast.info(newNotification.text, {
          position: "bottom-right",
        });
      });

      return () => {
        socketService.disconnect();
      };
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (notificationId: string) => {
    try {
      await axios.put(`/api/users/notifications/${notificationId}`);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const refreshNotifications = async () => {
    await fetchNotifications();
  };

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, markAsRead, refreshNotifications }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  }
  return context;
};
