import React from 'react';
import { Box, Typography } from '@mui/material';
import { colors } from '../theme/theme';
import logo from '../assets/logo-arche-fc.png';

const Header: React.FC = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: { xs: '100px', sm: '120px' },
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${colors.archeYellow} 0%, ${colors.archeBlue} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          zIndex: 1
        }
      }}
    >
      {/* Bande diagonale dynamique */}
      <Box
        sx={{
          position: 'absolute',
          width: '200%',
          height: '200%',
          background: `linear-gradient(45deg, ${colors.archeBlue} 0%, transparent 50%, ${colors.archeYellow} 100%)`,
          transform: 'rotate(-15deg)',
          left: '-50%',
          top: '-50%',
          opacity: 0.3,
          animation: 'pulse 8s infinite',
          '@keyframes pulse': {
            '0%': { transform: 'rotate(-15deg) scale(1)' },
            '50%': { transform: 'rotate(-15deg) scale(1.1)' },
            '100%': { transform: 'rotate(-15deg) scale(1)' }
          }
        }}
      />

      {/* Contenu du header */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '1200px',
          px: { xs: 2, sm: 4 }
        }}
      >
        {/* Logo à gauche */}
        <Box
          component="img"
          src={logo}
          alt="Logo Arche FC"
          sx={{
            width: { xs: '60px', sm: '80px' },
            height: { xs: '60px', sm: '80px' },
            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.1)'
            }
          }}
        />

        {/* Titre */}
        <Typography
          variant="h2"
          sx={{
            color: colors.archeWhite,
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontSize: { xs: '1.8rem', sm: '3rem' },
            textShadow: '3px 3px 6px rgba(0,0,0,0.4)',
            fontFamily: "'Bebas Neue', sans-serif",
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FFD700 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.5))',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-4px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60%',
              height: '3px',
              background: 'linear-gradient(90deg, transparent, #FFFFFF, transparent)',
              borderRadius: '2px'
            }
          }}
        >
          ARCHE FC
        </Typography>

        {/* Logo à droite */}
        <Box
          component="img"
          src={logo}
          alt="Logo Arche FC"
          sx={{
            width: { xs: '60px', sm: '80px' },
            height: { xs: '60px', sm: '80px' },
            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.1)'
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default Header; 