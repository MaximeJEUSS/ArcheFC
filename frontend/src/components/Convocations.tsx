import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Autocomplete,
  Alert,
  Card,
  CardContent,
  Grid,
  useTheme,
  alpha
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Group as GroupIcon, Info as InfoIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { playerService } from '../services/playerService';
import { Player } from '../types/player';

interface ConvocationsProps {
  teamId?: string;
}

export const Convocations: React.FC<ConvocationsProps> = ({ teamId }) => {
  const theme = useTheme();
  const [players, setPlayers] = useState<Player[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState<Omit<Player, 'id'>>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    goals: 0,
    teamId: teamId ? `team${teamId}` : undefined
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetchPlayers();
    fetchAllPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const data = await playerService.getAllPlayers();
      const teamPlayers = data.filter(player => player.teamId === `team${teamId}`);
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

  const handleOpen = (player?: Player) => {
    if (player) {
      setSelectedPlayer(player);
      setFormData({
        firstName: player.firstName,
        lastName: player.lastName,
        phoneNumber: player.phoneNumber,
        goals: player.goals,
        teamId: player.teamId
      });
    } else {
      setSelectedPlayer(null);
      setFormData({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        goals: 0,
        teamId: teamId ? `team${teamId}` : undefined
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPlayer(null);
    setError(null);
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
      if (selectedPlayer) {
        await playerService.updatePlayer(selectedPlayer.id, formData);
      } else {
        await playerService.createPlayer(formData);
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
        teamId: teamId ? `team${teamId}` : undefined
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

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: theme.shadows[2] }}>
        <CardContent>
          <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
            <Grid item xs={12} sm="auto">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GroupIcon color="primary" />
                <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                  Liste des joueurs
                </Typography>
              </Box>
            </Grid>
            {isAdmin && (
              <Grid item xs={12} sm="auto">
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2,
                  flexDirection: { xs: 'column', sm: 'row' },
                  width: { xs: '100%', sm: 'auto' }
                }}>
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
                        backgroundColor: alpha(theme.palette.error.main, 0.1)
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
                      background: theme.palette.primary.main,
                      '&:hover': {
                        background: theme.palette.primary.dark
                      }
                    }}
                  >
                    Ajouter un joueur
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: 2,
          boxShadow: theme.shadows[2],
          overflow: 'auto'
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
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
                sx={{ 
                  '&:nth-of-type(odd)': { 
                    backgroundColor: alpha(theme.palette.primary.main, 0.05)
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
                    <IconButton
                      onClick={() => {
                        setSelectedPlayer(player);
                        setFormData({
                          firstName: player.firstName,
                          lastName: player.lastName,
                          phoneNumber: player.phoneNumber,
                          goals: player.goals,
                          teamId: player.teamId
                        });
                        setOpen(true);
                      }}
                      size="small"
                      sx={{
                        color: theme.palette.primary.main,
                        padding: { xs: 0.5, sm: 1 },
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1)
                        }
                      }}
                    >
                      <InfoIcon fontSize="small" />
                    </IconButton>
                    {isAdmin && (
                      <>
                        <IconButton 
                          onClick={() => handleOpen(player)}
                          size="small"
                          sx={{ 
                            color: theme.palette.primary.main,
                            padding: { xs: 0.5, sm: 1 },
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.1)
                            }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleDelete(player.id)}
                          size="small"
                          sx={{ 
                            color: theme.palette.error.main,
                            padding: { xs: 0.5, sm: 1 },
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.error.main, 0.1)
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
            boxShadow: theme.shadows[4],
            m: { xs: 2, sm: 3 }
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          fontWeight: 'bold',
          fontSize: { xs: '1.2rem', sm: '1.5rem' }
        }}>
          {selectedPlayer ? 'Modifier le joueur' : 'Ajouter un joueur'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Autocomplete
            options={filteredPlayers}
            getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
            value={selectedPlayer}
            onChange={(_, newValue) => handlePlayerSelect(newValue)}
            onInputChange={(_, newInputValue) => setSearchTerm(newInputValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Rechercher un joueur"
                margin="dense"
                fullWidth
                sx={{ mb: 2 }}
              />
            )}
          />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
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
            </Grid>
            <Grid item xs={12} sm={6}>
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
            </Grid>
            <Grid item xs={12} sm={6}>
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
            </Grid>
            <Grid item xs={12} sm={6}>
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
            </Grid>
          </Grid>
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
              background: theme.palette.primary.main,
              order: { xs: 1, sm: 2 },
              '&:hover': {
                background: theme.palette.primary.dark
              }
            }}
          >
            {selectedPlayer ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 