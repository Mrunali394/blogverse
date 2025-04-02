import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Article } from '@mui/icons-material';

const categories = [
  {
    id: 1,
    name: 'Technology',
    icon: '🚀',
    description: 'Latest tech trends, innovations, and digital transformations',
    color: '#1A237E',
    gradient: 'linear-gradient(135deg, #1A237E 0%, #283593 100%)',
    stats: {
      posts: 1234,
      trending: 89
    }
  },
  {
    id: 2,
    name: 'Design',
    icon: '🎨',
    description: 'UI/UX design principles, tools, and creative inspiration',
    color: '#B71C1C',
    gradient: 'linear-gradient(135deg, #B71C1C 0%, #C62828 100%)',
    stats: {
      posts: 856,
      trending: 45
    }
  },
  {
    id: 3,
    name: 'Development',
    icon: '💻',
    description: 'Programming tutorials, coding tips, and best practices',
    color: '#1B5E20',
    gradient: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
    stats: {
      posts: 2156,
      trending: 156
    }
  },
  {
    id: 4,
    name: 'Business',
    icon: '📈',
    description: 'Entrepreneurship, startups, and business strategies',
    color: '#4A148C',
    gradient: 'linear-gradient(135deg, #4A148C 0%, #6A1B9A 100%)',
    stats: {
      posts: 967,
      trending: 67
    }
  },
  {
    id: 5,
    name: 'Lifestyle',
    icon: '🌟',
    description: 'Personal development, wellness, and lifestyle tips',
    color: '#E65100',
    gradient: 'linear-gradient(135deg, #E65100 0%, #F57C00 100%)',
    stats: {
      posts: 1543,
      trending: 98
    }
  },
  {
    id: 6,
    name: 'Science',
    icon: '🔬',
    description: 'Scientific discoveries, research, and innovations',
    color: '#01579B',
    gradient: 'linear-gradient(135deg, #01579B 0%, #0277BD 100%)',
    stats: {
      posts: 789,
      trending: 34
    }
  },
  {
    id: 7,
    name: 'Food & Cooking',
    icon: '🍳',
    description: 'Recipes, cooking tips, and culinary adventures',
    color: '#BF360C',
    gradient: 'linear-gradient(135deg, #BF360C 0%, #D84315 100%)',
    stats: {
      posts: 1123,
      trending: 78
    }
  },
  {
    id: 8,
    name: 'Travel',
    icon: '✈️',
    description: 'Travel guides, tips, and wanderlust inspiration',
    color: '#0D47A1',
    gradient: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)',
    stats: {
      posts: 987,
      trending: 56
    }
  },
  {
    id: 9,
    name: 'Health & Fitness',
    icon: '💪',
    description: 'Health tips, workout routines, and wellness advice',
    color: '#2E7D32',
    gradient: 'linear-gradient(135deg, #2E7D32 0%, #388E3C 100%)',
    stats: {
      posts: 876,
      trending: 45
    }
  },
  {
    id: 10,
    name: 'Arts & Culture',
    icon: '🎭',
    description: 'Art, music, literature, and cultural insights',
    color: '#6A1B9A',
    gradient: 'linear-gradient(135deg, #6A1B9A 0%, #7B1FA2 100%)',
    stats: {
      posts: 654,
      trending: 32
    }
  },
  {
    id: 11,
    name: 'Education',
    icon: '📚',
    description: 'Learning resources, study tips, and educational content',
    color: '#C2185B',
    gradient: 'linear-gradient(135deg, #C2185B 0%, #D81B60 100%)',
    stats: {
      posts: 543,
      trending: 28
    }
  },
  {
    id: 12,
    name: 'Environment',
    icon: '🌱',
    description: 'Environmental issues, sustainability, and eco-friendly living',
    color: '#1B5E20',
    gradient: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
    stats: {
      posts: 432,
      trending: 23
    }
  }
];

const CategoryCards = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <Box
      sx={{
        py: { xs: 4, md: 8 },
        px: { xs: 2, sm: 4, md: 6 },
        background: theme.palette.mode === 'light'
          ? 'linear-gradient(135deg, rgba(175, 221, 229, 0.1) 0%, rgba(15, 164, 175, 0.1) 100%)'
          : 'linear-gradient(135deg, rgba(0, 49, 53, 0.4) 0%, rgba(2, 73, 80, 0.4) 100%)',
      }}
    >
      <Typography
        variant="h2"
        align="center"
        gutterBottom
        sx={{
          mb: 6,
          fontSize: { xs: '2rem', md: '2.75rem' },
          fontWeight: 800,
          color: theme.palette.mode === 'light' ? '#024950' : '#AFDDE5',
          textShadow: theme.palette.mode === 'light' 
            ? '2px 2px 4px rgba(2, 73, 80, 0.1)'
            : '2px 2px 4px rgba(0, 0, 0, 0.3)',
        }}
      >
        Explore Categories
      </Typography>
      <Grid container spacing={4}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.id}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onHoverStart={() => setHoveredId(category.id)}
              onHoverEnd={() => setHoveredId(null)}
            >
              <Card
                onClick={() => navigate(`/category/${category.name.toLowerCase()}`)}
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  position: 'relative',
                  borderRadius: '20px',
                  background: theme.palette.mode === 'light'
                    ? 'rgba(255, 255, 255, 0.9)'
                    : 'rgba(2, 73, 80, 0.9)',
                  backdropFilter: 'blur(10px)',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease-in-out',
                  border: `2px solid transparent`,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: `linear-gradient(135deg, ${alpha(category.color, 0.2)} 0%, transparent 100%)`,
                    opacity: 0,
                    transition: 'opacity 0.3s ease-in-out',
                  },
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 20px 40px ${alpha(category.color, 0.2)}`,
                    border: `2px solid ${category.color}`,
                    '&::before': {
                      opacity: 1,
                    },
                    '& .category-overlay': {
                      opacity: 1,
                      transform: 'translateY(0)',
                    },
                    '& .category-icon': {
                      transform: 'scale(1.1)',
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: `linear-gradient(45deg, ${alpha(category.color, 0.1)} 0%, transparent 100%)`,
                    zIndex: 1,
                  }}
                />
                <CardContent sx={{ position: 'relative', zIndex: 2, p: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Box
                      className="category-icon"
                      sx={{
                        fontSize: '3.5rem',
                        transition: 'transform 0.3s ease-in-out',
                        filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.2))',
                      }}
                    >
                      {category.icon}
                    </Box>
                    <Chip
                      label={`${category.stats.trending}+ Trending`}
                      size="small"
                      icon={<TrendingUp sx={{ fontSize: 16 }} />}
                      sx={{
                        background: `${alpha(category.color, 0.1)}`,
                        color: category.color,
                        borderRadius: '16px',
                        border: `1px solid ${alpha(category.color, 0.2)}`,
                        '& .MuiChip-icon': {
                          color: 'inherit',
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: category.color,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      {category.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                        minHeight: '3em',
                      }}
                    >
                      {category.description}
                    </Typography>
                  </Box>

                  <Box
                    className="category-overlay"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      pt: 2,
                      mt: 2,
                      borderTop: `1px solid ${alpha(category.color, 0.2)}`,
                      opacity: 0.7,
                      transform: 'translateY(10px)',
                      transition: 'all 0.3s ease-in-out',
                    }}
                  >
                    <Tooltip title="Total Posts">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Article sx={{ fontSize: 20, color: category.color }} />
                        <Typography
                          sx={{
                            color: category.color,
                            fontWeight: 600,
                            fontSize: '0.9rem',
                          }}
                        >
                          {category.stats.posts} Posts
                        </Typography>
                      </Box>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CategoryCards; 