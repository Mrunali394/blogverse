import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Box,
  Chip,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { PersonAdd, CheckCircle } from "@mui/icons-material";
import { followUser, unfollowUser } from "../services/userService";
import { toast } from "react-toastify";
import { alpha } from "@mui/material";
import { useAuth } from "../context/AuthContext";

interface UserProfileCardProps {
  user: {
    _id: string;
    name: string;
    profilePicture?: string;
    bio?: string;
    followers?: number;
    isFollowing?: boolean;
  };
  onFollowChange?: (isFollowing: boolean) => void;
}

export default function UserProfileCard({
  user,
  onFollowChange,
}: UserProfileCardProps) {
  const theme = useTheme();
  const { updateFollowerCount } = useAuth();
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollowToggle = async () => {
    try {
      setIsLoading(true);
      if (isFollowing) {
        const response = await unfollowUser(user._id);
        updateFollowerCount(false);
        onFollowChange?.(false);
      } else {
        const response = await followUser(user._id);
        updateFollowerCount(true);
        onFollowChange?.(true);
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      toast.error("Failed to update follow status", {
        icon: "😕",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      elevation={2}
      sx={{
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            src={user.profilePicture}
            alt={user.name}
            sx={{
              width: 60,
              height: 60,
              border: "3px solid",
              borderColor: "primary.main",
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
              transition: "transform 0.3s ease-in-out",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                background: "linear-gradient(45deg, #024950 30%, #0FA4AF 90%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {user.name}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              sx={{ mb: 1 }}
            >
              {user.bio || "No bio available"}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Chip
                size="small"
                label={`${user.followers || 0} followers`}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: "primary.main",
                  fontWeight: 500,
                }}
              />
            </Box>
          </Box>
          <Button
            variant={isFollowing ? "outlined" : "contained"}
            startIcon={
              isFollowing ? (
                <CheckCircle sx={{ color: "success.main" }} />
              ) : (
                <PersonAdd />
              )
            }
            onClick={handleFollowToggle}
            disabled={isLoading}
            sx={{
              minWidth: 120,
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2,
              py: 1,
              ...(!isFollowing && {
                background: "linear-gradient(45deg, #024950 30%, #0FA4AF 90%)",
                color: "white",
                "&:hover": {
                  background:
                    "linear-gradient(45deg, #013137 30%, #0C8A96 90%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 16px -4px rgba(15, 164, 175, 0.2)",
                },
              }),
              ...(isFollowing && {
                borderColor: "success.main",
                color: "success.main",
                "&:hover": {
                  borderColor: "error.main",
                  color: "error.main",
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  "& .MuiSvgIcon-root": {
                    color: "error.main",
                  },
                },
              }),
            }}
          >
            {isLoading ? (
              <CircularProgress
                size={20}
                color={isFollowing ? "inherit" : "inherit"}
              />
            ) : isFollowing ? (
              "Following"
            ) : (
              "Follow"
            )}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
