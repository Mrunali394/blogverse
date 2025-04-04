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
import { getBlog, addComment, addReply } from "../../services/blogService";
import { formatDateTime } from "../../utils/dateUtils";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { Person } from "@mui/icons-material";

interface Reply {
  _id: string;
  text: string;
  user: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  date: string;
}

interface Comment {
  _id: string;
  text: string;
  user: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  date: string;
  replies: Reply[];
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
  commentsCount: number;
}

function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
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

  const handleReplySubmit = async (commentId: string) => {
    if (!user) {
      toast.error("Please login to reply");
      return;
    }

    if (!validateComment(replyText)) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await addReply(id!, commentId, replyText);
      setPost((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          comments: response,
        };
      });
      setReplyText("");
      setReplyingTo(null);
      toast.success("Reply added successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to add reply");
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
                mb: 4,
                width: "100%",
                position: "relative",
                paddingTop: "50%", // 2:1 aspect ratio
                borderRadius: 2,
                overflow: "hidden",
                bgcolor: "background.paper",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                "& img": {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "opacity 0.3s ease",
                },
              }}
            >
              <img
                src={post.coverImage}
                alt={post.title}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.style.opacity = "0.5";
                  target.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 800 400'%3E%3Crect width='800' height='400' fill='%23f0f0f0'/%3E%3Ctext x='400' y='200' font-family='Arial' font-size='16' fill='%23666666' text-anchor='middle' dominant-baseline='middle'%3EImage not available%3C/text%3E%3C/svg%3E";
                }}
                loading="lazy"
              />
            </Box>
          )}
          <Typography variant="h4" component="h1" gutterBottom>
            {post.title}
          </Typography>

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

            <Box sx={{ mt: 4 }}>
              {post.comments.map((comment: Comment) => (
                <Box key={comment._id}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      mb: 2,
                      p: 2,
                      borderRadius: 1,
                      bgcolor: "background.paper",
                      boxShadow: 1,
                    }}
                  >
                    <Link
                      to={`/user/${comment.user._id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Avatar
                        src={comment.user.profilePicture}
                        alt={comment.user.name}
                        sx={{
                          width: 40,
                          height: 40,
                          border: "2px solid",
                          borderColor: "primary.main",
                          cursor: "pointer",
                          "&:hover": {
                            opacity: 0.8,
                          },
                        }}
                      />
                    </Link>
                    <Box sx={{ flex: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 0.5,
                        }}
                      >
                        <Link
                          to={`/user/${comment.user._id}`}
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600 }}
                          >
                            {comment.user.name}
                          </Typography>
                        </Link>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(comment.date).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Typography variant="body2">{comment.text}</Typography>
                      {user && (
                        <Button
                          size="small"
                          onClick={() => setReplyingTo(comment._id)}
                          sx={{ mt: 1 }}
                        >
                          Reply
                        </Button>
                      )}
                    </Box>
                  </Box>

                  {/* Reply Form */}
                  {replyingTo === comment._id && user && (
                    <Box sx={{ ml: 7, mb: 2 }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        multiline
                        rows={2}
                        sx={{ mb: 1 }}
                      />
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          disabled={isSubmitting}
                          onClick={() => handleReplySubmit(comment._id)}
                        >
                          {isSubmitting ? "Posting..." : "Post Reply"}
                        </Button>
                        <Button
                          size="small"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText("");
                          }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  )}

                  {/* Replies */}
                  {comment.replies?.map((reply: Reply) => (
                    <Box
                      key={reply._id}
                      sx={{
                        display: "flex",
                        gap: 2,
                        ml: 7,
                        mb: 2,
                        p: 2,
                        borderRadius: 1,
                        bgcolor: "background.paper",
                        boxShadow: 1,
                      }}
                    >
                      <Link
                        to={`/user/${reply.user._id}`}
                        style={{ textDecoration: "none" }}
                      >
                        <Avatar
                          src={reply.user.profilePicture}
                          alt={reply.user.name}
                          sx={{
                            width: 32,
                            height: 32,
                            border: "2px solid",
                            borderColor: "primary.main",
                            cursor: "pointer",
                            "&:hover": {
                              opacity: 0.8,
                            },
                          }}
                        />
                      </Link>
                      <Box sx={{ flex: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 0.5,
                          }}
                        >
                          <Link
                            to={`/user/${reply.user._id}`}
                            style={{ textDecoration: "none", color: "inherit" }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 600 }}
                            >
                              {reply.user.name}
                            </Typography>
                          </Link>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(reply.date).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Typography variant="body2">{reply.text}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ))}
            </Box>

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
