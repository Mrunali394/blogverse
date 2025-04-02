import { Box, Typography, useTheme } from '@mui/material';
import { AutoStories, Public } from '@mui/icons-material';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

const Logo = ({ size = 'medium', showText = true }: LogoProps) => {
  const theme = useTheme();
  
  const sizeMap = {
    small: { icon: 24, text: '1.2rem' },
    medium: { icon: 32, text: '1.5rem' },
    large: { icon: 48, text: '2rem' },
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '120%',
          height: '120%',
          background: 'radial-gradient(circle, rgba(15, 164, 175, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          zIndex: -1,
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: sizeMap[size].icon * 1.5,
          height: sizeMap[size].icon * 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #024950 0%, #0FA4AF 100%)',
            borderRadius: '50%',
            animation: 'pulse 2s infinite',
          },
          '@keyframes pulse': {
            '0%': {
              transform: 'scale(1)',
              opacity: 1,
            },
            '50%': {
              transform: 'scale(1.1)',
              opacity: 0.8,
            },
            '100%': {
              transform: 'scale(1)',
              opacity: 1,
            },
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0FA4AF 0%, #024950 100%)',
            borderRadius: '50%',
            boxShadow: '0 4px 20px rgba(15, 164, 175, 0.3)',
          }}
        >
          <AutoStories
            sx={{
              fontSize: sizeMap[size].icon,
              color: 'white',
              position: 'relative',
              zIndex: 1,
            }}
          />
          <Public
            sx={{
              fontSize: sizeMap[size].icon * 0.6,
              color: 'white',
              position: 'absolute',
              bottom: -sizeMap[size].icon * 0.2,
              right: -sizeMap[size].icon * 0.2,
              zIndex: 1,
            }}
          />
        </Box>
      </Box>
      {showText && (
        <Typography
          variant="h6"
          sx={{
            fontSize: sizeMap[size].text,
            fontWeight: 700,
            background: 'linear-gradient(45deg, #024950 30%, #0FA4AF 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.5px',
          }}
        >
          Blogverse
        </Typography>
      )}
    </Box>
  );
};

export default Logo; 