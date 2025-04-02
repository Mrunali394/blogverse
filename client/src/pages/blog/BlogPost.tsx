import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { getBlog } from "../../services/blogService";

interface BlogPost {
  title: string;
  content: string;
  category: string;
  coverImage?: string;
  createdAt: string;
}

function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (id) {
          const data = await getBlog(id);
          setPost(data);
        }
      } catch (err) {
        setError("Failed to load blog post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !post) {
    return (
      <Container>
        <Typography color="error">{error || "Post not found"}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          {post.coverImage && (
            <Box sx={{ mb: 3 }}>
              <img
                src={post.coverImage}
                alt={post.title}
                style={{
                  width: "100%",
                  maxHeight: "400px",
                  objectFit: "cover",
                }}
              />
            </Box>
          )}
          <Typography variant="h4" component="h1" gutterBottom>
            {post.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {new Date(post.createdAt).toLocaleDateString()} • {post.category}
          </Typography>
          <Box sx={{ mt: 4 }}>
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default BlogPost;
