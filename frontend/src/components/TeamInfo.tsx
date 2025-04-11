import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Avatar, Grid, Divider } from '@mui/material';
import { fffService } from '../services/fffService';
import { colors } from '../theme/theme';

interface TeamInfoProps {
  teamId: number;
  clubId: number;
  competId: number;
}

interface Club {
  logo: string;
  name: string;
}

interface Team {
  short_name: string;
  club?: Club;
}

interface Competition {
  cp_no: number;
  name: string;
}

interface Match {
  id: number;
  date: string;
  home: Team;
  away: Team;
  competition?: Competition;
}

interface MatchResult extends Match {
  home_score: number;
  away_score: number;
}

interface NextMatch extends Match {
  time?: string;
}

interface TeamDetails {
  clubInfo: any;
  results: any;
  calendar: any;
}

const TeamInfo: React.FC<TeamInfoProps> = ({ teamId, clubId, competId }) => {
  const [teamDetails, setTeamDetails] = useState<TeamDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const [clubInfo, results, calendar] = await Promise.all([
          fffService.getClubInfo(clubId),
          fffService.getClubResults(clubId),
          fffService.getClubCalendar(clubId)
        ]);
        setTeamDetails({ clubInfo, results, calendar });
      } catch (err) {
        console.error('Erreur lors de la récupération des détails:', err);
        setError('Impossible de charger les informations du club. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamDetails();
  }, [clubId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short'
    });
  };

  const filterResultsByCompetition = (items: MatchResult[]) => {
    return items.filter(item => item.competition?.cp_no === competId);
  };

  const filterMatchesByCompetition = (items: NextMatch[]) => {
    return items.filter(item => item.competition?.cp_no === competId);
  };

  const renderMatchResult = (result: MatchResult) => {
    return (
      <Paper key={`result-${result.id}`} sx={{ p: 2, mb: 1 }}>
        <Typography variant="body1" color="text.secondary">
          {result.competition?.name || 'Compétition inconnue'}
        </Typography>
        <Typography variant="body1">
          {formatDate(result.date)} - {result.home?.short_name || 'Équipe à domicile'} {result.home_score} - {result.away_score} {result.away?.short_name || 'Équipe à l\'extérieur'}
        </Typography>
      </Paper>
    );
  };

  const renderNextMatch = (match: NextMatch) => {
    return (
      <Paper key={`match-${match.id}`} sx={{ p: 2, mb: 1 }}>
        <Typography variant="body1" color="text.secondary">
          {match.competition?.name || 'Compétition inconnue'}
        </Typography>
        <Typography variant="body1">
          {formatDate(match.date)} - {match.home?.short_name || 'Équipe à domicile'} vs {match.away?.short_name || 'Équipe à l\'extérieur'}
        </Typography>
      </Paper>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!teamDetails) {
    return null;
  }

  const { clubInfo, results, calendar } = teamDetails;
  const allResults = results['hydra:member'] || [];
  const allMatches = calendar['hydra:member'] || [];
  
  const filteredResults = filterResultsByCompetition(allResults);
  const filteredMatches = filterMatchesByCompetition(allMatches);
  
  const lastResults = filteredResults.slice(0, 5);
  const nextMatches = filteredMatches.slice(0, 5);

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mt: 4 }}>
      <Grid container spacing={3}>
        {/* En-tête avec logo et nom du club */}
        <Grid item xs={12}>
          <Box 
            sx={{
              background: { 
                xs: `linear-gradient(135deg, ${colors.archeYellow} 0%, ${colors.archeBlue} 100%)`,
                sm: `linear-gradient(135deg, ${colors.archeYellow} 0%, ${colors.archeBlue} 100%)`
              },
              p: { xs: 2, sm: 3 },
              borderRadius: { xs: '12px', sm: '16px' },
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
              width: '100%',
              position: 'relative',
              overflow: 'hidden',
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
            <Box
              sx={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                justifyContent: 'center',
                gap: { xs: 2, sm: 4 },
                width: '100%'
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    width: { xs: '120px', sm: '150px' },
                    height: { xs: '120px', sm: '150px' },
                    background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
                    borderRadius: '50%',
                    zIndex: 1
                  }}
                />
                <Avatar
                  src={clubInfo.logo}
                  alt={clubInfo.name}
                  sx={{ 
                    width: { xs: 100, sm: 120 }, 
                    height: { xs: 100, sm: 120 },
                    border: `4px solid ${colors.archeYellow}`,
                    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                    position: 'relative',
                    zIndex: 2,
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }}
                />
              </Box>
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 2,
                  textAlign: 'center',
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                <Typography 
                  variant="h4" 
                  sx={{
                    fontSize: { xs: '1.75rem', sm: '2.5rem' },
                    color: colors.archeWhite,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    background: `linear-gradient(to right, ${colors.archeWhite}, ${colors.archeYellow})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                  }}
                >
                  {clubInfo.name}
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: colors.archeWhite,
                    fontSize: { xs: '0.9rem', sm: '1.1rem' },
                    fontWeight: 500,
                    letterSpacing: '0.05em',
                    opacity: 0.9
                  }}
                >
                  Football Club
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Résultats et Prochains matchs */}
        <Grid item xs={12}>
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {/* Derniers résultats */}
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  fontWeight: 600,
                  color: colors.archeBlue
                }}
              >
                Derniers résultats
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1, sm: 2 } }}>
                {lastResults.length > 0 ? (
                  lastResults.map((result) => (
                    <Paper 
                      key={`result-${result.id}`} 
                      sx={{ 
                        p: { xs: 1.5, sm: 2 },
                        background: '#f8f9fa',
                        borderRadius: '8px',
                        border: '1px solid rgba(0,0,0,0.1)'
                      }}
                    >
                      <Typography 
                        sx={{ 
                          color: colors.archeGray,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          mb: 1
                        }}
                      >
                        {result.competition?.name || 'Compétition inconnue'}
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: { xs: 1, sm: 2 }
                      }}>
                        <Typography sx={{ 
                          fontSize: { xs: '0.8rem', sm: '0.9rem' },
                          fontWeight: 500,
                          flex: 1,
                          textAlign: 'right'
                        }}>
                          {result.home?.short_name || 'Équipe à domicile'}
                        </Typography>
                        <Box sx={{ 
                          px: { xs: 2, sm: 3 },
                          py: { xs: 0.5, sm: 1 },
                          background: colors.archeGradient,
                          borderRadius: '8px',
                          minWidth: { xs: '60px', sm: '80px' },
                          textAlign: 'center'
                        }}>
                          <Typography sx={{ 
                            color: colors.archeWhite,
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            fontWeight: 'bold'
                          }}>
                            {result.home_score} - {result.away_score}
                          </Typography>
                        </Box>
                        <Typography sx={{ 
                          fontSize: { xs: '0.8rem', sm: '0.9rem' },
                          fontWeight: 500,
                          flex: 1
                        }}>
                          {result.away?.short_name || 'Équipe à l\'extérieur'}
                        </Typography>
                      </Box>
                    </Paper>
                  ))
                ) : (
                  <Typography 
                    sx={{ 
                      textAlign: 'center',
                      color: colors.archeGray,
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    Aucun résultat disponible
                  </Typography>
                )}
              </Box>
            </Grid>

            {/* Prochains matchs */}
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  fontWeight: 600,
                  color: colors.archeBlue
                }}
              >
                Prochains matchs
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1, sm: 2 } }}>
                {nextMatches.length > 0 ? (
                  nextMatches.map((match) => (
                    <Paper 
                      key={`match-${match.id}`} 
                      sx={{ 
                        p: { xs: 1.5, sm: 2 },
                        background: '#f8f9fa',
                        borderRadius: '8px',
                        border: '1px solid rgba(0,0,0,0.1)'
                      }}
                    >
                      <Typography 
                        sx={{ 
                          color: colors.archeGray,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          mb: 1
                        }}
                      >
                        {match.competition?.name || 'Compétition inconnue'}
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: { xs: 1, sm: 2 }
                      }}>
                        <Typography sx={{ 
                          fontSize: { xs: '0.8rem', sm: '0.9rem' },
                          fontWeight: 500,
                          flex: 1,
                          textAlign: 'right'
                        }}>
                          {match.home?.short_name || 'Équipe à domicile'}
                        </Typography>
                        <Box sx={{ 
                          px: { xs: 2, sm: 3 },
                          py: { xs: 0.5, sm: 1 },
                          background: colors.archeGradientYellow,
                          borderRadius: '8px',
                          minWidth: { xs: '60px', sm: '80px' },
                          textAlign: 'center'
                        }}>
                          <Typography sx={{ 
                            color: colors.archeDark,
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            fontWeight: 'bold'
                          }}>
                            vs
                          </Typography>
                        </Box>
                        <Typography sx={{ 
                          fontSize: { xs: '0.8rem', sm: '0.9rem' },
                          fontWeight: 500,
                          flex: 1
                        }}>
                          {match.away?.short_name || 'Équipe à l\'extérieur'}
                        </Typography>
                      </Box>
                    </Paper>
                  ))
                ) : (
                  <Typography 
                    sx={{ 
                      textAlign: 'center',
                      color: colors.archeGray,
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    Aucun match à venir
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TeamInfo; 