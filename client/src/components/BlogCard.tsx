import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActionArea,
  Box,
  CardActions,
  Button,
} from "@mui/material";
import { Article, Edit } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useState } from "react";
import { formatDateTime } from "../utils/dateUtils";

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
  isDraft?: boolean;
  onEdit?: () => void;
}

function BlogCard({ post, isDraft, onEdit }: Props) {
  const [imageError, setImageError] = useState(false);

  const optimizeCloudinaryUrl = (url: string) => {
    if (url && url.includes("cloudinary.com")) {
      // Add transformation parameters for blog card view
      const imageUrl = new URL(url);
      const transformationString = "/c_fill,w_400,h_250,q_auto,f_auto";
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
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        overflow: "hidden",
        transition: "all 0.3s ease-in-out",
        backgroundColor: "background.paper",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: (theme) => `0 8px 24px ${theme.palette.primary.main}25`,
        },
      }}
    >
      {isDraft && (
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            bgcolor: "warning.main",
            color: "warning.contrastText",
            px: 2,
            py: 0.5,
            borderRadius: "20px",
            fontSize: "0.75rem",
            fontWeight: 600,
            zIndex: 2,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            backdropFilter: "blur(4px)",
          }}
        >
          Draft
        </Box>
      )}
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
        <Box sx={{ position: "relative", paddingTop: "56.25%" }}>
          {hasValidImage ? (
            <CardMedia
              component="img"
              image={optimizeCloudinaryUrl(post.coverImage!)}
              alt={post.title}
              onError={handleImageError}
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "all 0.5s ease-in-out",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
              loading="lazy"
            />
          ) : (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: (theme) =>
                  `linear-gradient(45deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`,
                transition: "all 0.3s ease-in-out",
              }}
            >
              <Article
                sx={{
                  fontSize: 64,
                  color: "primary.main",
                  opacity: 0.5,
                  transition: "all 0.3s ease-in-out",
                }}
              />
            </Box>
          )}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.1) 100%)",
              transition: "opacity 0.3s ease-in-out",
              opacity: 0,
              "&:hover": {
                opacity: 1,
              },
            }}
          />
        </Box>

        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="overline"
              sx={{
                color: "primary.main",
                fontWeight: 600,
                letterSpacing: 1,
              }}
            >
              {post.category}
            </Typography>
          </Box>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              lineHeight: 1.4,
              minHeight: "2.8em",
              mb: 1,
            }}
          >
            {post.title}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mt: 2,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              By {post.user.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontWeight: 500,
              }}
            >
              {formatDateTime(post.createdAt)}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>

      {onEdit && isDraft && (
        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button
            size="small"
            onClick={onEdit}
            startIcon={<Edit />}
            sx={{
              color: "primary.main",
              "&:hover": {
                backgroundColor: "primary.main",
                color: "white",
              },
            }}
          >
            Continue Editing
          </Button>
        </CardActions>
      )}
    </Card>
  );
}

export default BlogCard;
