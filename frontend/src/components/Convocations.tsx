import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { playerService } from '../services/playerService';
import { teamService, Team } from '../services/teamService';
import { getTeamsConfig, TeamConfig } from '../services/teamConfigService';
import { useAuth } from '../contexts/AuthContext';
import { Player } from '../types/player';

interface ConvocationsProps {
  teamId?: string | number;
}

export const Convocations: React.FC<ConvocationsProps> = ({ teamId }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsConfig, setTeamsConfig] = useState<TeamConfig[]>([]);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState<Omit<Player, 'id'>>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    goals: 0,
    teamId: undefined
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Fonction pour obtenir l'ID technique de l'équipe (string)
  const getRealTeamId = (): string | undefined => {
    if (typeof teamId === 'string') return teamId; // déjà un id technique

    if (typeof teamId === 'number') {
      // Essai 1: via teamsConfig si présent
      if (teamsConfig.length > 0) {
        const entry = teamsConfig[teamId - 1];
        if (entry?.id) return entry.id;
      }

      // Essai 2: fallback via la liste des équipes (même index 1..n)
      if (teams.length > 0) {
        const teamEntry = teams[teamId - 1];
        if (teamEntry?.id) return teamEntry.id as unknown as string;
      }
    }

    return undefined;
  };

  const realTeamId = getRealTeamId();

  useEffect(() => {
    fetchPlayers();
    fetchAllPlayers();
    fetchTeams();
    fetchTeamsConfig();
  }, []);

  // Recalculer realTeamId quand teams ou teamsConfig changent
  useEffect(() => {
    if (teams.length > 0 && teamsConfig.length > 0) {
      fetchPlayers();
    }
  }, [teams, teamsConfig]);

  // Synchroniser le teamId du formulaire quand le realTeamId devient disponible
  useEffect(() => {
    if (open && !selectedPlayer && realTeamId) {
      setFormData(prev => ({ ...prev, teamId: realTeamId }));
    }
  }, [realTeamId, open, selectedPlayer]);

  const fetchTeamsConfig = async () => {
    try {
      const config = await getTeamsConfig();
      setTeamsConfig(config);
    } catch (error) {
      console.error('Erreur lors de la récupération de la configuration des équipes:', error);
    }
  };

  const fetchPlayers = async () => {
    try {
      const data = await playerService.getAllPlayers();
      const teamPlayers = data.filter(player => player.teamId === realTeamId);
      setPlayers(teamPlayers);
    } catch (error) {
      console.error('Erreur lors de la récupération des joueurs:', error);
    }
  };

  const fetchAllPlayers = async () => {
    try {
      const data = await playerService.getAllPlayers();
      setAllPlayers(data);
    } catch (error) {
      console.error('Erreur lors de la récupération de tous les joueurs:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const data = await teamService.getAllTeams();
      setTeams(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des équipes:', error);
    }
  };

  const handleOpen = (player?: Player) => {
    if (player) {
      setSelectedPlayer(player);
      setFormData({
        firstName: player.firstName,
        lastName: player.lastName,
        phoneNumber: player.phoneNumber,
        goals: player.goals,
        teamId: realTeamId
      });
    } else {
      setSelectedPlayer(null);
      setFormData({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        goals: 0,
        teamId: realTeamId
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPlayer(null);
    setError(null);
  };

  const handleDetailsClose = () => {
    setDetailsOpen(false);
    setSelectedPlayer(null);
  };

  const handleRowClick = (player: Player) => {
    setSelectedPlayer(player);
    setDetailsOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async () => {
    try {
      // Déterminer l'ID d'équipe à utiliser côté backend
      const finalTeamId = realTeamId; // toujours affecter à l'équipe courante (id technique)

      if (!finalTeamId) {
        setError("L'équipe n'est pas encore chargée. Réessayez dans une seconde.");
        return;
      }

      if (selectedPlayer) {
        await playerService.updatePlayer(selectedPlayer.id, { ...formData, teamId: finalTeamId });
      } else {
        await playerService.createPlayer({ ...formData, teamId: finalTeamId });
      }
      handleClose();
      fetchPlayers();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du joueur:', error);
      setError('Erreur lors de la sauvegarde du joueur');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir retirer ce joueur de l\'équipe ?')) {
      try {
        const player = players.find(p => p.id === id);
        if (player) {
          await playerService.updatePlayer(id, {
            ...player,
            teamId: undefined
          });
          fetchPlayers();
        }
      } catch (error) {
        console.error('Erreur lors du retrait du joueur:', error);
        setError('Erreur lors du retrait du joueur');
      }
    }
  };

  const handlePlayerSelect = (player: Player | null) => {
    if (player) {
      setSelectedPlayer(player);
      setFormData({
        firstName: player.firstName,
        lastName: player.lastName,
        phoneNumber: player.phoneNumber,
        goals: player.goals,
        teamId: realTeamId
      });
    }
  };

  const handleRemoveAllPlayers = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir retirer tous les joueurs de l\'équipe ?')) {
      try {
        const promises = players.map(player => 
          playerService.updatePlayer(player.id, {
            ...player,
            teamId: undefined
          })
        );
        await Promise.all(promises);
        fetchPlayers();
      } catch (error) {
        console.error('Erreur lors du retrait des joueurs:', error);
        setError('Erreur lors du retrait des joueurs');
      }
    }
  };

  const filteredPlayers = allPlayers.filter(player => 
    player.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const suggestions = (searchTerm ? filteredPlayers : allPlayers).slice(0, 20);

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              Liste des joueurs
            </Typography>
          </Box>
          {isAdmin && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                color="error"
                onClick={handleRemoveAllPlayers}
                startIcon={<DeleteIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  width: { xs: '100%', sm: 'auto' },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 99, 71, 0.1)'
                  }
                }}
              >
                Retirer tous les joueurs
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpen()}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  width: { xs: '100%', sm: 'auto' },
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #188CE8 90%)'
                  }
                }}
              >
                Ajouter un joueur
              </Button>
            </Box>
          )}
        </Box>
      </Paper>

      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: 2,
          boxShadow: 2,
          overflow: 'auto'
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell 
                sx={{ 
                  color: 'white', 
                  fontWeight: 'bold', 
                  whiteSpace: 'nowrap',
                  py: { xs: 1, sm: 2 },
                  px: { xs: 1, sm: 2 }
                }}
              >
                Nom
              </TableCell>
              <TableCell 
                sx={{ 
                  color: 'white', 
                  fontWeight: 'bold', 
                  whiteSpace: 'nowrap',
                  py: { xs: 1, sm: 2 },
                  px: { xs: 1, sm: 2 }
                }}
              >
                Prénom
              </TableCell>
              <TableCell 
                sx={{ 
                  color: 'white', 
                  fontWeight: 'bold', 
                  whiteSpace: 'nowrap',
                  py: { xs: 1, sm: 2 },
                  px: { xs: 1, sm: 2 },
                  width: { xs: '60px', sm: 'auto' }
                }}
              >
                {isAdmin ? 'Actions' : 'Infos'}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {players.map((player) => (
              <TableRow 
                key={player.id}
                hover
                onClick={() => handleRowClick(player)}
                sx={{ 
                  '&:nth-of-type(odd)': { 
                    backgroundColor: 'rgba(0, 0, 0, 0.05)'
                  },
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                <TableCell 
                  sx={{ 
                    whiteSpace: 'nowrap',
                    py: { xs: 1, sm: 2 },
                    px: { xs: 1, sm: 2 },
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  {player.lastName}
                </TableCell>
                <TableCell 
                  sx={{ 
                    whiteSpace: 'nowrap',
                    py: { xs: 1, sm: 2 },
                    px: { xs: 1, sm: 2 },
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  {player.firstName}
                </TableCell>
                <TableCell 
                  sx={{ 
                    whiteSpace: 'nowrap',
                    py: { xs: 1, sm: 2 },
                    px: { xs: 1, sm: 2 },
                    width: { xs: '60px', sm: 'auto' }
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {isAdmin && (
                      <>
                        <IconButton 
                          onClick={(e) => {
                            e.stopPropagation(); // Empêcher l'ouverture des détails
                            handleOpen(player);
                          }}
                          size="small"
                          sx={{ 
                            color: 'primary.main',
                            padding: { xs: 0.5, sm: 1 },
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.05)'
                            }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          onClick={(e) => {
                            e.stopPropagation(); // Empêcher l'ouverture des détails
                            handleDelete(player.id);
                          }}
                          size="small"
                          sx={{ 
                            color: 'error.main',
                            padding: { xs: 0.5, sm: 1 },
                            '&:hover': {
                              backgroundColor: 'rgba(255, 99, 71, 0.1)'
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 4,
            m: { xs: 2, sm: 3 }
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: 'primary.main',
          color: 'white',
          fontWeight: 'bold',
          fontSize: { xs: '1.2rem', sm: '1.5rem' }
        }}>
          {selectedPlayer ? 'Modifier le joueur' : 'Ajouter un joueur'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            label="Rechercher un joueur"
            margin="dense"
            fullWidth
            sx={{ mb: 2 }}
            value={searchTerm}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
          />
          {showSuggestions && (
            <Paper variant="outlined" sx={{ mb: 2, maxHeight: 240, overflowY: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nom</TableCell>
                    <TableCell>Prénom</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {suggestions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2}>
                        Aucun joueur trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    suggestions.map((p) => (
                      <TableRow 
                        key={`search-${p.id}`} 
                        hover 
                        sx={{ cursor: 'pointer' }}
                        onClick={() => {
                          handlePlayerSelect(p);
                          setShowSuggestions(false);
                        }}
                      >
                        <TableCell>{p.lastName}</TableCell>
                        <TableCell>{p.firstName}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Paper>
          )}
          <Chip
            label={`Équipe: ${(() => {
              if (typeof teamId === 'number' && teamsConfig.length > 0) {
                const entry = teamsConfig[teamId - 1];
                if (entry) {
                  const team = teams.find(t => t.id === entry.id);
                  return team?.name || `Équipe ${teamId}`;
                }
              } else if (typeof teamId === 'string') {
                const team = teams.find(t => t.id === teamId);
                return team?.name || 'Inconnue';
              }
              return 'Chargement...';
            })()}`}
            color="primary"
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            autoFocus
            margin="dense"
            name="firstName"
            label="Prénom"
            type="text"
            fullWidth
            value={formData.firstName}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="lastName"
            label="Nom"
            type="text"
            fullWidth
            value={formData.lastName}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="phoneNumber"
            label="Téléphone"
            type="text"
            fullWidth
            value={formData.phoneNumber}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="goals"
            label="Buts"
            type="number"
            fullWidth
            value={formData.goals}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
          <Button 
            onClick={handleClose}
            fullWidth
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              order: { xs: 2, sm: 1 }
            }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            fullWidth
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              order: { xs: 1, sm: 2 },
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #188CE8 90%)'
              }
            }}
          >
            {selectedPlayer ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Popup de détails du joueur */}
      <Dialog 
        open={detailsOpen} 
        onClose={handleDetailsClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 4,
            m: { xs: 2, sm: 3 }
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: 'primary.main',
          color: 'white',
          fontWeight: 'bold',
          fontSize: { xs: '1.2rem', sm: '1.5rem' }
        }}>
          Détails du joueur
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedPlayer && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* En-tête avec nom et statistiques */}
              <Box sx={{ 
                textAlign: 'center', 
                pb: 2, 
                borderBottom: '1px solid rgba(0,0,0,0.1)' 
              }}>
                <Typography variant="h4" sx={{ 
                  fontWeight: 'bold', 
                  color: 'primary.main',
                  mb: 1,
                  fontSize: { xs: '1.5rem', sm: '2rem' }
                }}>
                  {selectedPlayer.firstName} {selectedPlayer.lastName}
                </Typography>
                <Chip 
                  label={`${selectedPlayer.goals} but${selectedPlayer.goals > 1 ? 's' : ''}`}
                  color="primary"
                  sx={{ 
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    px: 2,
                    py: 1
                  }}
                />
              </Box>
              
              {/* Informations détaillées */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Téléphone */}
                {selectedPlayer.phoneNumber && (
                  <Paper sx={{ 
                    p: 2, 
                    backgroundColor: 'rgba(33, 150, 243, 0.05)',
                    border: '1px solid rgba(33, 150, 243, 0.2)',
                    borderRadius: 2
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '50%', 
                        backgroundColor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
                          📞
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Téléphone
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {selectedPlayer.phoneNumber}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                )}
                
                {/* Équipe */}
                <Paper sx={{ 
                  p: 2, 
                  backgroundColor: 'rgba(76, 175, 80, 0.05)',
                  border: '1px solid rgba(76, 175, 80, 0.2)',
                  borderRadius: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      backgroundColor: 'success.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
                        ⚽
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Équipe
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {(() => {
                          if (typeof teamId === 'number' && teamsConfig.length > 0) {
                            const entry = teamsConfig[teamId - 1];
                            if (entry) {
                              const team = teams.find(t => t.id === entry.id);
                              return team?.name || `Équipe ${teamId}`;
                            }
                          } else if (typeof teamId === 'string') {
                            const team = teams.find(t => t.id === teamId);
                            return team?.name || 'Inconnue';
                          }
                          return 'Chargement...';
                        })()}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          {isAdmin && selectedPlayer && (
            <Button 
              onClick={() => {
                handleDetailsClose();
                handleOpen(selectedPlayer);
              }}
              variant="contained"
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #188CE8 90%)'
                }
              }}
            >
              Modifier
            </Button>
          )}
          <Button 
            onClick={handleDetailsClose}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none'
            }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 