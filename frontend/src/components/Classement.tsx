import React, { useEffect, useState } from 'react';
import { fffService, ClassementEquipe, TEAMS_CONFIG, Match } from '../services/fffService';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Avatar,
  Grid
} from '@mui/material';
import TeamInfo from './TeamInfo';
import Calendrier from './Calendrier';
import { colors } from '../theme/theme';
import { Convocations } from './Convocations';
import { LoginButton } from './LoginButton';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`team-tabpanel-${index}`}
      aria-labelledby={`team-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Classement: React.FC = () => {
  const [classements, setClassements] = useState<{ [key: number]: ClassementEquipe[] }>({});
  const [matches, setMatches] = useState<{ [key: number]: Match[] }>({});
  const [loading, setLoading] = useState<{ [key: number]: boolean }>({});
  const [error, setError] = useState<{ [key: number]: string | null }>({});
  const [selectedTeam, setSelectedTeam] = useState<{ teamId: number; clubId: number; competId: number } | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [currentSubTab, setCurrentSubTab] = useState(0);
  const initialFetchDone = React.useRef(false);

  const fetchClassement = async (teamId: number) => {
    if (classements[teamId]?.length > 0) return;

    setLoading(prev => ({ ...prev, [teamId]: true }));
    setError(prev => ({ ...prev, [teamId]: null }));

    try {
      const data = await fffService.getTeamClassement(teamId);
      setClassements(prev => ({ ...prev, [teamId]: data }));
    } catch (err) {
      setError(prev => ({ ...prev, [teamId]: 'Erreur lors de la récupération du classement' }));
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, [teamId]: false }));
    }
  };

  const fetchMatches = async (teamId: number) => {
    if (matches[teamId]?.length > 0) return;

    setLoading(prev => ({ ...prev, [teamId]: true }));
    setError(prev => ({ ...prev, [teamId]: null }));

    try {
      const teamConfig = TEAMS_CONFIG.find(team => team.id === teamId);
      if (teamConfig) {
        const data = await fffService.getCompetitionMatches(teamConfig.competId, teamConfig.pouleId);
        setMatches(prev => ({ ...prev, [teamId]: data }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, [teamId]: 'Erreur lors de la récupération des matchs' }));
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, [teamId]: false }));
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    setSelectedTeam(null);
    fetchClassement(newValue + 1);
    fetchMatches(newValue + 1);
  };

  const handleSubTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentSubTab(newValue);
  };

  const handleRowClick = (teamId: number, clubId: number) => {
    const teamConfig = TEAMS_CONFIG.find((team: { id: number; competId: string; pouleId: string }) => team.id === teamId);
    setSelectedTeam(prev => 
      prev?.teamId === teamId && prev?.clubId === clubId ? null : { 
        teamId, 
        clubId, 
        competId: teamConfig ? parseInt(teamConfig.competId) : 0 
      }
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const renderMatch = (match: Match) => {
    if (!match || !match.home || !match.away) return null;

    const isPastMatch = match.status !== 'A' || (match.home_score !== null && match.away_score !== null);

    return (
      <TableRow key={match.id}>
        <TableCell>
          {formatDate(match.date)} {match.time}
        </TableCell>
        <TableCell>
          <Box display="flex" alignItems="center" gap={1}>
            {match.home.club?.logo && (
              <Avatar 
                src={match.home.club.logo} 
                alt={match.home.short_name} 
                sx={{ width: 24, height: 24 }} 
              />
            )}
            {match.home.short_name}
          </Box>
        </TableCell>
        <TableCell>
          {isPastMatch ? (
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {match.home_score} - {match.away_score}
            </Typography>
          ) : (
            <Typography variant="body1" color="text.secondary">
              -
            </Typography>
          )}
        </TableCell>
        <TableCell>
          <Box display="flex" alignItems="center" gap={1}>
            {match.away.club?.logo && (
              <Avatar 
                src={match.away.club.logo} 
                alt={match.away.short_name} 
                sx={{ width: 24, height: 24 }} 
              />
            )}
            {match.away.short_name}
          </Box>
        </TableCell>
      </TableRow>
    );
  };

  const isArcheTeam = (teamName: string) => {
    return teamName.toLowerCase().includes('arche') || teamName.toLowerCase().includes('chaumes');
  };

  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchClassement(1);
      fetchMatches(1);
      initialFetchDone.current = true;
    }
  }, []);

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider',
        overflowX: 'auto',
        '& .MuiTabs-scroller': {
          overflowX: 'auto',
        },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange} 
          aria-label="équipes tabs"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            minHeight: { xs: '40px', sm: '48px' },
            '& .MuiTab-root': {
              minHeight: { xs: '40px', sm: '48px' },
              py: { xs: 0.5, sm: 1 },
              px: { xs: 0.5, sm: 2 },
              fontSize: { xs: '0.7rem', sm: '1rem' },
              minWidth: { xs: '60px', sm: 'auto' }
            }
          }}
        >
          {[1, 2, 3, 4].map((teamId) => (
            <Tab 
              key={teamId} 
              label={`Équipe ${teamId}`} 
              id={`team-tab-${teamId - 1}`}
              aria-controls={`team-tabpanel-${teamId - 1}`}
            />
          ))}
        </Tabs>
        <Box sx={{ px: 2 }}>
          <LoginButton />
        </Box>
      </Box>

      {[1, 2, 3, 4].map((teamId, index) => (
        <TabPanel key={teamId} value={currentTab} index={index}>
          <Box sx={{ 
            borderBottom: 1, 
            borderColor: 'divider', 
            mb: 2,
            overflowX: 'auto',
            '& .MuiTabs-scroller': {
              overflowX: 'auto',
            }
          }}>
            <Tabs 
              value={currentSubTab} 
              onChange={handleSubTabChange} 
              aria-label="sous-tabs"
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                minHeight: { xs: '40px', sm: '48px' },
                '& .MuiTab-root': {
                  minHeight: { xs: '40px', sm: '48px' },
                  py: { xs: 0.5, sm: 1 },
                  px: { xs: 0.5, sm: 2 },
                  fontSize: { xs: '0.7rem', sm: '1rem' },
                  minWidth: { xs: '60px', sm: 'auto' }
                }
              }}
            >
              <Tab 
                label="Classement" 
                sx={{ 
                  minWidth: { xs: '60px', sm: 'auto' }
                }}
              />
              <Tab 
                label="Calendrier" 
                sx={{ 
                  minWidth: { xs: '60px', sm: 'auto' }
                }}
              />
              <Tab 
                label="Convocations" 
                sx={{ 
                  minWidth: { xs: '60px', sm: 'auto' }
                }}
              />
            </Tabs>
          </Box>

          {currentSubTab === 0 && (
            <Box sx={{ overflowX: 'auto' }}>
              <TableContainer component={Paper} sx={{ 
                boxShadow: 'none',
                border: 'none',
                borderRadius: '0',
              }}>
                <Table size="small" sx={{ minWidth: { xs: 300, sm: 650 } }}>
                      <TableHead>
                        <TableRow>
                      <TableCell sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '0.6rem', sm: '0.875rem' },
                        py: { xs: 1, sm: 1.5 },
                        width: { xs: '20px', sm: 'auto' },
                        px: { xs: 0.5, sm: 1 }
                      }}>#</TableCell>
                      <TableCell sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '0.6rem', sm: '0.875rem' },
                        py: { xs: 1, sm: 1.5 },
                        width: { xs: '30%', sm: 'auto' },
                        px: { xs: 0.5, sm: 1 }
                      }}>Équipe</TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '0.6rem', sm: '0.875rem' },
                        py: { xs: 1, sm: 1.5 },
                        width: { xs: '20px', sm: 'auto' },
                        px: { xs: 0.5, sm: 1 }
                      }}>Pts</TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '0.6rem', sm: '0.875rem' },
                        py: { xs: 1, sm: 1.5 },
                        width: { xs: '20px', sm: 'auto' },
                        px: { xs: 0.5, sm: 1 }
                      }}>J</TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '0.6rem', sm: '0.875rem' },
                        py: { xs: 1, sm: 1.5 },
                        width: { xs: '20px', sm: 'auto' },
                        px: { xs: 0.5, sm: 1 }
                      }}>G</TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '0.6rem', sm: '0.875rem' },
                        py: { xs: 1, sm: 1.5 },
                        width: { xs: '20px', sm: 'auto' },
                        px: { xs: 0.5, sm: 1 }
                      }}>N</TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '0.6rem', sm: '0.875rem' },
                        py: { xs: 1, sm: 1.5 },
                        width: { xs: '20px', sm: 'auto' },
                        px: { xs: 0.5, sm: 1 }
                      }}>P</TableCell>
                      <TableCell align="center" sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '0.6rem', sm: '0.875rem' },
                        py: { xs: 1, sm: 1.5 },
                        width: { xs: '20px', sm: 'auto' },
                        px: { xs: 0.5, sm: 1 }
                      }}>+/-</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                    {classements[teamId]?.map((equipe, index) => (
                          <TableRow 
                            key={equipe.equipe.short_name}
                            onClick={() => handleRowClick(teamId, equipe.equipe.club.cl_no)}
                            sx={{ 
                              cursor: 'pointer',
                          '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                          backgroundColor: isArcheTeam(equipe.equipe.short_name) ? 'rgba(255, 215, 0, 0.3)' : 'inherit',
                          '& td': {
                            color: isArcheTeam(equipe.equipe.short_name) ? colors.archeBlue : 'inherit',
                            fontWeight: isArcheTeam(equipe.equipe.short_name) ? 'bold' : 'normal'
                          }
                        }}
                      >
                        <TableCell sx={{ 
                          fontSize: { xs: '0.6rem', sm: '0.875rem' },
                          py: { xs: 1, sm: 1.5 },
                          width: { xs: '20px', sm: 'auto' },
                          px: { xs: 0.5, sm: 1 }
                        }}>{equipe.rank}</TableCell>
                        <TableCell sx={{ 
                          fontSize: { xs: '0.6rem', sm: '0.875rem' },
                          py: { xs: 1, sm: 1.5 },
                          width: { xs: '30%', sm: 'auto' },
                          px: { xs: 0.5, sm: 1 }
                        }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography 
                              sx={{ 
                                fontSize: { xs: '0.6rem', sm: '0.875rem' },
                                fontWeight: isArcheTeam(equipe.equipe.short_name) ? 'bold' : 'normal',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: { xs: '100px', sm: 'none' }
                              }}
                            >
                              {equipe.equipe.short_name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center" sx={{ 
                          fontSize: { xs: '0.6rem', sm: '0.875rem' },
                          py: { xs: 1, sm: 1.5 },
                          width: { xs: '20px', sm: 'auto' },
                          px: { xs: 0.5, sm: 1 },
                          fontWeight: 'bold'
                        }}>{equipe.point_count}</TableCell>
                        <TableCell align="center" sx={{ 
                          fontSize: { xs: '0.6rem', sm: '0.875rem' },
                          py: { xs: 1, sm: 1.5 },
                          width: { xs: '20px', sm: 'auto' },
                          px: { xs: 0.5, sm: 1 }
                        }}>{equipe.total_games_count}</TableCell>
                        <TableCell align="center" sx={{ 
                          fontSize: { xs: '0.6rem', sm: '0.875rem' },
                          py: { xs: 1, sm: 1.5 },
                          width: { xs: '20px', sm: 'auto' },
                          px: { xs: 0.5, sm: 1 }
                        }}>{equipe.won_games_count}</TableCell>
                        <TableCell align="center" sx={{ 
                          fontSize: { xs: '0.6rem', sm: '0.875rem' },
                          py: { xs: 1, sm: 1.5 },
                          width: { xs: '20px', sm: 'auto' },
                          px: { xs: 0.5, sm: 1 }
                        }}>{equipe.draw_games_count}</TableCell>
                        <TableCell align="center" sx={{ 
                          fontSize: { xs: '0.6rem', sm: '0.875rem' },
                          py: { xs: 1, sm: 1.5 },
                          width: { xs: '20px', sm: 'auto' },
                          px: { xs: 0.5, sm: 1 }
                        }}>{equipe.lost_games_count}</TableCell>
                        <TableCell align="center" sx={{ 
                          fontSize: { xs: '0.6rem', sm: '0.875rem' },
                          py: { xs: 1, sm: 1.5 },
                          width: { xs: '20px', sm: 'auto' },
                          px: { xs: 0.5, sm: 1 }
                        }}>{equipe.goals_diff}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
            </Box>
          )}

          {currentSubTab === 1 && (
            <Box sx={{ mt: 2 }}>
              <Calendrier 
                matches={matches[teamId] || []}
                loading={loading[teamId] || false}
                error={error[teamId] || null}
                      />
                    </Box>
                  )}

          {currentSubTab === 2 && (
            <Box sx={{ mt: 2 }}>
              <Convocations teamId={teamId.toString()} />
            </Box>
          )}

          {currentSubTab === 0 && selectedTeam && selectedTeam.teamId === teamId && (
            <Box sx={{ mt: 2 }}>
              <TeamInfo 
                {...selectedTeam}
              />
            </Box>
          )}
        </TabPanel>
      ))}
    </Box>
  );
};

export default Classement; 