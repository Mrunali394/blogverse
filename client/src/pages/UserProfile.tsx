import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Grid,
  Box,
  Typography,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
} from "@mui/material";
import { getUserProfile } from "../services/userService";
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
}

function UserProfile() {
  const { userId } = useParams();
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
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getUserProfile(userId as string);
        // Filter out invalid blog entries
        data.blogs = filterValidBlogs(data.blogs);
        setProfile(data);
      } catch (error: any) {
        setError(error.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
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
              Stats
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Followers
                </Typography>
                <Typography variant="h6">{profile.followers}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Following
                </Typography>
                <Typography variant="h6">{profile.following}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                },
              }}
            >
              <Tab label="Posts" />
              <Tab label="About" />
            </Tabs>
          </Box>

          {activeTab === 0 ? (
            <Grid container spacing={3}>
              {profile.blogs.map((blog) => (
                <Grid item xs={12} sm={6} key={blog._id}>
                  <BlogCard post={blog} />
                </Grid>
              ))}
              {profile.blogs.length === 0 && (
                <Grid item xs={12}>
                  <Typography color="text.secondary" textAlign="center">
                    No posts yet
                  </Typography>
                </Grid>
              )}
            </Grid>
          ) : (
            <Box>
              <Typography variant="body1" paragraph>
                {profile.bio || "No bio available"}
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

export default UserProfile;
