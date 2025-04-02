import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Create,
  Group,
  TrendingUp,
  Search,
  Visibility,
  Share,
  Notifications,
  Bookmark,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <Create />,
    title: 'Express Your Ideas',
    description: 'Share your thoughts, experiences, and expertise with a global audience through engaging blog posts.',
  },
  {
    icon: <Group />,
    title: 'Build Community',
    description: 'Connect with like-minded individuals, engage in meaningful discussions, and grow your network.',
  },
  {
    icon: <TrendingUp />,
    title: 'Grow Your Audience',
    description: 'Reach more readers and build a loyal following with our SEO-optimized platform.',
  },
  {
    icon: <Search />,
    title: 'Discover Content',
    description: 'Find relevant articles and topics that interest you with our smart search and filtering system.',
  },
  {
    icon: <Visibility />,
    title: 'Track Performance',
    description: 'Monitor your blog\'s performance with detailed analytics and reader engagement metrics.',
  },
  {
    icon: <Share />,
    title: 'Easy Sharing',
    description: 'Share your content across social media platforms and expand your reach effortlessly.',
  },
  {
    icon: <Notifications />,
    title: 'Stay Updated',
    description: 'Get real-time notifications for comments, likes, and mentions to engage with your audience.',
  },
  {
    icon: <Bookmark />,
    title: 'Save for Later',
    description: 'Bookmark interesting articles and create personalized reading lists for later.',
  },
];

const FeatureCards = () => {
  const theme = useTheme();

  return (
    <Box sx={{ py: 8 }}>
      <Typography
        component="h2"
        variant="h3"
        align="center"
        gutterBottom
        sx={{
          mb: 6,
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          backgroundClip: 'text',
          textFillColor: 'transparent',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Why Choose Our Platform?
      </Typography>
      <Grid container spacing={4}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease-in-out',
                  background: theme.palette.mode === 'light'
                    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.1)} 100%)`
                    : `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.2)} 0%, ${alpha(theme.palette.secondary.dark, 0.2)} 100%)`,
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 24px -10px ${alpha(theme.palette.primary.main, 0.3)}`,
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                    '& .icon': {
                      transform: 'scale(1.1)',
                      color: theme.palette.primary.main,
                    },
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box
                    className="icon"
                    sx={{
                      mb: 2,
                      display: 'flex',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease-in-out',
                      '& > svg': {
                        fontSize: '2.5rem',
                        color: theme.palette.text.secondary,
                      },
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    gutterBottom
                    variant="h6"
                    component="h3"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.6,
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FeatureCards; 