import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  TextField,
  Button,
  Avatar,
  Divider,
} from "@mui/material";
import { useParams, Link } from "react-router-dom";
import { getBlog, addComment } from "../../services/blogService";
import { formatDateTime } from "../../utils/dateUtils";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { Person } from "@mui/icons-material";

interface Comment {
  _id: string;
  text: string;
  user: {
    _id: string;
    name: string;
  };
  date: string;
}

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
    profilePicture?: string;
  };
  comments: Comment[];
  commentsCount: number; // Add this field
}

function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentError, setCommentError] = useState("");
  const { user } = useAuth();

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
          if (data && data.coverImage) {
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

  const validateComment = (text: string) => {
    if (!text.trim()) {
      setCommentError("Comment cannot be empty");
      return false;
    }
    if (text.length > 1000) {
      setCommentError("Comment is too long (max 1000 characters)");
      return false;
    }
    setCommentError("");
    return true;
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to comment");
      return;
    }

    if (!validateComment(comment)) {
      return;
    }

    try {
      setIsSubmitting(true);
      setCommentError("");

      if (id) {
        const updatedComments = await addComment(id, comment);
        setPost((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            comments: updatedComments,
            commentsCount: (prev.commentsCount || 0) + 1,
          };
        });
        setComment("");
        toast.success("Comment added successfully!");

        // Scroll to the latest comment
        const commentsSection = document.getElementById("comments");
        commentsSection?.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Failed to add comment";
      setCommentError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                height: "auto",
                maxHeight: "600px",
                borderRadius: 1,
                overflow: "hidden",
                bgcolor: "background.paper",
                position: "relative",
              }}
            >
              <img
                src={post.coverImage}
                alt={post.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = "/placeholder-image.png";
                }}
              />
            </Box>
          )}
          <Typography variant="h4" component="h1" gutterBottom>
            {post.title}
          </Typography>

          {/* Add User Profile Section */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 3,
              py: 2,
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Link
              to={`/user/${post.user._id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  "&:hover": {
                    opacity: 0.8,
                  },
                }}
              >
                <Avatar sx={{ mr: 2 }}>
                  {post.user.profilePicture ? (
                    <img
                      src={post.user.profilePicture}
                      alt={post.user.name}
                      style={{ width: "100%", height: "100%" }}
                    />
                  ) : (
                    <Person />
                  )}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {post.user.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDateTime(post.createdAt)} • {post.category}
                  </Typography>
                </Box>
              </Box>
            </Link>
          </Box>

          <Box sx={{ mt: 4 }}>
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box id="comments" sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Comments ({post?.commentsCount || 0})
            </Typography>

            {/* Show existing comments to everyone */}
            {post?.comments?.map((comment) => (
              <Box key={comment._id} sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Avatar sx={{ mr: 2 }}>
                    {comment.user?.name
                      ? comment.user.name[0].toUpperCase()
                      : "?"}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2">
                      {comment.user?.name || "Anonymous User"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDateTime(comment.date)}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ ml: 7 }}>
                  {comment.text || "No content"}
                </Typography>
              </Box>
            ))}

            {/* Only show comment form to logged in users */}
            <Box sx={{ mt: 4 }}>
              {user ? (
                <Box
                  component="form"
                  onSubmit={handleCommentSubmit}
                  sx={{ mb: 4 }}
                >
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Write a comment..."
                    value={comment}
                    onChange={(e) => {
                      setComment(e.target.value);
                      if (commentError) {
                        validateComment(e.target.value);
                      }
                    }}
                    error={!!commentError}
                    helperText={
                      commentError || `${comment.length}/1000 characters`
                    }
                    disabled={isSubmitting}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={isSubmitting || !comment.trim()}
                    sx={{ mt: 1 }}
                  >
                    {isSubmitting ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Posting...
                      </>
                    ) : (
                      "Post Comment"
                    )}
                  </Button>
                </Box>
              ) : (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    textAlign: "center",
                    bgcolor: "background.paper",
                  }}
                >
                  <Typography color="text.secondary">
                    Please login to add a comment
                  </Typography>
                </Paper>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default BlogPost;
