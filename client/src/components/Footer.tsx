import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  TextField,
  Button,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Email,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useState } from 'react';

function Footer() {
  const [email, setEmail] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Subscribing email:', email);
    setEmail('');
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        py: { xs: 4, sm: 6 },
        mt: 'auto',
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 3, md: 4 }}>
          {/* About Section */}
          <Grid item xs={12} md={4}>
            <Typography 
              variant="h6" 
              color="primary" 
              gutterBottom
              sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}
            >
              BlogVerse
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              paragraph
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Share your stories, inspire the world. Join our community of writers
              and readers to explore amazing content across various topics.
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <IconButton
                color="primary"
                component="a"
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                size={isMobile ? "small" : "medium"}
              >
                <Facebook />
              </IconButton>
              <IconButton
                color="primary"
                component="a"
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                size={isMobile ? "small" : "medium"}
              >
                <Twitter />
              </IconButton>
              <IconButton
                color="primary"
                component="a"
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                size={isMobile ? "small" : "medium"}
              >
                <Instagram />
              </IconButton>
              <IconButton
                color="primary"
                component="a"
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                size={isMobile ? "small" : "medium"}
              >
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography 
              variant="h6" 
              color="text.primary" 
              gutterBottom
              sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}
            >
              Quick Links
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'row', sm: 'column' },
                flexWrap: 'wrap',
                gap: { xs: 2, sm: 1 },
              }}
            >
              <Link
                component={RouterLink}
                to="/about"
                color="text.secondary"
                sx={{ 
                  textDecoration: 'none',
                  '&:hover': { color: 'primary.main' },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              >
                About Us
              </Link>
              <Link
                component={RouterLink}
                to="/contact"
                color="text.secondary"
                sx={{ 
                  textDecoration: 'none',
                  '&:hover': { color: 'primary.main' },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              >
                Contact
              </Link>
              <Link
                component={RouterLink}
                to="/privacy-policy"
                color="text.secondary"
                sx={{ 
                  textDecoration: 'none',
                  '&:hover': { color: 'primary.main' },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              >
                Privacy Policy
              </Link>
              <Link
                component={RouterLink}
                to="/terms"
                color="text.secondary"
                sx={{ 
                  textDecoration: 'none',
                  '&:hover': { color: 'primary.main' },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              >
                Terms of Service
              </Link>
            </Box>
          </Grid>

          {/* Newsletter */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography 
              variant="h6" 
              color="text.primary" 
              gutterBottom
              sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}
            >
              Subscribe to Our Newsletter
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              paragraph
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Get the latest updates and articles delivered straight to your inbox.
            </Typography>
            <Box 
              component="form" 
              onSubmit={handleSubscribe}
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'column' },
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                size={isMobile ? "small" : "medium"}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ 
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size={isMobile ? "small" : "medium"}
                startIcon={<Email />}
              >
                Subscribe
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: { xs: 3, sm: 4 } }} />

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
        >
          © {new Date().getFullYear()} BlogVerse. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer; 