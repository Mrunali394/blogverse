import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, Typography, Grid, CircularProgress } from "@mui/material";
import { getBlogsByCategory } from "../../services/blogService";
import BlogCard from "../../components/BlogCard";

interface BlogPost {
  _id: string;
  title: string;
  content: string;
  category: string;
  coverImage?: string;
  createdAt: string;
}

function CategoryPosts() {
  const { category } = useParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      if (category) {
        try {
          setError(null); // Reset error state
          const data = await getBlogsByCategory(category);
          setPosts(data);
        } catch (error: any) {
          console.error("Failed to fetch posts:", error);
          setError(
            "Failed to load posts for this category. Please try again later."
          );
        } finally {
          setLoading(false);
        }
      }
    };
    fetchPosts();
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
      <Container sx={{ textAlign: "center", mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" gutterBottom>
        {category} Posts
      </Typography>
      <Grid container spacing={3}>
        {posts.length > 0 ? (
          posts.map((post) => (
            <Grid item xs={12} sm={6} md={4} key={post._id}>
              <BlogCard post={post} />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="h6" color="text.secondary" textAlign="center">
              No posts found in this category.
            </Typography>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}

export default CategoryPosts;
