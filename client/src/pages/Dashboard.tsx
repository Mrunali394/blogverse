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
  ListItemText,
  Button,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import { Person, Assessment, CheckCircle, Timeline } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { getAllBlogs, getBlogStats } from "../services/blogService";
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
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [blogData, statsData] = await Promise.all([
          getAllBlogs(),
          getBlogStats(),
        ]);
        setPosts(blogData);
        setStats(statsData);
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
      value: stats.totalPosts.toString(),
      icon: <Assessment />,
      color: "#2196f3",
    },
    {
      title: "Following",
      value: stats.following.toString(),
      icon: <Person />,
      color: "#4caf50",
    },
    {
      title: "Followers",
      value: stats.followers.toString(),
      icon: <Person />,
      color: "#f44336",
    },
    {
      title: "Completed Tasks",
      value: stats.completedTasks.toString(),
      icon: <CheckCircle />,
      color: "#ff9800",
    },
  ];

  const recentActivities = [
    { text: "Profile updated", time: "2 hours ago" },
    { text: "New post created", time: "1 day ago" },
    { text: "Joined the platform", time: "3 days ago" },
  ];

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Grid container spacing={3}>
        {/* Stats Section */}
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
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  borderRadius: 2,
                }}
              >
                <Box sx={{ color: stat.color, mb: 1 }}>{stat.icon}</Box>
                <Typography variant="h4" component="div">
                  {stat.value}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {stat.title}
                </Typography>
              </Paper>
            </motion.div>
          </Grid>
        ))}

        {/* Main Content Section */}
        <Grid item xs={12} md={8}>
          <Paper
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            elevation={2}
            sx={{ p: 3, borderRadius: 2 }}
          >
            <Typography variant="h5" gutterBottom>
              Welcome back, {user?.name || "User"}!
            </Typography>
            <Box sx={{ my: 2 }}>
              <Timeline />
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List>
                {recentActivities.map((activity, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemText
                      primary={activity.text}
                      secondary={activity.time}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Paper>
        </Grid>

        {/* Quick Actions Section */}
        <Grid item xs={12} md={4}>
          <Card
            component={motion.div}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            elevation={2}
            sx={{ borderRadius: 2 }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Button variant="contained" color="primary" fullWidth>
                  Create New Post
                </Button>
                <Button variant="outlined" color="primary" fullWidth>
                  Edit Profile
                </Button>
                <Button variant="outlined" color="primary" fullWidth>
                  View Analytics
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Blog Posts Section */}
      <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
        Latest Blog Posts
      </Typography>
      <Grid container spacing={3}>
        {posts.map((post) => (
          <Grid item xs={12} sm={6} md={4} key={post._id}>
            <BlogCard post={post} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Dashboard;
