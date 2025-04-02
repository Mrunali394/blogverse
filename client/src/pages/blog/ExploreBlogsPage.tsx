import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  CircularProgress,
  Box,
  Paper,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { getAllBlogs, getCategories } from "../../services/blogService";
import BlogCard from "../../components/BlogCard";

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

function ExploreBlogsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const blogsData = await getAllBlogs();
        const categoriesData = await getCategories();

        setPosts(blogsData);
        setCategories(categoriesData);
      } catch (error: any) {
        console.error("Failed to fetch blogs:", error.message || error);
        setError(
          error.response?.data?.message ||
            "Failed to load blogs. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      selectedCategory === "all" || post.category === selectedCategory;
    const matchesSearch = post.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (error) {
    return (
      <Container sx={{ mt: 4, textAlign: "center" }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" gutterBottom>
        Explore Blogs
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Search blogs"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {filteredPosts.map((post) => (
          <Grid item xs={12} sm={6} md={4} key={post._id}>
            <BlogCard post={post} />
          </Grid>
        ))}
      </Grid>

      {filteredPosts.length === 0 && (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No blogs found matching your criteria
          </Typography>
        </Box>
      )}
    </Container>
  );
}

export default ExploreBlogsPage;
