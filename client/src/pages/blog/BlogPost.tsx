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
import { formatDateTime } from "../../utils/dateUtils";

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

  const optimizeCloudinaryUrl = (url: string) => {
    if (url && url.includes("cloudinary.com")) {
      const imageUrl = new URL(url);
      const transformationString = "/c_fill,w_1200,h_630,q_auto,f_auto";
      const pathParts = imageUrl.pathname.split("/");
      const uploadIndex = pathParts.indexOf("upload");
      if (uploadIndex !== -1) {
        pathParts.splice(uploadIndex + 1, 0, transformationString);
        imageUrl.pathname = pathParts.join("/");
        return imageUrl.toString();
      }
    }
    return url;
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (id) {
          const data = await getBlog(id);
          if (data.coverImage) {
            data.coverImage = optimizeCloudinaryUrl(data.coverImage);
          }
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
            <Box
              sx={{
                mb: 3,
                width: "100%",
                maxHeight: "500px",
                overflow: "hidden",
                borderRadius: 1,
              }}
            >
              <img
                src={post.coverImage}
                alt={post.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  maxHeight: "500px",
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = "/placeholder-image.png"; // Add a placeholder image
                  console.error("Error loading image:", post.coverImage);
                }}
              />
            </Box>
          )}
          <Typography variant="h4" component="h1" gutterBottom>
            {post.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {formatDateTime(post.createdAt)} • {post.category}
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
