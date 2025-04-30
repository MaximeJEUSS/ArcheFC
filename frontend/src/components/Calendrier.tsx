import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Avatar,
  CircularProgress,
  Grid,
  Chip
} from '@mui/material';
import { Match } from '../services/fffService';
import { colors } from '../theme/theme';

interface CalendrierProps {
  matches: Match[];
  loading: boolean;
  error: string | null;
}

const Calendrier: React.FC<CalendrierProps> = ({ matches, loading, error }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString || '--:--';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2} sx={{ color: 'error.main' }}>
        {error}
      </Box>
    );
  }

  return (
    <Box>
      {Object.entries(
        matches.reduce((acc, match) => {
          const journee = match.poule_journee?.number || 'Non défini';
          if (!acc[journee]) {
            acc[journee] = [];
          }
          acc[journee].push(match);
          return acc;
        }, {} as { [key: string]: Match[] })
      ).map(([journee, dayMatches]) => (
        <Box key={journee} sx={{ mb: 3 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: colors.archeBlue,
              fontWeight: 'bold',
              mb: 2,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              borderBottom: `2px solid ${colors.archeYellow}`,
              pb: 1
            }}
          >
            Journée {journee}
          </Typography>
          {dayMatches.map((match) => {
            if (!match || !match.home || !match.away) return null;

            const matchDate = new Date(match.date);
            const today = new Date();
            const isPastMatch = matchDate < today;

            return (
              <Paper
                key={match.id}
                elevation={1}
                sx={{
                  mb: 2,
                  p: { xs: 1.5, sm: 2 },
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid rgba(0,0,0,0.1)'
                }}
              >
                {/* Date et Heure */}
                <Box 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: { xs: 1.5, sm: 2 }
                  }}
                >
                  <Typography 
                    sx={{ 
                      color: colors.archeGray,
                      fontWeight: 600,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                  >
                    {formatDate(match.date)}
                  </Typography>
                  <Chip 
                    label={formatTime(match.time)}
                    size="small"
                    sx={{ 
                      height: { xs: '20px', sm: '24px' },
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      background: colors.archeGradientYellow,
                      color: colors.archeDark,
                      fontWeight: 600
                    }}
                  />
                </Box>

                {/* Équipes et Score */}
                <Box 
                  sx={{ 
                    display: 'grid',
                    gridTemplateColumns: { xs: 'minmax(0, 1fr) auto minmax(0, 1fr)', sm: '1fr auto 1fr' },
                    alignItems: 'center',
                    gap: { xs: 1, sm: 2 },
                    width: '100%',
                    minWidth: '100%'
                  }}
                >
                  {/* Équipe domicile */}
                  <Box 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      justifyContent: 'flex-end',
                      textAlign: 'right',
                      minWidth: 0
                    }}
                  >
                    <Typography 
                      sx={{ 
                        fontSize: { xs: '0.8rem', sm: '0.9rem' },
                        fontWeight: 600,
                        textAlign: 'right',
                        wordBreak: 'break-word',
                        maxWidth: '100%'
                      }}
                    >
                      {match.home.short_name}
                    </Typography>
                    {match.home.club?.logo && (
                      <Avatar 
                        src={match.home.club.logo}
                        alt={match.home.short_name}
                        sx={{ 
                          width: { xs: 24, sm: 28 },
                          height: { xs: 24, sm: 28 },
                          flexShrink: 0
                        }}
                      />
                    )}
                  </Box>

                  {/* Score */}
                  <Box 
                    sx={{ 
                      px: { xs: 1, sm: 3 },
                      py: { xs: 0.5, sm: 1 },
                      minWidth: { xs: '70px', sm: '100px' },
                      width: { xs: '70px', sm: '100px' },
                      background: isPastMatch ? colors.archeGradient : colors.archeGradientYellow,
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexShrink: 0,
                      mx: 'auto',
                      position: 'relative',
                      left: { xs: '0', sm: 'auto' }
                    }}
                  >
                    <Typography 
                      sx={{ 
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        fontWeight: 'bold',
                        color: isPastMatch ? colors.archeWhite : colors.archeDark,
                        textAlign: 'center',
                        width: '100%',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {isPastMatch ? `${match.home_score} - ${match.away_score}` : 'vs'}
                    </Typography>
                  </Box>

                  {/* Équipe extérieur */}
                  <Box 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      justifyContent: 'flex-start',
                      minWidth: 0
                    }}
                  >
                    {match.away.club?.logo && (
                      <Avatar 
                        src={match.away.club.logo}
                        alt={match.away.short_name}
                        sx={{ 
                          width: { xs: 24, sm: 28 },
                          height: { xs: 24, sm: 28 },
                          flexShrink: 0
                        }}
                      />
                    )}
                    <Typography 
                      sx={{ 
                        fontSize: { xs: '0.8rem', sm: '0.9rem' },
                        fontWeight: 600,
                        textAlign: 'left',
                        wordBreak: 'break-word',
                        maxWidth: '100%'
                      }}
                    >
                      {match.away.short_name}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            );
          })}
        </Box>
      ))}
    </Box>
  );
};

export default Calendrier; 