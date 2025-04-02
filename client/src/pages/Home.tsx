import { Box, Container, Typography, Button, Grid, Paper, Card, CardContent, CardHeader, CardMedia, Avatar, Chip, IconButton, CardActionArea, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import { Favorite, Comment, Share, Bookmark, Lightbulb, Group, Security, Speed } from '@mui/icons-material';
import CategoryCards from '../components/CategoryCards';
import Logo from '../components/Logo';

// Sample blog data
const featuredBlogs = [
  {
    id: 1,
    title: "The Future of Web Development: AI and No-Code Revolution",
    author: {
      name: "Alex Chen",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100",
    },
    excerpt: "Explore how artificial intelligence and no-code tools are transforming the landscape of web development, making it more accessible than ever.",
    category: "Technology",
    date: "March 20, 2024",
    readTime: "6 min read",
    likes: 324,
    comments: 28,
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 2,
    title: "Mastering Modern UI Design: Tips from Industry Experts",
    author: {
      name: "Sarah Williams",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
    },
    excerpt: "Learn the latest trends and best practices in UI design from leading designers at top tech companies.",
    category: "Design",
    date: "March 19, 2024",
    readTime: "8 min read",
    likes: 287,
    comments: 42,
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 3,
    title: "Building Scalable Applications with Microservices",
    author: {
      name: "Michael Roberts",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=100",
    },
    excerpt: "A comprehensive guide to designing and implementing microservices architecture for modern applications.",
    category: "Development",
    date: "March 18, 2024",
    readTime: "10 min read",
    likes: 456,
    comments: 35,
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&q=80&w=800",
  },
];

// Sample top authors data
const topAuthors = [
  {
    id: 1,
    name: "Alex Chen",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100",
    role: "Senior Tech Writer",
    description: "Passionate about AI and emerging technologies. Writing about the future of web development and digital transformation.",
    followers: 12400,
    articles: 156,
    expertise: ["AI", "Web Development", "Technology"],
  },
  {
    id: 2,
    name: "Sarah Williams",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
    role: "UI/UX Design Expert",
    description: "Award-winning designer sharing insights on modern UI/UX design principles and industry best practices.",
    followers: 9800,
    articles: 89,
    expertise: ["UI Design", "UX", "Design Systems"],
  },
  {
    id: 3,
    name: "Michael Roberts",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=100",
    role: "Software Architect",
    description: "Experienced architect specializing in scalable systems and microservices architecture. Sharing knowledge to help developers build better systems.",
    followers: 15600,
    articles: 234,
    expertise: ["Architecture", "Microservices", "Cloud"],
  },
];

// Why Blogverse data
const whyBlogverse = [
  {
    id: 1,
    title: "Share Your Knowledge",
    description: "Connect with a global community of writers and readers. Share your expertise and learn from others.",
    icon: <Lightbulb sx={{ fontSize: 40 }} />,
    color: "#FF6B6B",
    gradient: "linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)",
    hoverGradient: "linear-gradient(135deg, #FF8E8E 0%, #FF6B6B 100%)",
    iconBg: "linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)",
    cardBg: "linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 142, 142, 0.1) 100%)",
    cardHoverBg: "linear-gradient(135deg, rgba(255, 107, 107, 0.15) 0%, rgba(255, 142, 142, 0.15) 100%)",
  },
  {
    id: 2,
    title: "Build Your Community",
    description: "Grow your audience and engage with readers who share your interests. Create meaningful connections.",
    icon: <Group sx={{ fontSize: 40 }} />,
    color: "#4ECDC4",
    gradient: "linear-gradient(135deg, #4ECDC4 0%, #45B7D1 100%)",
    hoverGradient: "linear-gradient(135deg, #45B7D1 0%, #4ECDC4 100%)",
    iconBg: "linear-gradient(135deg, #4ECDC4 0%, #45B7D1 100%)",
    cardBg: "linear-gradient(135deg, rgba(78, 205, 196, 0.1) 0%, rgba(69, 183, 209, 0.1) 100%)",
    cardHoverBg: "linear-gradient(135deg, rgba(78, 205, 196, 0.15) 0%, rgba(69, 183, 209, 0.15) 100%)",
  },
  {
    id: 3,
    title: "Secure Platform",
    description: "Your content is safe with us. We provide secure hosting and backup for all your valuable content.",
    icon: <Security sx={{ fontSize: 40 }} />,
    color: "#45B7D1",
    gradient: "linear-gradient(135deg, #45B7D1 0%, #96CEB4 100%)",
    hoverGradient: "linear-gradient(135deg, #96CEB4 0%, #45B7D1 100%)",
    iconBg: "linear-gradient(135deg, #45B7D1 0%, #96CEB4 100%)",
    cardBg: "linear-gradient(135deg, rgba(69, 183, 209, 0.1) 0%, rgba(150, 206, 180, 0.1) 100%)",
    cardHoverBg: "linear-gradient(135deg, rgba(69, 183, 209, 0.15) 0%, rgba(150, 206, 180, 0.15) 100%)",
  },
  {
    id: 4,
    title: "Fast & Reliable",
    description: "Experience lightning-fast loading times and reliable performance across all devices.",
    icon: <Speed sx={{ fontSize: 40 }} />,
    color: "#96CEB4",
    gradient: "linear-gradient(135deg, #96CEB4 0%, #FFEEAD 100%)",
    hoverGradient: "linear-gradient(135deg, #FFEEAD 0%, #96CEB4 100%)",
    iconBg: "linear-gradient(135deg, #96CEB4 0%, #FFEEAD 100%)",
    cardBg: "linear-gradient(135deg, rgba(150, 206, 180, 0.1) 0%, rgba(255, 238, 173, 0.1) 100%)",
    cardHoverBg: "linear-gradient(135deg, rgba(150, 206, 180, 0.15) 0%, rgba(255, 238, 173, 0.15) 100%)",
  },
];

function Home() {
  const theme = useTheme();
  
  return (
    <Box sx={{ 
      minHeight: '100vh',
      width: '100%',
      background: `
        linear-gradient(135deg, rgba(2, 73, 80, 0.05) 0%, rgba(15, 164, 175, 0.05) 100%),
        repeating-linear-gradient(45deg, transparent 0, transparent 10px, rgba(200, 200, 200, 0.1) 10px, rgba(200, 200, 200, 0.1) 11px, transparent 11px, transparent 21px),
        repeating-linear-gradient(-45deg, transparent 0, transparent 10px, rgba(200, 200, 200, 0.1) 10px, rgba(200, 200, 200, 0.1) 11px, transparent 11px, transparent 21px),
        #f0f8ff
      `,
      backgroundSize: 'cover, 30px 30px, 30px 30px, cover',
      backgroundAttachment: 'fixed',
      position: 'relative',
      margin: 0,
      padding: 0,
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      '&::before': {
        content: '""',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 50% 50%, rgba(15, 164, 175, 0.03) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }
    }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, rgba(2, 73, 80, 0.97) 0%, rgba(15, 164, 175, 0.97) 100%)',
          color: '#FFFFFF',
          minHeight: { xs: '80vh', md: '90vh' },
          display: 'flex',
          alignItems: 'center',
          py: { xs: 12, sm: 16, md: 0 },
          mb: { xs: 6, sm: 8, md: 10 },
          backdropFilter: 'blur(10px)',
          width: '95%',
          maxWidth: '1600px',
          position: 'relative',
          zIndex: 1,
          borderRadius: { xs: '0 0 30px 30px', md: '0 0 60px 60px' },
          boxShadow: '0 10px 40px rgba(2, 73, 80, 0.2)',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 150%, rgba(15, 164, 175, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 80% -50%, rgba(2, 73, 80, 0.5) 0%, transparent 50%),
              repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.05) 0px, rgba(255, 255, 255, 0.05) 1px, transparent 1px, transparent 10px)
            `,
            zIndex: -1,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '30%',
            background: 'linear-gradient(to top, rgba(2, 73, 80, 0.3) 0%, transparent 100%)',
            zIndex: -1,
          }
        }}
      >
        <Container 
          sx={{ 
            width: 'calc(100% - 40px)',
            maxWidth: '1400px !important',
            mx: 'auto',
            px: { xs: '20px', md: '40px' },
            position: 'relative',
          }}
        >
          <Grid container spacing={6} alignItems="center" sx={{ minHeight: { md: '70vh' } }}>
            <Grid item xs={12} md={7}>
              <Box sx={{ position: 'relative' }}>
                <Typography
                  variant="h1"
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '2.75rem', sm: '3.5rem', md: '5rem' },
                    lineHeight: 1.1,
                    color: '#FFFFFF',
                    mb: 4,
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -12,
                      left: 0,
                      width: '120px',
                      height: '6px',
                      background: 'linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%)',
                      borderRadius: '3px',
                    },
                  }}
                >
                  Share Your Stories, Inspire the World!
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: 6, 
                    opacity: 0.9,
                    fontSize: { xs: '1.2rem', sm: '1.35rem', md: '1.8rem' },
                    fontWeight: 500,
                    lineHeight: 1.4,
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    maxWidth: '700px',
                  }}
                >
                  Join our community of writers and readers to explore amazing content across various topics.
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 3, 
                  flexWrap: 'wrap',
                  position: 'relative',
                  zIndex: 2,
                }}>
                  <Button
                    variant="contained"
                    size="large"
                    component={Link}
                    to="/write"
                    sx={{
                      background: 'linear-gradient(135deg, #0FA4AF 0%, #AFDDE5 100%)',
                      color: '#FFFFFF',
                      padding: '16px 48px',
                      fontSize: '1.2rem',
                      borderRadius: '16px',
                      textTransform: 'none',
                      fontWeight: 600,
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #024950 0%, #0FA4AF 100%)',
                        transform: 'translateY(-3px)',
                        boxShadow: '0 8px 25px rgba(15, 164, 175, 0.4)',
                      },
                    }}
                  >
                    Start Writing
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{ 
                      borderColor: 'rgba(255,255,255,0.8)',
                      color: 'white',
                      borderWidth: 2,
                      padding: '16px 48px',
                      fontSize: '1.2rem',
                      borderRadius: '16px',
                      textTransform: 'none',
                      fontWeight: 600,
                      backdropFilter: 'blur(5px)',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        borderColor: 'white',
                        borderWidth: 2,
                        bgcolor: 'rgba(255,255,255,0.15)',
                        transform: 'translateY(-3px)',
                        boxShadow: '0 8px 25px rgba(255, 255, 255, 0.2)',
                      },
                    }}
                  >
                    Explore Blogs
                  </Button>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box
                sx={{
                  position: 'relative',
                  height: '100%',
                  minHeight: '400px',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '400px',
                    height: '400px',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                    borderRadius: '50%',
                    animation: 'pulse 3s infinite',
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: '20%',
                    right: '10%',
                    width: '200px',
                    height: '200px',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
                    borderRadius: '50%',
                    animation: 'float 6s infinite ease-in-out',
                  },
                  '@keyframes pulse': {
                    '0%': {
                      transform: 'translate(-50%, -50%) scale(1)',
                      opacity: 0.6,
                    },
                    '50%': {
                      transform: 'translate(-50%, -50%) scale(1.1)',
                      opacity: 0.4,
                    },
                    '100%': {
                      transform: 'translate(-50%, -50%) scale(1)',
                      opacity: 0.6,
                    },
                  },
                  '@keyframes float': {
                    '0%, 100%': {
                      transform: 'translateY(0)',
                    },
                    '50%': {
                      transform: 'translateY(-20px)',
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Categories Section */}
      <Container 
        sx={{ 
          width: 'calc(100% - 40px)',
          maxWidth: '1400px !important',
          mx: 'auto',
          px: '20px',
          position: 'relative',
          zIndex: 1,
          mb: { xs: 6, md: 8 },
        }}
      >
        <CategoryCards />
      </Container>

      {/* Top Authors Section */}
      <Box sx={{ 
        py: { xs: 6, md: 8 },
        position: 'relative',
        zIndex: 1,
        width: '100%',
        mb: { xs: 6, md: 8 },
      }}>
        <Container 
          sx={{ 
            width: 'calc(100% - 40px)',
            maxWidth: '1400px !important',
            mx: 'auto',
            px: '20px',
          }}
        >
          <Typography
            variant="h4"
            component="h2"
            sx={{ 
              mb: { xs: 3, md: 4 }, 
              fontWeight: 600,
              textAlign: 'center',
              background: 'linear-gradient(45deg, #024950 30%, #0FA4AF 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Top Authors
          </Typography>
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ width: '100%', m: 0 }}>
            {topAuthors.map((author) => (
              <Grid item xs={12} sm={6} md={4} key={author.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease-in-out',
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, rgba(2, 73, 80, 0.8) 0%, rgba(15, 164, 175, 0.8) 100%)',
                    },
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 20px 40px -12px rgba(0,0,0,0.1), 0 8px 16px -8px rgba(0,0,0,0.1)',
                      background: 'rgba(255, 255, 255, 0.8)',
                    },
                  }}
                >
                  <CardContent sx={{ 
                    flexGrow: 1, 
                    p: 3,
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'radial-gradient(circle at top right, rgba(15, 164, 175, 0.03), transparent 70%)',
                      pointerEvents: 'none',
                    }
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2,
                      position: 'relative',
                      zIndex: 1,
                    }}>
                      <Avatar
                        src={author.avatar}
                        alt={author.name}
                        sx={{
                          width: 80,
                          height: 80,
                          mr: 2,
                          border: '3px solid',
                          borderColor: 'primary.main',
                          boxShadow: '0 4px 12px rgba(15, 164, 175, 0.2)',
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            transform: 'scale(1.05)',
                          },
                        }}
                      />
                      <Box>
                        <Typography 
                          variant="h6" 
                          component="h3" 
                          sx={{ 
                            fontWeight: 600,
                            background: 'linear-gradient(45deg, #024950 30%, #0FA4AF 90%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >
                          {author.name}
                        </Typography>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            mb: 0.5,
                            color: 'primary.main',
                            fontWeight: 500,
                          }}
                        >
                          {author.role}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.6,
                      }}
                    >
                      {author.description}
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 1, 
                      mb: 2,
                      position: 'relative',
                      zIndex: 1,
                    }}>
                      {author.expertise.map((skill) => (
                        <Chip
                          key={skill}
                          label={skill}
                          size="small"
                          sx={{
                            background: 'linear-gradient(45deg, #024950 30%, #0FA4AF 90%)',
                            color: 'white',
                            fontWeight: 500,
                            '&:hover': {
                              transform: 'translateY(-1px)',
                              boxShadow: '0 4px 8px rgba(15, 164, 175, 0.2)',
                            },
                          }}
                        />
                      ))}
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      mt: 'auto',
                      pt: 2,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      position: 'relative',
                      zIndex: 1,
                    }}>
                      <Box>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: 600,
                            color: 'primary.main',
                          }}
                        >
                          {author.followers.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Followers
                        </Typography>
                      </Box>
                      <Box>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: 600,
                            color: 'primary.main',
                          }}
                        >
                          {author.articles}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Articles
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Featured Blogs Section */}
      <Box sx={{ 
        py: { xs: 6, md: 8 },
        position: 'relative',
        zIndex: 1,
        width: '100%',
        mb: { xs: 6, md: 8 },
      }}>
        <Container 
          sx={{ 
            width: 'calc(100% - 40px)',
            maxWidth: '1400px !important',
            mx: 'auto',
            px: '20px',
          }}
        >
          <Typography
            variant="h4"
            component="h2"
            sx={{ 
              mb: { xs: 3, md: 4 }, 
              fontWeight: 600,
              textAlign: 'center',
              background: 'linear-gradient(45deg, #024950 30%, #0FA4AF 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Featured Blogs
          </Typography>
          <Grid container spacing={4}>
            {featuredBlogs.map((blog) => (
              <Grid item xs={12} sm={6} md={4} key={blog.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.5s ease-in-out',
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '6px',
                      background: 'linear-gradient(90deg, rgba(2, 73, 80, 0.8) 0%, rgba(15, 164, 175, 0.8) 100%)',
                      zIndex: 1,
                    },
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px -12px rgba(0,0,0,0.1), 0 8px 16px -8px rgba(0,0,0,0.1)',
                      background: 'rgba(255, 255, 255, 0.8)',
                      '& .MuiCardMedia-root': {
                        transform: 'scale(1.05)',
                      },
                      '& .MuiCardHeader-root': {
                        background: 'rgba(255, 255, 255, 0.9)',
                      },
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="240"
                    image={blog.image}
                    alt={blog.title}
                    sx={{
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease-in-out',
                      width: '100%',
                      aspectRatio: '16/9',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 100%)',
                        pointerEvents: 'none',
                      },
                    }}
                  />
                  <CardHeader
                    sx={{
                      padding: '20px',
                      background: 'rgba(255, 255, 255, 0.8)',
                      transition: 'all 0.3s ease-in-out',
                      '& .MuiCardHeader-avatar': {
                        marginRight: '12px',
                      },
                    }}
                    avatar={
                      <Avatar 
                        src={blog.author.avatar} 
                        alt={blog.author.name}
                        sx={{ 
                          width: 48, 
                          height: 48,
                          border: '3px solid',
                          borderColor: 'primary.main',
                          boxShadow: '0 4px 12px rgba(15, 164, 175, 0.2)',
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            transform: 'scale(1.1) rotate(5deg)',
                          },
                        }}
                      />
                    }
                    title={
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: 600,
                          background: 'linear-gradient(45deg, #024950 30%, #0FA4AF 90%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontSize: '1.1rem',
                        }}
                      >
                        {blog.author.name}
                      </Typography>
                    }
                    subheader={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {blog.date}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          •
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {blog.readTime}
                        </Typography>
                      </Box>
                    }
                  />
                  <CardContent sx={{ 
                    flexGrow: 1,
                    position: 'relative',
                    padding: '20px',
                    background: 'rgba(255, 255, 255, 0.7)',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'radial-gradient(circle at top right, rgba(15, 164, 175, 0.03), transparent 70%)',
                      pointerEvents: 'none',
                    }
                  }}>
                    <Chip 
                      label={blog.category} 
                      size="small" 
                      sx={{ 
                        mb: 2,
                        background: 'linear-gradient(45deg, #024950 30%, #0FA4AF 90%)',
                        color: 'white',
                        fontWeight: 500,
                        height: '28px',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 8px rgba(15, 164, 175, 0.2)',
                        },
                      }}
                    />
                    <Typography 
                      variant="h6" 
                      component="h3" 
                      gutterBottom
                      sx={{ 
                        fontWeight: 600,
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.4,
                        fontSize: '1.25rem',
                        color: '#1a1a1a',
                      }}
                    >
                      {blog.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.6,
                        fontSize: '0.95rem',
                      }}
                    >
                      {blog.excerpt}
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      mt: 'auto',
                      pt: 2,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                    }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          size="small" 
                          color="error"
                          sx={{
                            '&:hover': {
                              transform: 'scale(1.1)',
                              color: 'error.main',
                              bgcolor: 'rgba(211, 47, 47, 0.1)',
                            },
                          }}
                        >
                          <Favorite sx={{ fontSize: 20 }} />
                        </IconButton>
                        <Typography variant="caption" color="text.secondary">
                          {blog.likes}
                        </Typography>
                        <IconButton 
                          size="small"
                          sx={{
                            '&:hover': {
                              transform: 'scale(1.1)',
                              color: 'primary.main',
                              bgcolor: 'rgba(15, 164, 175, 0.1)',
                            },
                          }}
                        >
                          <Comment sx={{ fontSize: 20 }} />
                        </IconButton>
                        <Typography variant="caption" color="text.secondary">
                          {blog.comments}
                        </Typography>
                      </Box>
                      <Box>
                        <IconButton 
                          size="small"
                          sx={{
                            '&:hover': {
                              transform: 'scale(1.1)',
                              color: 'primary.main',
                              bgcolor: 'rgba(15, 164, 175, 0.1)',
                            },
                          }}
                        >
                          <Share sx={{ fontSize: 20 }} />
                        </IconButton>
                        <IconButton 
                          size="small"
                          sx={{
                            '&:hover': {
                              transform: 'scale(1.1)',
                              color: 'primary.main',
                              bgcolor: 'rgba(15, 164, 175, 0.1)',
                            },
                          }}
                        >
                          <Bookmark sx={{ fontSize: 20 }} />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Why Choose Blogverse Section */}
      <Box sx={{ 
        py: { xs: 6, md: 8 },
        position: 'relative',
        zIndex: 1,
        width: '100%',
        background: theme.palette.mode === 'light'
          ? 'linear-gradient(135deg, rgba(175, 221, 229, 0.1) 0%, rgba(15, 164, 175, 0.1) 100%)'
          : 'linear-gradient(135deg, rgba(0, 49, 53, 0.4) 0%, rgba(2, 73, 80, 0.4) 100%)',
        mb: { xs: 6, md: 8 },
      }}>
        <Container 
          sx={{ 
            width: 'calc(100% - 40px)',
            maxWidth: '1400px !important',
            mx: 'auto',
            px: '20px',
          }}
        >
          <Typography
            variant="h4"
            component="h2"
            sx={{ 
              mb: { xs: 3, md: 4 }, 
              fontWeight: 600,
              textAlign: 'center',
              background: 'linear-gradient(45deg, #024950 30%, #0FA4AF 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Why Choose Blogverse?
          </Typography>
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ width: '100%', m: 0 }}>
            {whyBlogverse.map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item.id}>
                <Box
                  sx={{
                    perspective: '1000px',
                    height: '300px',
                  }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      position: 'relative',
                      transformStyle: 'preserve-3d',
                      transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      background: theme.palette.mode === 'light'
                        ? 'rgba(255, 255, 255, 0.9)'
                        : 'rgba(2, 73, 80, 0.9)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '20px',
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      '&:hover': {
                        transform: 'rotateY(180deg)',
                        boxShadow: `0 12px 48px ${item.color}40`,
                      },
                    }}
                  >
                    {/* Front of card */}
                    <Box
                      sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 3,
                        textAlign: 'center',
                        background: theme.palette.mode === 'light' ? item.cardBg : 'rgba(2, 73, 80, 0.9)',
                        borderRadius: '20px',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          background: theme.palette.mode === 'light' ? item.cardHoverBg : 'rgba(2, 73, 80, 0.95)',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                          background: item.iconBg,
                          color: 'white',
                          boxShadow: `0 8px 24px ${item.color}40`,
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            boxShadow: `0 12px 32px ${item.color}60`,
                          },
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 2,
                          fontWeight: 600,
                          color: theme.palette.mode === 'light' ? item.color : '#AFDDE5',
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            transform: 'scale(1.05)',
                          },
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.secondary,
                          lineHeight: 1.6,
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            transform: 'scale(1.02)',
                          },
                        }}
                      >
                        {item.description}
                      </Typography>
                    </Box>

                    {/* Back of card */}
                    <Box
                      sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 3,
                        textAlign: 'center',
                        background: item.gradient,
                        color: 'white',
                        borderRadius: '20px',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          background: item.hoverGradient,
                        },
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 2,
                          fontWeight: 600,
                          textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          opacity: 0.9,
                          lineHeight: 1.6,
                          textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                        }}
                      >
                        {item.description}
                      </Typography>
                    </Box>
                  </Card>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

export default Home; 