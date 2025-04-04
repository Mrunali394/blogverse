import { useState, useEffect } from "react";
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
  Tooltip,
  Skeleton,
} from "@mui/material";
import { PersonAdd, CheckCircle, CalendarMonth } from "@mui/icons-material";
import { followUser, unfollowUser } from "../services/userService";
import { toast } from "react-toastify";
import { alpha } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import FollowersListDialog from "./FollowersListDialog";

interface UserProfileCardProps {
  user: {
    _id: string;
    name: string;
    profilePicture?: string;
    bio?: string;
    followers?: number;
    following?: number;
    isFollowing: boolean;
    role?: string;
    joinedDate?: string;
  };
  onFollowChange?: (isFollowing: boolean) => void;
  isLoading?: boolean;
}

export default function UserProfileCard({
  user,
  onFollowChange,
  isLoading = false,
}: UserProfileCardProps) {
  const theme = useTheme();
  const { updateFollowerCount } = useAuth();
  const [isFollowing, setIsFollowing] = useState(user.isFollowing);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const [openDialog, setOpenDialog] = useState<
    "followers" | "following" | null
  >(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    setIsFollowing(user.isFollowing);
  }, [user._id, user.isFollowing]);

  const handleFollowersClick = () => {
    setOpenDialog("followers");
  };

  const handleFollowingClick = () => {
    setOpenDialog("following");
  };

  const handleCloseDialog = () => {
    setOpenDialog(null);
  };

  const handleFollowToggle = async () => {
    try {
      setIsLoadingFollow(true);
      if (isFollowing) {
        const response = await unfollowUser(user._id);
        if (!response.isFollowing) {
          setIsFollowing(false);
          updateFollowerCount(false);
          onFollowChange?.(false);
          toast.success("Unfollowed successfully");
        }
      } else {
        const response = await followUser(user._id);
        if (response.isFollowing) {
          setIsFollowing(true);
          updateFollowerCount(true);
          onFollowChange?.(true);
          toast.success("Following user");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update follow status", {
        icon: "😕",
      });
    } finally {
      setIsLoadingFollow(false);
    }
  };

  const truncateBio = (bio: string, maxLength: number = 120) => {
    if (bio.length <= maxLength) return bio;
    return `${bio.substring(0, maxLength)}...`;
  };

  if (isLoading) {
    return (
      <Card elevation={2} sx={{ p: 2 }}>
        <CardContent sx={{ p: 1 }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Skeleton variant="circular" width={80} height={80} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton variant="text" width="40%" height={24} />
              <Skeleton variant="text" width="80%" height={24} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card
        elevation={2}
        sx={{
          p: 2,
          position: "relative",
          transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
          },
        }}
      >
        <CardContent sx={{ p: 1 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                src={user.profilePicture}
                alt={user.name}
                sx={{
                  width: 80,
                  height: 80,
                  border: "3px solid",
                  borderColor: "primary.main",
                  boxShadow: `0 4px 12px ${alpha(
                    theme.palette.primary.main,
                    0.2
                  )}`,
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {user.name}
                </Typography>
                {user.role && (
                  <Typography
                    variant="body2"
                    color="primary"
                    sx={{ mb: 1, fontWeight: 500 }}
                  >
                    {user.role}
                  </Typography>
                )}
                <Tooltip title={user.bio || "No bio available"}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {user.bio ? truncateBio(user.bio) : "No bio available"}
                  </Typography>
                </Tooltip>
                {user.joinedDate && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <CalendarMonth fontSize="small" />
                    Joined {new Date(user.joinedDate).toLocaleDateString()}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", gap: 2 }}>
                <Tooltip title="View followers">
                  <Chip
                    size="medium"
                    label={`${user.followers || 0} followers`}
                    onClick={handleFollowersClick}
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: "primary.main",
                      fontWeight: 500,
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                      },
                    }}
                  />
                </Tooltip>
                <Tooltip title="View following">
                  <Chip
                    size="medium"
                    label={`${user.following || 0} following`}
                    onClick={handleFollowingClick}
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: "primary.main",
                      fontWeight: 500,
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                      },
                    }}
                  />
                </Tooltip>
              </Box>
              <Tooltip title={isFollowing ? "Unfollow user" : "Follow user"}>
                <Button
                  variant={isFollowing ? "outlined" : "contained"}
                  startIcon={
                    isFollowing ? (
                      isHovering ? null : (
                        <CheckCircle sx={{ color: "success.main" }} />
                      )
                    ) : (
                      <PersonAdd />
                    )
                  }
                  onClick={handleFollowToggle}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  disabled={isLoadingFollow}
                  sx={{
                    minWidth: 130,
                    height: 40,
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: 2,
                    ...(!isFollowing && {
                      background:
                        "linear-gradient(45deg, #024950 30%, #0FA4AF 90%)",
                      color: "white",
                      "&:hover": {
                        background:
                          "linear-gradient(45deg, #013137 30%, #0C8A96 90%)",
                        transform: "translateY(-2px)",
                      },
                    }),
                    ...(isFollowing && {
                      borderColor: isHovering ? "error.main" : "success.main",
                      color: isHovering ? "error.main" : "success.main",
                      bgcolor: isHovering
                        ? "rgba(211, 47, 47, 0.1)"
                        : "transparent",
                      "&:hover": {
                        borderColor: "error.main",
                        color: "error.main",
                        bgcolor: "rgba(211, 47, 47, 0.1)",
                      },
                    }),
                  }}
                >
                  {isLoadingFollow ? (
                    <CircularProgress size={20} />
                  ) : isFollowing ? (
                    isHovering ? (
                      "Unfollow"
                    ) : (
                      "Following"
                    )
                  ) : (
                    "Follow"
                  )}
                </Button>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <FollowersListDialog
        open={openDialog === "followers"}
        onClose={handleCloseDialog}
        userId={user._id}
        type="followers"
      />
      <FollowersListDialog
        open={openDialog === "following"}
        onClose={handleCloseDialog}
        userId={user._id}
        type="following"
      />
    </>
  );
}
