import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Box,
  CircularProgress,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { searchBlogs } from "../services/blogService";
import BlogCard from "../components/BlogCard";
import { motion } from "framer-motion";

function Search() {
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const searchQuery = location.state?.query || "";
    setQuery(searchQuery);
    if (searchQuery) {
      performSearch(searchQuery);
    }
  }, [location.state?.query]);

  const performSearch = async (searchQuery: string) => {
    try {
      setLoading(true);
      setError("");
      const { blogs } = await searchBlogs(searchQuery);
      setResults(blogs);
    } catch (err) {
      setError("Failed to fetch search results");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Search Results
        </Typography>
        <TextField
          fullWidth
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && performSearch(query)}
          placeholder="Search blogs..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 4 }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center">
          {error}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {results.length > 0 ? (
            results.map((blog, index) => (
              <Grid item xs={12} sm={6} md={4} key={blog._id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <BlogCard post={blog} />
                </motion.div>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography align="center" color="text.secondary">
                No results found for "{query}"
              </Typography>
            </Grid>
          )}
        </Grid>
      )}
    </Container>
  );
}

export default Search;
