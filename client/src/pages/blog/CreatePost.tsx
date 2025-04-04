import React, { useState, useRef } from "react";
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
import { toast } from "react-toastify";

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
    // Handle Brave search URLs
    if (urlObj.hostname === "imgs.search.brave.com") {
      // Extract the actual image URL from the encoded URL
      const encodedUrl = url.split("/g:ce/")[1];
      if (encodedUrl) {
        const decodedUrl = atob(encodedUrl);
        return decodedUrl;
      }
    }
    // Handle Pixabay and other image hosting services
    if (
      urlObj.hostname.includes("pixabay.com") ||
      urlObj.hostname.includes("cloudinary.com")
    ) {
      return url;
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
    isDraft: false, // Add draft status
  });
  const [errors, setErrors] = useState({
    title: "",
    category: "",
    content: "",
    coverImage: "", // Add coverImage error
  });
  const [submitError, setSubmitError] = useState<string>("");

  const quillRef = useRef<ReactQuill>(null);

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
    } else if (formData.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters long";
      isValid = false;
    }

    if (!formData.category) {
      newErrors.category = "Please select a category";
      isValid = false;
    }

    if (
      !formData.content ||
      formData.content.replace(/<[^>]*>/g, "").trim().length < 50
    ) {
      newErrors.content = "Content must be at least 50 characters long";
      isValid = false;
    }

    // Only validate image URL if one is provided
    if (formData.coverImage && !isValidUrl(formData.coverImage)) {
      newErrors.coverImage = "Please enter a valid image URL or leave empty";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const isValidUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      // Add support for more image hosting services
      return (
        /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i.test(url) ||
        /images\.unsplash\.com/i.test(url) ||
        /cloudinary\.com/i.test(url) ||
        /imgbb\.com/i.test(url) ||
        /pixabay\.com.*\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url) ||
        /imgs\.search\.brave\.com/i.test(url)
      );
    } catch {
      return false;
    }
  };

  const validateDraft = () => {
    let isValid = true;
    const newErrors = {
      title: "",
      category: "",
      content: "",
      coverImage: "",
    };

    // Only validate title for drafts
    if (!formData.title.trim()) {
      newErrors.title = "Title is required even for drafts";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (validateForm()) {
      try {
        setIsSubmitting(true);
        const blogData = {
          ...formData,
          isDraft: false, // Explicitly set to false for publishing
        };
        const newBlog = await createBlog(blogData);
        toast.success("Blog post published successfully!");
        navigate(`/blog/${newBlog._id}`);
      } catch (error: any) {
        setSubmitError(
          error.response?.data?.message || "Failed to publish blog post"
        );
        toast.error("Failed to publish blog post");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const saveDraft = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Add this to prevent event bubbling
    setSubmitError("");

    if (validateDraft()) {
      try {
        setIsSubmitting(true);
        const draftData = {
          ...formData,
          isDraft: true,
          status: "draft",
          publishedAt: null,
        };

        console.log("Saving draft:", draftData); // Add logging

        const draftBlog = await createBlog(draftData);
        toast.success("Draft saved successfully!");
        navigate("/dashboard", {
          state: {
            notification: "Draft saved successfully!",
            draftId: draftBlog._id,
            isDraft: true,
          },
        });
      } catch (error: any) {
        console.error("Draft save error:", error); // Add error logging
        setSubmitError("Failed to save draft. Please try again.");
        toast.error(error.response?.data?.message || "Failed to save draft");
      } finally {
        setIsSubmitting(false);
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
          {submitError && (
            <Typography color="error" sx={{ mb: 2 }}>
              {submitError}
            </Typography>
          )}
          <Box component="form" onSubmit={handleSubmit} noValidate>
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
                    onLoad={() => {
                      // Clear any error when image loads successfully
                      setErrors((prev) => ({ ...prev, coverImage: "" }));
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.style.opacity = "0.5";
                      setErrors((prev) => ({
                        ...prev,
                        coverImage:
                          "Unable to load image. Please check the URL or try another image",
                      }));
                      target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23f0f0f0'/%3E%3Ctext x='400' y='225' font-family='Arial' font-size='16' fill='%23666666' text-anchor='middle' dominant-baseline='middle'%3EUnable to load image%3C/text%3E%3C/svg%3E`;
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
                    height: "auto",
                    mb: 2,
                    "& .ql-container": {
                      minHeight: "300px",
                      maxHeight: "600px",
                      overflow: "auto",
                    },
                  },
                }}
              >
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={formData.content}
                  onChange={handleEditorChange}
                  modules={modules}
                  formats={formats}
                  preserveWhitespace
                  placeholder="Write your blog post content here..."
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
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(e);
                }}
              >
                {isSubmitting ? "Publishing..." : "Publish Post"}
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                size="large"
                onClick={saveDraft}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save as Draft"}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default CreatePost;
