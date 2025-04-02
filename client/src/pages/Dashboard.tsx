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
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAllBlogs } from "../services/blogService";
import BlogCard from "../components/BlogCard";

interface BlogPost {
  _id: string;
  title: string;
  content: string;
  category: string;
  coverImage?: string;
  createdAt: string;
}

interface Stats {
  totalPosts: number;
  followers: number;
  following: number;
  completedTasks: number;
  comments?: number;
}

function Dashboard() {
  const theme = useTheme();
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    followers: 0,
    following: 0,
    completedTasks: 0,
    comments: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [blogData] = await Promise.all([
          getAllBlogs(),
          // getBlogStats() - commented out until backend is ready
        ]);
        setPosts(blogData);
        // Temporarily use mock stats until backend is ready
        setStats({
          totalPosts: blogData.length,
          followers: 0,
          following: 0,
          completedTasks: 0,
          comments: 0,
        });
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statsConfig = [
    {
      title: "Total Posts",
      value: stats.totalPosts,
      icon: <Assessment />,
      color: "#2196f3",
      trend: "+12%",
    },
    {
      title: "Following",
      value: stats.following,
      icon: <Person />,
      color: "#4caf50",
      trend: "+5%",
    },
    {
      title: "Followers",
      value: stats.followers,
      icon: <Favorite />,
      color: "#f44336",
      trend: "+8%",
    },
    {
      title: "Comments",
      value: stats.comments || 0,
      icon: <Comment />,
      color: "#ff9800",
      trend: "+15%",
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 600,
            background: "linear-gradient(45deg, #024950 30%, #0FA4AF 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Welcome back, {user?.name || "User"}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your blog today
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {statsConfig.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  background: `linear-gradient(45deg, ${stat.color}15, ${stat.color}05)`,
                  transition:
                    "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: `0 4px 20px ${stat.color}30`,
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: `${stat.color}15`,
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box sx={{ ml: "auto" }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "success.main",
                        bgcolor: "success.light",
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                      }}
                    >
                      {stat.trend}
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="h4"
                  component="div"
                  sx={{ mb: 1, fontWeight: 600 }}
                >
                  {stat.value.toLocaleString()}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {stat.title}
                </Typography>
              </Paper>
            </motion.div>
          </Grid>
        ))}

        <Grid item xs={12} md={8}>
          <Card
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            sx={{ borderRadius: 2 }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Recent Blog Posts
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={3}>
                {posts.slice(0, 3).map((post) => (
                  <Grid item xs={12} sm={6} md={4} key={post._id}>
                    <BlogCard post={post} />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            component={motion.div}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            sx={{ borderRadius: 2 }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Quick Actions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Create />}
                  component={Link}
                  to="/write"
                  sx={{
                    background:
                      "linear-gradient(45deg, #024950 30%, #0FA4AF 90%)",
                    color: "white",
                    "&:hover": {
                      background:
                        "linear-gradient(45deg, #013137 30%, #0C8A96 90%)",
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
                >
                  Edit Profile
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Analytics />}
                  component={Link}
                  to="/analytics"
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
