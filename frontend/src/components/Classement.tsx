import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fffService, ClassementEquipe, Match } from '../services/fffService';
import { getTeamsConfig } from '../services/teamConfigService';
import { teamService, Team } from '../services/teamService';
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

// Mapping entre les noms des sous-onglets et leurs indices
const SUB_TAB_NAMES = ['classement', 'calendrier', 'convocations'] as const;
type SubTabName = typeof SUB_TAB_NAMES[number];

const SUB_TAB_NAME_TO_INDEX: Record<SubTabName, number> = {
  'classement': 0,
  'calendrier': 1,
  'convocations': 2
};

const INDEX_TO_SUB_TAB_NAME: Record<number, SubTabName> = {
  0: 'classement',
  1: 'calendrier',
  2: 'convocations'
};

const Classement: React.FC = () => {
  const { teamId: teamIdParam, subTab: subTabParam } = useParams<{ teamId?: string; subTab?: string }>();
  const navigate = useNavigate();
  
  const [classements, setClassements] = useState<{ [key: number]: ClassementEquipe[] }>({});
  const [matches, setMatches] = useState<{ [key: number]: Match[] }>({});
  const [loading, setLoading] = useState<{ [key: number]: boolean }>({});
  const [error, setError] = useState<{ [key: number]: string | null }>({});
  const [selectedTeam, setSelectedTeam] = useState<{ teamId: number; clubId: number; competId: number } | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  
  // Calculer les valeurs depuis l'URL avec validation
  const teamIdNum = teamIdParam ? parseInt(teamIdParam) : 1;
  const subTabName = (subTabParam?.toLowerCase() as SubTabName) || 'classement';
  const subTabIndex = SUB_TAB_NAME_TO_INDEX[subTabName] ?? 0;
  const maxTeamIndex = teams.length > 0 ? teams.length - 1 : 0;
  const currentTab = Math.max(0, Math.min(maxTeamIndex, teamIdNum - 1));
  const currentSubTab = Math.max(0, Math.min(2, subTabIndex));
  
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
      const teamsConfig = await getTeamsConfig();
      // id est désormais un string (id technique). Utiliser l'index d'onglet (1..n)
      const teamConfig = teamsConfig[teamId - 1];
      if (teamConfig) {
        const data = await fffService.getCompetitionMatches(teamConfig.competId, teamConfig.pouleId, teamConfig.category);
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
    const newTeamId = newValue + 1;
    setSelectedTeam(null);
    const currentSubTabName = INDEX_TO_SUB_TAB_NAME[currentSubTab] || 'classement';
    navigate(`/team/${newTeamId}/${currentSubTabName}`, { replace: true });
    fetchClassement(newTeamId);
    fetchMatches(newTeamId);
  };

  const handleSubTabChange = (event: React.SyntheticEvent, newValue: number) => {
    const teamId = teamIdParam || '1';
    const subTabName = INDEX_TO_SUB_TAB_NAME[newValue] || 'classement';
    navigate(`/team/${teamId}/${subTabName}`, { replace: true });
  };

  const handleRowClick = async (teamId: number, clubId: number) => {
    const teamsConfig = await getTeamsConfig();
    // id est maintenant un string; on utilise l'index (1..n)
    const teamConfig = teamsConfig[teamId - 1];
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

  // Rediriger vers l'équipe 1 par défaut si pas de paramètres
  useEffect(() => {
    if (teams.length === 0) return; // Attendre que les équipes soient chargées
    
    if (!teamIdParam) {
      navigate('/team/1/classement', { replace: true });
      return;
    }
    
    // Valider et corriger les paramètres si nécessaire
    const teamId = parseInt(teamIdParam);
    
    if (teamId < 1 || teamId > teams.length) {
      navigate('/team/1/classement', { replace: true });
      return;
    }
    
    // Valider le nom du sous-onglet
    if (subTabParam) {
      const subTabNameLower = subTabParam.toLowerCase() as SubTabName;
      if (!SUB_TAB_NAMES.includes(subTabNameLower)) {
        navigate(`/team/${teamId}/classement`, { replace: true });
        return;
      }
    } else {
      // Si pas de sous-onglet spécifié, rediriger vers classement
      navigate(`/team/${teamId}/classement`, { replace: true });
      return;
    }
  }, [teamIdParam, subTabParam, navigate, teams.length]);

  // Charger les données quand l'équipe change
  useEffect(() => {
    if (teamIdParam && teams.length > 0) {
      const teamId = parseInt(teamIdParam);
      if (teamId >= 1 && teamId <= teams.length) {
        fetchClassement(teamId);
        fetchMatches(teamId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamIdParam, teams.length]);

  // Charger les équipes au montage du composant
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teamsData = await teamService.getAllTeams();
        // Filtrer uniquement les équipes qui ont competId et pouleId (nécessaires pour FFF)
        const teamsWithConfig = teamsData.filter(team => team.competId && team.pouleId);
        // Trier par nom pour correspondre à l'ordre de getTeamsFFFConfig
        teamsWithConfig.sort((a, b) => a.id.localeCompare(b.id));
        setTeams(teamsWithConfig);
        // Vider le cache de la config FFF pour forcer le rechargement avec toutes les équipes
        const { clearTeamsConfigCache } = await import('../services/teamConfigService');
        clearTeamsConfigCache();
      } catch (error) {
        console.error('Erreur lors de la récupération des équipes:', error);
      }
    };
    fetchTeams();
  }, []);

  // Charger les données pour toutes les équipes au premier chargement
  useEffect(() => {
    if (!initialFetchDone.current && teams.length > 0) {
      teams.forEach((_, index) => {
        const teamId = index + 1;
        fetchClassement(teamId);
        fetchMatches(teamId);
      });
      initialFetchDone.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teams.length]);

  // Afficher un chargement si les équipes ne sont pas encore chargées
  if (teams.length === 0) {
    return (
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

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
          {teams.map((team, index) => {
            const teamId = index + 1;
            return (
              <Tab 
                key={team.id} 
                label={team.name} 
                id={`team-tab-${index}`}
                aria-controls={`team-tabpanel-${index}`}
              />
            );
          })}
        </Tabs>
        <Box sx={{ px: 2 }}>
          <LoginButton />
        </Box>
      </Box>

      {teams.map((team, index) => {
        const teamId = index + 1;
        return (
        <TabPanel key={team.id} value={currentTab} index={index}>
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
              <Convocations teamId={teamId} />
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
        );
      })}
    </Box>
  );
};

export default Classement; 