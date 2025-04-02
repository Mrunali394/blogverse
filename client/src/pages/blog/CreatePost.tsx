import { useState } from 'react';
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
} from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const categories = [
  'Technology',
  'Design',
  'Development',
  'Business',
  'Lifestyle',
  'Science',
  'Food & Cooking',
  'Travel',
  'Health & Fitness',
  'Arts & Culture',
  'Education',
  'Environment'
];

function CreatePost() {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: '',
    coverImage: '',
  });
  const [errors, setErrors] = useState({
    title: '',
    category: '',
    content: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  const handleCategoryChange = (e: SelectChangeEvent) => {
    setFormData((prev) => ({
      ...prev,
      category: e.target.value,
    }));
    setErrors((prev) => ({
      ...prev,
      category: '',
    }));
  };

  const handleEditorChange = (content: string) => {
    setFormData((prev) => ({
      ...prev,
      content,
    }));
    setErrors((prev) => ({
      ...prev,
      content: '',
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: '',
      category: '',
      content: '',
    };

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
      isValid = false;
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Handle post creation logic here
      console.log('Form submitted:', formData);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ color: [] }, { background: [] }],
      ['link', 'image', 'video'],
      ['clean'],
    ],
  };

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
              sx={{ mb: 3 }}
              placeholder="Enter image URL or upload (feature coming soon)"
            />

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Content
              </Typography>
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={handleEditorChange}
                modules={modules}
                style={{ height: '300px', marginBottom: '50px' }}
              />
              {errors.content && (
                <Typography color="error" variant="caption">
                  {errors.content}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 6 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
              >
                Publish Post
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