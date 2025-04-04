import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Box,
  Typography,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  Chip,
  Divider,
  useTheme,
  alpha,
} from "@mui/material";
import { TrendingUp, Visibility, Article, Schedule } from "@mui/icons-material";
import { getUserProfile } from "../services/userService";
import { useAuth } from "../context/AuthContext";
import UserProfileCard from "../components/UserProfileCard";
import BlogCard from "../components/BlogCard";

interface UserProfile {
  _id: string;
  name: string;
  bio: string;
  profilePicture?: string;
  followers: number;
  following: number;
  blogs: any[];
  isFollowing?: boolean;
  expertise?: string[];
  postsCount?: number;
  totalViews?: number;
  topCategory?: string;
  joinedDate?: string;
}

const PROFILE_STATS = [
  {
    icon: <Article />,
    label: "Total Posts",
    getValue: (profile: UserProfile) => profile?.postsCount || 0,
  },
  {
    icon: <Visibility />,
    label: "Total Views",
    getValue: (profile: UserProfile) => profile?.totalViews || 0,
  },
  {
    icon: <TrendingUp />,
    label: "Top Category",
    getValue: (profile: UserProfile) => profile?.topCategory || "N/A",
  },
  {
    icon: <Schedule />,
    label: "Member Since",
    getValue: (profile: UserProfile) =>
      profile?.joinedDate ? new Date(profile.joinedDate).getFullYear() : "N/A",
  },
];

function UserProfile() {
  const theme = useTheme();
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const filterValidBlogs = (blogs: any[]) => {
    return blogs.filter(
      (blog) =>
        blog._id &&
        blog.title &&
        blog.content &&
        blog.category &&
        blog.createdAt &&
        blog.user
    );
  };

  useEffect(() => {
    if (currentUser?._id === userId) {
      navigate("/me");
    }
  }, [currentUser, userId, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        if (!userId) {
          setError("Invalid user ID");
          return;
        }

        const data = await getUserProfile(userId);
        if (data) {
          data.blogs = filterValidBlogs(data.blogs || []);
          setProfile(data);
        }
      } catch (error: any) {
        console.error("Profile fetch error:", error);
        setError(error.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography color="error">{error || "Profile not found"}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <UserProfileCard
            user={profile}
            onFollowChange={(isFollowing) => {
              setProfile((prev) =>
                prev
                  ? {
                      ...prev,
                      isFollowing,
                      followers: prev.followers + (isFollowing ? 1 : -1),
                    }
                  : null
              );
            }}
          />

          <Paper sx={{ mt: 3, p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Stats
            </Typography>
            <Grid container spacing={2}>
              {PROFILE_STATS.map((stat, index) => (
                <Grid item xs={6} key={index}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      p: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      borderRadius: 2,
                      transition: "transform 0.2s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                      },
                    }}
                  >
                    <Box
                      sx={{
                        color: "primary.main",
                        mb: 1,
                        "& svg": { fontSize: 28 },
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      {stat.label}
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 600 }}>
                      {typeof stat.getValue(profile) === "number"
                        ? stat.getValue(profile).toLocaleString()
                        : stat.getValue(profile)}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {profile?.expertise && profile.expertise.length > 0 && (
            <Paper sx={{ mt: 3, p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Expertise
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {profile.expertise.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    color="primary"
                    variant="outlined"
                    sx={{
                      borderRadius: 1,
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                      },
                    }}
                  />
                ))}
              </Box>
            </Paper>
          )}
        </Grid>

        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 4 }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                mb: 3,
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  minWidth: 120,
                },
              }}
            >
              <Tab label="Posts" />
              <Tab label="About" />
              <Tab label="Activity" />
            </Tabs>
          </Box>

          {activeTab === 0 && (
            <Grid container spacing={3}>
              {profile?.blogs.length > 0 ? (
                profile.blogs.map((blog) => (
                  <Grid item xs={12} sm={6} key={blog._id}>
                    <BlogCard post={blog} />
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography
                    color="text.secondary"
                    textAlign="center"
                    sx={{ py: 8 }}
                  >
                    No posts yet
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="body1" paragraph>
                {profile?.bio || "No bio available"}
              </Typography>
              <Divider sx={{ my: 3 }} />
              {/* Add more about section content here */}
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              {/* Add activity timeline here */}
              <Typography color="text.secondary" textAlign="center">
                Coming soon...
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

export default UserProfile;
