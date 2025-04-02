import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Avatar,
  Button,
  TextField,
  IconButton,
  Paper,
  Grid,
  Chip,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  Edit as EditIcon,
  PhotoCamera,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

interface SocialLink {
  platform: string;
  url: string;
  icon: JSX.Element;
}

function Profile() {
  const theme = useTheme();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState(user?.profilePicture || '/default-avatar.png');
  const [bio, setBio] = useState('');
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { platform: 'Facebook', url: '', icon: <Facebook /> },
    { platform: 'Twitter', url: '', icon: <Twitter /> },
    { platform: 'LinkedIn', url: '', icon: <LinkedIn /> },
    { platform: 'Instagram', url: '', icon: <Instagram /> },
  ]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSocialLinkChange = (platform: string, newUrl: string) => {
    setSocialLinks(prevLinks =>
      prevLinks.map(link =>
        link.platform === platform ? { ...link, url: newUrl } : link
      )
    );
  };

  return (
    <Container maxWidth="lg">
      <Paper
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        elevation={2}
        sx={{ 
          mt: 4, 
          p: 4,
          borderRadius: 4,
          background: theme.palette.background.paper,
        }}
      >
        <Box sx={{ position: 'relative', mb: 4 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={user?.profilePicture || avatar}
                sx={{
                  width: 150,
                  height: 150,
                  border: `4px solid ${theme.palette.primary.main}`,
                }}
              />
              {isEditing && (
                <IconButton
                  color="primary"
                  aria-label="upload picture"
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: theme.palette.background.paper,
                    '&:hover': { backgroundColor: theme.palette.action.hover },
                  }}
                >
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={handleAvatarChange}
                  />
                  <PhotoCamera />
                </IconButton>
              )}
            </Box>

            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1" sx={{ mr: 2 }}>
                  {user?.name || 'Loading...'}
                </Typography>
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? 'contained' : 'outlined'}
                >
                  {isEditing ? 'Save Profile' : 'Edit Profile'}
                </Button>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Chip label={user?.role || 'User'} color="primary" sx={{ mr: 1 }} />
                <Chip label={user?.email} color="secondary" sx={{ mr: 1 }} />
                <Chip label="0 Followers" variant="outlined" sx={{ mr: 1 }} />
                <Chip label="0 Following" variant="outlined" />
              </Box>

              {isEditing ? (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Write something about yourself..."
                  variant="outlined"
                />
              ) : (
                <Typography color="text.secondary">
                  {bio || 'No bio added yet.'}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Social Links
          </Typography>
          <Grid container spacing={2}>
            {socialLinks.map((link) => (
              <Grid item xs={12} sm={6} key={link.platform}>
                {isEditing ? (
                  <TextField
                    fullWidth
                    label={link.platform}
                    value={link.url}
                    onChange={(e) =>
                      handleSocialLinkChange(link.platform, e.target.value)
                    }
                    InputProps={{
                      startAdornment: (
                        <Box sx={{ mr: 1, color: 'text.secondary' }}>
                          {link.icon}
                        </Box>
                      ),
                    }}
                  />
                ) : (
                  <Button
                    fullWidth
                    startIcon={link.icon}
                    href={link.url}
                    target="_blank"
                    disabled={!link.url}
                    variant="outlined"
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    {link.platform}
                  </Button>
                )}
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default Profile;