import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBlog } from "../../services/blogService";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const categories = [
  "Technology",
  "Design",
  "Development",
  "Business",
  "Lifestyle",
  "Science",
  "Food & Cooking",
  "Travel",
  "Health & Fitness",
  "Arts & Culture",
  "Education",
  "Environment",
];

const extractDirectImageUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    // Handle Brave search URLs by extracting the source URL from context parameter
    if (urlObj.hostname === "search.brave.com") {
      const context = urlObj.searchParams.get("context");
      if (context) {
        const contextData = JSON.parse(decodeURIComponent(context));
        if (contextData[0]?.src) {
          return contextData[0].src;
        }
      }
    }
    return url;
  } catch {
    return url;
  }
};

function CreatePost() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    content: "",
    coverImage: "",
  });
  const [errors, setErrors] = useState({
    title: "",
    category: "",
    content: "",
    coverImage: "", // Add coverImage error
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "coverImage") {
      const directUrl = extractDirectImageUrl(value);
      setFormData((prev) => ({
        ...prev,
        coverImage: directUrl,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleCategoryChange = (e: SelectChangeEvent) => {
    setFormData((prev) => ({
      ...prev,
      category: e.target.value,
    }));
    setErrors((prev) => ({
      ...prev,
      category: "",
    }));
  };

  const handleEditorChange = (content: string) => {
    setFormData((prev) => ({
      ...prev,
      content,
    }));
    setErrors((prev) => ({
      ...prev,
      content: "",
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: "",
      category: "",
      content: "",
      coverImage: "",
    };

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
      isValid = false;
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
      isValid = false;
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setIsSubmitting(true);
        const newBlog = await createBlog(formData);
        setIsSubmitting(false);
        navigate(`/blog/${newBlog._id}`);
      } catch (error) {
        setIsSubmitting(false);
        console.error("Failed to create blog post:", error);
      }
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }],
      ["link", "image", "video"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "link",
    "image",
    "video",
    "color",
    "background",
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Blog Post
        </Typography>
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Post Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={!!errors.title}
              helperText={errors.title}
              sx={{ mb: 3 }}
            />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                id="category"
                value={formData.category}
                label="Category"
                onChange={handleCategoryChange}
                error={!!errors.category}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
              {errors.category && (
                <Typography color="error" variant="caption">
                  {errors.category}
                </Typography>
              )}
            </FormControl>

            <TextField
              fullWidth
              label="Cover Image URL"
              name="coverImage"
              value={formData.coverImage}
              onChange={handleChange}
              error={!!errors.coverImage}
              helperText={
                errors.coverImage ||
                "Direct image URLs are automatically extracted from search results"
              }
              sx={{ mb: 3 }}
              placeholder="Enter image URL or upload (feature coming soon)"
            />

            {formData.coverImage && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Image Preview:
                </Typography>
                <Box
                  sx={{
                    width: "100%",
                    position: "relative",
                    paddingTop: "56.25%", // 16:9 aspect ratio
                    borderRadius: 1,
                    overflow: "hidden",
                    bgcolor: "background.paper",
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
                    src={formData.coverImage}
                    alt="Cover preview"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.style.opacity = "0.5";
                      setErrors((prev) => ({
                        ...prev,
                        coverImage:
                          "Unable to load image. Please check if it's a valid direct image URL",
                      }));
                      // Fallback SVG with updated styling
                      target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23f0f0f0'/%3E%3Ctext x='400' y='225' font-family='Arial' font-size='16' fill='%23666666' text-anchor='middle' dominant-baseline='middle'%3EInvalid Image URL%0APlease use a direct image link%3C/text%3E%3C/svg%3E`;
                    }}
                    loading="lazy"
                  />
                </Box>
              </Box>
            )}

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Content
              </Typography>
              <Box
                sx={{
                  "& .quill": {
                    height: 350,
                    mb: 2,
                    "& .ql-editor": {
                      minHeight: 300,
                    },
                  },
                }}
              >
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={handleEditorChange}
                  modules={modules}
                  formats={formats}
                  preserveWhitespace
                />
              </Box>
              {errors.content && (
                <Typography color="error" variant="caption">
                  {errors.content}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: "flex", gap: 2, mt: 6 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Publishing..." : "Publish Post"}
              </Button>
              <Button variant="outlined" color="secondary" size="large">
                Save as Draft
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default CreatePost;
