import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActionArea,
  Box,
} from "@mui/material";
import { Article } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useState } from "react";

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

interface Props {
  post: BlogPost;
}

function BlogCard({ post }: Props) {
  const [imageError, setImageError] = useState(false);
  const hasValidImage =
    post.coverImage &&
    typeof post.coverImage === "string" &&
    post.coverImage.trim() !== "" &&
    !imageError;

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <CardActionArea
        component={Link}
        to={`/blog/${post._id}`}
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        {hasValidImage ? (
          <CardMedia
            component="img"
            height="200"
            image={post.coverImage}
            alt={post.title}
            onError={handleImageError}
            sx={{
              objectFit: "cover",
              backgroundColor: "rgba(0, 0, 0, 0.04)",
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "scale(1.05)",
                filter: "brightness(0.9)",
              },
            }}
            loading="lazy"
          />
        ) : (
          <Box
            sx={{
              height: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(0, 0, 0, 0.03)",
              background:
                "linear-gradient(45deg, rgba(2, 73, 80, 0.05), rgba(15, 164, 175, 0.1))",
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                background:
                  "linear-gradient(45deg, rgba(2, 73, 80, 0.1), rgba(15, 164, 175, 0.15))",
              },
            }}
          >
            <Article
              sx={{
                fontSize: 80,
                color: "primary.main",
                opacity: 0.3,
                transition:
                  "transform 0.3s ease-in-out, opacity 0.3s ease-in-out",
                "&:hover": {
                  transform: "scale(1.1)",
                  opacity: 0.4,
                },
              }}
            />
          </Box>
        )}
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography
            gutterBottom
            variant="h6"
            component="div"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              lineHeight: 1.3,
              minHeight: "2.6em",
            }}
          >
            {post.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            By {post.user.name} • {post.category}
          </Typography>
          <Typography variant="caption" color="text.secondary" component="div">
            {new Date(post.createdAt).toLocaleDateString()}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default BlogCard;
