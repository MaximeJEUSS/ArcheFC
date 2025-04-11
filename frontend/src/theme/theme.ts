import { createTheme } from '@mui/material/styles';

export const colors = {
  archeBlue: '#1E3A8A',
  archeYellow: '#FCD34D',
  archeRed: '#DC2626',
  archeGreen: '#059669',
  archeGray: '#4B5563',
  archeLightGray: '#F3F4F6',
  archeDark: '#111827',
  archeWhite: '#FFFFFF',
  archeBlack: '#000000',
  archeGradient: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
  archeGradientYellow: 'linear-gradient(135deg, #FCD34D 0%, #FBBF24 100%)',
  archeGradientRed: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
  archeGradientGreen: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
  archeBackgroundPattern: `
    radial-gradient(circle at 100% 50%, transparent 20%, rgba(255, 255, 255, 0.3) 21%, rgba(255, 255, 255, 0.3) 34%, transparent 35%, transparent),
    radial-gradient(circle at 0% 50%, transparent 20%, rgba(255, 255, 255, 0.3) 21%, rgba(255, 255, 255, 0.3) 34%, transparent 35%, transparent) 0 -50px`,
};

export const theme = createTheme({
  palette: {
    primary: {
      main: colors.archeBlue,
      light: '#3B82F6',
      dark: '#1E40AF',
      contrastText: colors.archeWhite,
    },
    secondary: {
      main: colors.archeYellow,
      light: '#FDE68A',
      dark: '#F59E0B',
      contrastText: colors.archeDark,
    },
    error: {
      main: colors.archeRed,
      light: '#EF4444',
      dark: '#B91C1C',
    },
    success: {
      main: colors.archeGreen,
      light: '#10B981',
      dark: '#047857',
    },
    background: {
      default: colors.archeLightGray,
      paper: colors.archeWhite,
    },
    text: {
      primary: colors.archeDark,
      secondary: colors.archeGray,
    },
  },
  typography: {
    fontFamily: '"Russo One", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 700,
      letterSpacing: '0.02em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 700,
      letterSpacing: '0.02em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 700,
      letterSpacing: '0.02em',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 700,
      letterSpacing: '0.02em',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      letterSpacing: '0.02em',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      letterSpacing: '0.02em',
    },
    body1: {
      fontSize: '1rem',
      letterSpacing: '0.01em',
    },
    body2: {
      fontSize: '0.875rem',
      letterSpacing: '0.01em',
    },
    button: {
      textTransform: 'uppercase',
      fontWeight: 700,
      letterSpacing: '0.05em',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: `linear-gradient(135deg, ${colors.archeBlue}22 0%, ${colors.archeBlue}11 100%)`,
          backgroundImage: colors.archeBackgroundPattern,
          backgroundSize: '100px 100px',
          minHeight: '100vh',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '8px 24px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          },
        },
        contained: {
          background: colors.archeGradient,
          '&:hover': {
            background: colors.archeGradient,
            opacity: 0.9,
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: `${colors.archeWhite}dd`,
          backdropFilter: 'blur(8px)',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '16px',
          borderBottom: `1px solid ${colors.archeLightGray}`,
        },
        head: {
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: colors.archeDark,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: `${colors.archeLightGray} !important`,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 600,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: colors.archeLightGray,
        },
      },
    },
  },
}); 