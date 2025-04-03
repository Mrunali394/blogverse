import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  CircularProgress,
  Paper,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  useTheme,
  Skeleton,
  Divider,
  Tabs,
  Tab,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  Person,
  Assessment,
  CheckCircle,
  Create,
  Settings,
  Analytics,
  Timer,
  Edit,
  Favorite,
  Comment,
  BookmarkBorder,
  FavoriteBorder,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getUserPosts,
  getUserLikedPosts,
  getUserBookmarkedPosts,
  getUserDrafts,
} from "../services/blogService";
import {
  getDashboardStats,
  getRecentActivity,
} from "../services/dashboardService";
import { toast } from "react-toastify";
import BlogCard from "../components/BlogCard";

interface BlogPost {
  _id: string;
  title: string;
  content: string;
  category: string;
  coverImage?: string;
  createdAt: string;
  status?: string;
}

interface Stats {
  totalPosts: number;
  followers: number;
  following: number;
  completedTasks: number;
  comments?: number;
}

interface DashboardStats {
  totalPosts: number;
  followers: number;
  following: number;
  comments: number;
  stats: {
    views: number;
    likes: number;
    engagement: number;
  };
}

function Dashboard() {
  const theme = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    followers: 0,
    following: 0,
    completedTasks: 0,
    comments: 0,
  });
  const [activeTab, setActiveTab] = useState(0);
  const [likedPosts, setLikedPosts] = useState<BlogPost[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<BlogPost[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [draftPosts, setDraftPosts] = useState<BlogPost[]>([]);
  const [isDraftsLoading, setIsDraftsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [userPosts, likedData, bookmarkedData, statsData, draftsData] =
          await Promise.all([
            getUserPosts(),
            getUserLikedPosts(),
            getUserBookmarkedPosts(),
            getDashboardStats(),
            getUserDrafts(),
          ]);

        setPosts(userPosts);
        setLikedPosts(likedData);
        setBookmarkedPosts(bookmarkedData);
        setDashboardStats(statsData);
        setDraftPosts(draftsData);

        setStats({
          totalPosts: statsData.totalPosts,
          followers: statsData.followers,
          following: statsData.following,
          comments: statsData.comments,
        });
      } catch (error: any) {
        const message =
          error.response?.data?.message || "Failed to load dashboard data";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
        setIsDraftsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statsConfig = [
    {
      title: "Total Posts",
      value: dashboardStats?.totalPosts || 0,
      icon: <Assessment />,
      color: "#0FA4AF",
      gradient: "linear-gradient(135deg, #0FA4AF 0%, #024950 100%)",
      trend: `${(dashboardStats?.stats?.engagement || 0).toFixed(1)}%`,
    },
    {
      title: "Following",
      value: dashboardStats?.following || 0,
      icon: <Person />,
      color: "#4CAF50",
      gradient: "linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)",
      trend: "+5%",
    },
    {
      title: "Followers",
      value: dashboardStats?.followers || 0,
      icon: <Favorite />,
      color: "#FF4081",
      gradient: "linear-gradient(135deg, #FF4081 0%, #C51162 100%)",
      trend: "+8%",
    },
    {
      title: "Comments",
      value: dashboardStats?.comments || 0,
      icon: <Comment />,
      color: "#7C4DFF",
      gradient: "linear-gradient(135deg, #7C4DFF 0%, #651FFF 100%)",
      trend: `+${((dashboardStats?.stats?.engagement || 0) * 100).toFixed(1)}%`,
    },
  ];

  const tabContent = [
    {
      label: "My Posts",
      content: posts,
      loading: loading,
    },
    {
      label: "Drafts",
      content: draftPosts,
      loading: isDraftsLoading,
    },
    {
      label: `Liked (${likedPosts.length})`,
      content: likedPosts,
      loading: loading,
    },
    {
      label: `Bookmarked (${bookmarkedPosts.length})`,
      content: bookmarkedPosts,
      loading: loading,
    },
  ];

  if (loading) {
    return (
      <Container sx={{ mt: 4, mb: 8 }}>
        <Grid container spacing={3}>
          {[...Array(4)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper sx={{ p: 3 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="text" sx={{ mt: 2 }} />
                <Skeleton variant="text" width="60%" />
              </Paper>
            </Grid>
          ))}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Skeleton variant="text" sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={200} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Skeleton variant="text" sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={200} />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4, textAlign: "center" }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Header Section */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 700,
            background: "linear-gradient(45deg, #024950 30%, #0FA4AF 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 2,
          }}
        >
          Welcome back, {user?.name || "User"}!
        </Typography>
        <Typography
          variant="subtitle1"
          color="text.secondary"
          sx={{
            fontSize: "1.1rem",
            maxWidth: 600,
            lineHeight: 1.6,
          }}
        >
          Here's what's happening with your blog today
        </Typography>
      </Box>

      {/* Stats Grid Section */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {statsConfig.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: "100%",
                  borderRadius: 3,
                  position: "relative",
                  overflow: "hidden",
                  background: stat.gradient,
                  color: "white",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: `0 12px 24px -10px ${stat.color}50`,
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: `radial-gradient(circle at top right, ${stat.color}20, transparent 50%)`,
                  },
                }}
              >
                <Box sx={{ position: "relative", zIndex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: "rgba(255, 255, 255, 0.2)",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Box sx={{ ml: "auto" }}>
                      <Typography
                        variant="caption"
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 5,
                          bgcolor: "rgba(255, 255, 255, 0.2)",
                          backdropFilter: "blur(8px)",
                          fontWeight: 600,
                        }}
                      >
                        {stat.trend}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{ mb: 1, fontWeight: 700 }}
                  >
                    {stat.value.toLocaleString()}
                  </Typography>
                  <Typography sx={{ fontWeight: 500, opacity: 0.9 }}>
                    {stat.title}
                  </Typography>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Tabs Section */}
      <Box sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": {
              minWidth: 120,
              fontWeight: 600,
              fontSize: "0.95rem",
              textTransform: "none",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                color: "primary.main",
                opacity: 1,
              },
            },
            "& .Mui-selected": {
              color: "primary.main",
            },
            "& .MuiTabs-indicator": {
              height: 3,
              borderRadius: 1.5,
              backgroundColor: "primary.main",
            },
          }}
        >
          {tabContent.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              sx={{
                px: 3,
                py: 2,
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Content Section */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {tabContent[activeTab].loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Grid container spacing={3}>
                {tabContent[activeTab].content.map((post) => (
                  <Grid item xs={12} sm={6} key={post._id}>
                    <BlogCard
                      post={post}
                      isDraft={post.status === "draft"}
                      onEdit={
                        post.status === "draft"
                          ? () => navigate(`/edit/${post._id}`)
                          : undefined
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          )}
        </Grid>

        {/* Quick Actions Section */}
        <Grid item xs={12} md={4}>
          <Card
            component={motion.div}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              position: "sticky",
              top: 24,
              bgcolor: "background.paper",
              backdropFilter: "blur(8px)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Quick Actions
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Create />}
                  component={Link}
                  to="/write"
                  sx={{
                    py: 1.5,
                    px: 3,
                    borderRadius: 2,
                    background:
                      "linear-gradient(45deg, #024950 30%, #0FA4AF 90%)",
                    color: "white",
                    fontWeight: 600,
                    textTransform: "none",
                    "&:hover": {
                      background:
                        "linear-gradient(45deg, #013137 30%, #0C8A96 90%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 16px -4px rgba(15, 164, 175, 0.2)",
                    },
                  }}
                >
                  Create New Post
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  component={Link}
                  to="/profile"
                  sx={{
                    py: 1.5,
                    px: 3,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: "none",
                  }}
                >
                  Edit Profile
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Analytics />}
                  component={Link}
                  to="/analytics"
                  sx={{
                    py: 1.5,
                    px: 3,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: "none",
                  }}
                >
                  View Analytics
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;
