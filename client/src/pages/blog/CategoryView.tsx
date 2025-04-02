import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  CircularProgress,
  Paper,
  Box,
} from "@mui/material";
import { getBlogsByCategory } from "../../services/blogService";
import BlogCard from "../../components/BlogCard";
import { formatDateTime } from "../../utils/dateUtils";

interface BlogPost {
  _id: string;
  title: string;
  content: string;
  category: string;
  coverImage?: string;
  createdAt: string;
  user: {
    _id: string;
    name: string;
  };
}

function CategoryView() {
  const { category } = useParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryPosts = async () => {
      if (category) {
        try {
          setLoading(true);
          setError(null);
          console.log(`Fetching posts for category: ${category}`);
          const data = await getBlogsByCategory(category);
          console.log("Raw API response:", data);
          console.log("Response type:", typeof data);
          console.log("Is array:", Array.isArray(data)); // Fixed missing closing parenthesis

          if (!Array.isArray(data)) {
            throw new Error("Invalid data format received from server");
          }

          setPosts(data);
        } catch (error: any) {
          console.error("Error details:", error);
          setError(error.message || "Failed to fetch category posts");
          setPosts([]);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCategoryPosts();
  }, [category]);

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4, textAlign: "center" }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {category} Posts
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Total posts: {posts.length}
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {posts.length > 0 ? (
            posts.map((post) => (
              <Grid item xs={12} sm={6} md={4} key={post._id}>
                <BlogCard post={post} />
                <Typography variant="caption" color="text.secondary">
                  {formatDateTime(post.createdAt)}
                </Typography>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography
                variant="h6"
                color="text.secondary"
                textAlign="center"
              >
                No posts found in this category.
                <br />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Be the first to create a post in {category}!
                </Typography>
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
}

export default CategoryView;
