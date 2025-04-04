import { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Avatar,
  Button,
  TextField,
  IconButton,
  Paper,
  Grid,
  Chip,
  Divider,
  useTheme,
} from "@mui/material";
import {
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  Edit as EditIcon,
  PhotoCamera,
  Article,
  Group,
  PersonAdd,
  Language,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { updateProfile } from "../api/profile";
import FollowersListDialog from "../components/FollowersListDialog";
import { alpha } from "@mui/material/styles";

interface SocialLink {
  platform: string;
  url: string;
  icon: JSX.Element;
  pattern: string;
  placeholder: string;
  label?: string;
  isValid?: boolean;
}

const validateSocialUrl = (url: string, pattern: string): boolean => {
  if (!url) return true;
  try {
    // Add https:// if no protocol is specified
    const urlWithProtocol = url.match(/^https?:\/\//) ? url : `https://${url}`;
    const regex = new RegExp(pattern);
    return regex.test(urlWithProtocol);
  } catch {
    return false;
  }
};

function Profile() {
  const theme = useTheme();
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    profilePicture: user?.profilePicture || "/default-avatar.png",
    socialLinks: [
      {
        platform: "Website",
        url: user?.socialLinks?.website || "",
        icon: <Language />,
        // Updated pattern to be more permissive for website URLs
        pattern:
          "^(https?://)?(([\\w-]+\\.)+[\\w-]{2,}|localhost)(:\\d+)?(/.*)?$",
        placeholder: "example.com or sub.example.com",
        label: "Personal Website",
      },
      {
        platform: "Facebook",
        url: user?.socialLinks?.facebook || "",
        icon: <Facebook />,
        pattern: "^(https?://)?(www\\.)?facebook\\.com/.*$",
        placeholder: "https://facebook.com/yourprofile",
      },
      {
        platform: "Twitter",
        url: user?.socialLinks?.twitter || "",
        icon: <Twitter />,
        pattern: "^(https?://)?(www\\.)?twitter\\.com/.*$",
        placeholder: "https://twitter.com/yourhandle",
      },
      {
        platform: "LinkedIn",
        url: user?.socialLinks?.linkedin || "",
        icon: <LinkedIn />,
        pattern: "^(https?://)?(www\\.)?linkedin\\.com/.*$",
        placeholder: "https://linkedin.com/in/yourprofile",
      },
      {
        platform: "Instagram",
        url: user?.socialLinks?.instagram || "",
        icon: <Instagram />,
        pattern: "^(https?://)?(www\\.)?instagram\\.com/.*$",
        placeholder: "https://instagram.com/yourhandle",
      },
    ],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [openDialog, setOpenDialog] = useState<
    "followers" | "following" | null
  >(null);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  // Initialize profile data when user data is loaded
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        bio: user.bio || "",
        profilePicture: user.profilePicture || "/default-avatar.png",
        socialLinks: [
          {
            platform: "Website",
            url: user.socialLinks?.website || "",
            icon: <Language />,
            // Updated pattern to be more permissive for website URLs
            pattern:
              "^(https?://)?(([\\w-]+\\.)+[\\w-]{2,}|localhost)(:\\d+)?(/.*)?$",
            placeholder: "example.com or sub.example.com",
            label: "Personal Website",
          },
          {
            platform: "Facebook",
            url: user.socialLinks?.facebook || "",
            icon: <Facebook />,
            pattern: "^(https?://)?(www\\.)?facebook\\.com/.*$",
            placeholder: "https://facebook.com/yourprofile",
          },
          {
            platform: "Twitter",
            url: user.socialLinks?.twitter || "",
            icon: <Twitter />,
            pattern: "^(https?://)?(www\\.)?twitter\\.com/.*$",
            placeholder: "https://twitter.com/yourhandle",
          },
          {
            platform: "LinkedIn",
            url: user.socialLinks?.linkedin || "",
            icon: <LinkedIn />,
            pattern: "^(https?://)?(www\\.)?linkedin\\.com/.*$",
            placeholder: "https://linkedin.com/in/yourprofile",
          },
          {
            platform: "Instagram",
            url: user.socialLinks?.instagram || "",
            icon: <Instagram />,
            pattern: "^(https?://)?(www\\.)?instagram\\.com/.*$",
            placeholder: "https://instagram.com/yourhandle",
          },
        ],
      });
    }
  }, [user]);

  const handleDialogClose = () => {
    setOpenDialog(null);
  };

  const handleStatsClick = (type: "followers" | "following") => {
    setOpenDialog(type);
  };

  const stats = [
    {
      label: "Posts",
      value: user?.postsCount || 0,
      icon: <Article sx={{ color: "primary.main", fontSize: 32 }} />,
    },
    {
      label: "Followers",
      value: user?.followers?.length || 0,
      icon: <Group sx={{ color: "primary.main", fontSize: 32 }} />,
      onClick: () => handleStatsClick("followers"),
    },
    {
      label: "Following",
      value: user?.following?.length || 0,
      icon: <PersonAdd sx={{ color: "primary.main", fontSize: 32 }} />,
      onClick: () => handleStatsClick("following"),
    },
  ];

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setProfileData((prevData) => ({
        ...prevData,
        profilePicture: previewUrl,
      }));
      // Store file for upload
      setProfilePicture(file);
    }
  };

  const handleSocialLinkChange = (platform: string, newUrl: string) => {
    setProfileData((prevData) => ({
      ...prevData,
      socialLinks: prevData.socialLinks.map((link) =>
        link.platform === platform
          ? {
              ...link,
              url: newUrl.trim(),
              isValid: validateSocialUrl(newUrl.trim(), link.pattern),
            }
          : link
      ),
    }));
  };

  const handleSave = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      setSaveError("");

      if (profileData.bio && profileData.bio.length > 500) {
        throw new Error("Bio cannot exceed 500 characters");
      }

      // Transform social links
      const socialLinks = {};
      for (const link of profileData.socialLinks) {
        if (link.url) {
          // Add https:// if no protocol is specified
          const urlWithProtocol = link.url.match(/^https?:\/\//)
            ? link.url
            : `https://${link.url}`;

          if (!validateSocialUrl(urlWithProtocol, link.pattern)) {
            throw new Error(`Invalid ${link.platform} URL`);
          }

          // Handle website field correctly
          const platformKey = link.platform.toLowerCase();
          socialLinks[platformKey === "website" ? "website" : platformKey] =
            urlWithProtocol;
        }
      }

      const updateData = {
        bio: profileData.bio,
        socialLinks,
        profilePicture: profilePicture || undefined,
      };

      console.log("Sending update data:", updateData);
      const response = await updateProfile(updateData);

      if (response.success) {
        // Clean up preview URL
        if (profilePicture) {
          URL.revokeObjectURL(profileData.profilePicture);
        }
        updateUser(response.user);
        setIsEditing(false);
        setProfilePicture(null);
        toast.success("Profile updated successfully!");
      }
    } catch (error: any) {
      const errorMessage =
        error.message || "Failed to update profile. Please try again.";
      setSaveError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkClick = (url: string, platform: string) => {
    if (!url) return;

    try {
      // Ensure URL has protocol
      const finalUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;
      window.open(finalUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(`Failed to open ${platform} link. Please check the URL.`);
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        elevation={2}
        sx={{
          mt: 4,
          p: 4,
          borderRadius: 4,
          background: theme.palette.background.paper,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h4" component="h1">
            My Profile
          </Typography>
          <Button
            startIcon={isEditing ? null : <EditIcon />}
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            variant={isEditing ? "contained" : "outlined"}
            disabled={isLoading}
          >
            {isEditing ? "Save Changes" : "Edit Profile"}
          </Button>
        </Box>
        <Box sx={{ position: "relative", mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              gap: 4,
            }}
          >
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={profileData.profilePicture}
                sx={{
                  width: 150,
                  height: 150,
                  border: `4px solid ${theme.palette.primary.main}`,
                }}
              />
              {isEditing && (
                <IconButton
                  color="primary"
                  aria-label="upload picture"
                  component="label"
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    backgroundColor: theme.palette.background.paper,
                    "&:hover": { backgroundColor: theme.palette.action.hover },
                  }}
                >
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={handleAvatarChange}
                  />
                  <PhotoCamera />
                </IconButton>
              )}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Typography variant="h4" component="h1" sx={{ mr: 2 }}>
                  {profileData.name || "Loading..."}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Chip
                  label={user?.role || "User"}
                  color="primary"
                  sx={{ mr: 1 }}
                />
                <Chip label={user?.email} color="secondary" sx={{ mr: 1 }} />
              </Box>
            </Box>
          </Box>
        </Box>
        {/* Enhanced Stats Display */}
        <Grid container spacing={3} sx={{ mt: 4, mb: 4 }}>
          {stats.map((stat) => (
            <Grid item xs={12} sm={4} key={stat.label}>
              <Paper
                elevation={0}
                onClick={stat.onClick}
                sx={{
                  p: 3,
                  height: "100%",
                  textAlign: "center",
                  borderRadius: 2,
                  bgcolor: "background.default",
                  transition: "transform 0.2s ease-in-out",
                  cursor: stat.onClick ? "pointer" : "default",
                  "&:hover": {
                    transform: stat.onClick ? "translateY(-4px)" : "none",
                    boxShadow: (theme) =>
                      stat.onClick
                        ? `0 4px 20px ${theme.palette.primary.main}25`
                        : "none",
                  },
                }}
              >
                <Box sx={{ mb: 2 }}>{stat.icon}</Box>
                <Typography
                  variant="h4"
                  color="primary"
                  sx={{ fontWeight: 700, mb: 1 }}
                >
                  {stat.value.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            About Me
          </Typography>
          {isEditing ? (
            <TextField
              fullWidth
              multiline
              rows={4}
              value={profileData.bio}
              onChange={(e) =>
                setProfileData((prevData) => ({
                  ...prevData,
                  bio: e.target.value,
                }))
              }
              placeholder="Write something about yourself..."
              variant="outlined"
              error={!!saveError}
              helperText={saveError}
            />
          ) : (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: "background.default",
                minHeight: "100px",
              }}
            >
              {profileData.bio || "No bio added yet."}
            </Typography>
          )}
        </Box>
        <Divider sx={{ my: 4 }} />

        <Box>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Social Links
          </Typography>
          <Grid container spacing={3}>
            {profileData.socialLinks.map((link) => (
              <Grid item xs={12} sm={6} key={link.platform}>
                {isEditing ? (
                  <TextField
                    fullWidth
                    label={link.label || link.platform}
                    value={link.url}
                    onChange={(e) =>
                      handleSocialLinkChange(link.platform, e.target.value)
                    }
                    placeholder={link.placeholder}
                    error={
                      !!link.url && !validateSocialUrl(link.url, link.pattern)
                    }
                    helperText={
                      link.url && !validateSocialUrl(link.url, link.pattern)
                        ? `Please enter a valid ${link.platform} URL`
                        : `Enter your ${link.platform} profile URL`
                    }
                    InputProps={{
                      startAdornment: (
                        <Box
                          sx={{
                            mr: 1,
                            color: link.url ? "primary.main" : "text.secondary",
                          }}
                        >
                          {link.icon}
                        </Box>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused": {
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor:
                              link.url &&
                              validateSocialUrl(link.url, link.pattern)
                                ? "success.main"
                                : undefined,
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <Button
                    fullWidth
                    variant="outlined"
                    disabled={!link.url}
                    onClick={() => handleLinkClick(link.url, link.platform)}
                    startIcon={link.icon}
                    sx={{
                      justifyContent: "flex-start",
                      py: 1.5,
                      opacity: link.url ? 1 : 0.6, // Add opacity for disabled state
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? alpha(theme.palette.primary.main, 0.1)
                          : alpha(theme.palette.primary.main, 0.05),
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.15
                        ),
                        transform: link.url ? "translateY(-2px)" : "none", // Only add hover effect if URL exists
                        transition: "transform 0.2s ease-in-out",
                      },
                      "& .MuiButton-startIcon": {
                        color: link.url ? "primary.main" : "text.secondary", // Change icon color based on URL existence
                      },
                      cursor: link.url ? "pointer" : "default", // Change cursor based on URL existence
                    }}
                  >
                    {link.url || `Add ${link.platform}`}
                  </Button>
                )}
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>
      <FollowersListDialog
        type={openDialog || "followers"}
        userId={user?._id || ""}
        onClose={handleDialogClose}
        open={!!openDialog}
      />
    </Container>
  );
}

export default Profile;
