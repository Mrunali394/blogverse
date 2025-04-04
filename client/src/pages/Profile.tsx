import { useState } from "react";
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
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { updateProfile } from "../api/profile";
import FollowersListDialog from "../components/FollowersListDialog";

interface SocialLink {
  platform: string;
  url: string;
  icon: JSX.Element;
}

function Profile() {
  const theme = useTheme();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState(
    user?.profilePicture || "/default-avatar.png"
  );
  const [bio, setBio] = useState("");
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { platform: "Facebook", url: "", icon: <Facebook /> },
    { platform: "Twitter", url: "", icon: <Twitter /> },
    { platform: "LinkedIn", url: "", icon: <LinkedIn /> },
    { platform: "Instagram", url: "", icon: <Instagram /> },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [openDialog, setOpenDialog] = useState<"followers" | "following" | null>(null);

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
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSocialLinkChange = (platform: string, newUrl: string) => {
    setSocialLinks((prevLinks) =>
      prevLinks.map((link) =>
        link.platform === platform ? { ...link, url: newUrl } : link
      )
    );
  };

  const handleSave = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      setSaveError("");

      // Validate fields
      if (bio && bio.length > 500) {
        throw new Error("Bio cannot exceed 500 characters");
      }

      // Validate social links
      for (const link of socialLinks) {
        if (link.url && !isValidUrl(link.url)) {
          throw new Error(`Invalid ${link.platform} URL`);
        }
      }

      await updateProfile({
        bio,
        socialLinks,
        avatar,
      });

      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      setSaveError(
        error.message || "Failed to update profile. Please try again."
      );
      console.error("Profile update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
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
                src={user?.profilePicture || avatar}
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
                  {user?.name || "Loading..."}
                </Typography>
                <Button
                  startIcon={<EditIcon />}
                  onClick={
                    isEditing ? handleSave : () => setIsEditing(!isEditing)
                  }
                  variant={isEditing ? "contained" : "outlined"}
                  disabled={isLoading}
                >
                  {isEditing ? "Save Profile" : "Edit Profile"}
                </Button>
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
                      stat.onClick ? `0 4px 20px ${theme.palette.primary.main}25` : "none",
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

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            About Me
          </Typography>
          {isEditing ? (
            <TextField
              fullWidth
              multiline
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
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
              {bio || "No bio added yet."}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Social Links
          </Typography>
          <Grid container spacing={2}>
            {socialLinks.map((link) => (
              <Grid item xs={12} sm={6} key={link.platform}>
                {isEditing ? (
                  <TextField
                    fullWidth
                    label={link.platform}
                    value={link.url}
                    onChange={(e) =>
                      handleSocialLinkChange(link.platform, e.target.value)
                    }
                    InputProps={{
                      startAdornment: (
                        <Box sx={{ mr: 1, color: "text.secondary" }}>
                          {link.icon}
                        </Box>
                      ),
                    }}
                  />
                ) : (
                  <Button
                    fullWidth
                    startIcon={link.icon}
                    href={link.url}
                    target="_blank"
                    disabled={!link.url}
                    variant="outlined"
                    sx={{ justifyContent: "flex-start" }}
                  >
                    {link.platform}
                  </Button>
                )}
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>

      <FollowersListDialog
        open={!!openDialog}
        onClose={handleDialogClose}
        userId={user?._id || ""}
        type={openDialog || "followers"}
      />
    </Container>
  );
}

export default Profile;
