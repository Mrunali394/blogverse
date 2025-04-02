import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Button,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Person, Assessment, CheckCircle, Timeline } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const theme = useTheme();
  const { user } = useAuth();

  const stats = [
    { title: 'Total Posts', value: '0', icon: <Assessment />, color: '#2196f3' },
    { title: 'Following', value: '0', icon: <Person />, color: '#4caf50' },
    { title: 'Followers', value: '0', icon: <Person />, color: '#f44336' },
    { title: 'Completed Tasks', value: '0', icon: <CheckCircle />, color: '#ff9800' },
  ];

  const recentActivities = [
    { text: 'Profile updated', time: '2 hours ago' },
    { text: 'New post created', time: '1 day ago' },
    { text: 'Joined the platform', time: '3 days ago' },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Stats Section */}
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  borderRadius: 2,
                }}
              >
                <Box sx={{ color: stat.color, mb: 1 }}>{stat.icon}</Box>
                <Typography variant="h4" component="div">
                  {stat.value}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {stat.title}
                </Typography>
              </Paper>
            </motion.div>
          </Grid>
        ))}

        {/* Main Content Section */}
        <Grid item xs={12} md={8}>
          <Paper
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            elevation={2}
            sx={{ p: 3, borderRadius: 2 }}
          >
            <Typography variant="h5" gutterBottom>
              Welcome back, {user?.name || 'User'}!
            </Typography>
            <Box sx={{ my: 2 }}>
              <Timeline />
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List>
                {recentActivities.map((activity, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemText
                      primary={activity.text}
                      secondary={activity.time}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Paper>
        </Grid>

        {/* Quick Actions Section */}
        <Grid item xs={12} md={4}>
          <Card
            component={motion.div}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            elevation={2}
            sx={{ borderRadius: 2 }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button variant="contained" color="primary" fullWidth>
                  Create New Post
                </Button>
                <Button variant="outlined" color="primary" fullWidth>
                  Edit Profile
                </Button>
                <Button variant="outlined" color="primary" fullWidth>
                  View Analytics
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;