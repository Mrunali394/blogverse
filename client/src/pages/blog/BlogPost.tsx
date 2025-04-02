import { Container, Typography, Box, Paper } from '@mui/material';
import { useParams } from 'react-router-dom';

function BlogPost() {
  const { id } = useParams();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Blog Post {id}
          </Typography>
          <Typography variant="body1">
            This is a placeholder for the blog post content. The full feature is coming soon!
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default BlogPost; 