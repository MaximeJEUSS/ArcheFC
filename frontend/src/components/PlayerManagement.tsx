import React, { useState, useEffect } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { colors } from '../theme/theme';

interface Player {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  goals: number;
}

const PlayerManagement: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    goals: 0,
  });
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/players', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Erreur lors de la récupération des joueurs');
      const data = await response.json();
      setPlayers(data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erreur lors de la récupération des joueurs',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (player?: Player) => {
    if (player) {
      setSelectedPlayer(player);
      setFormData({
        firstName: player.firstName,
        lastName: player.lastName,
        phoneNumber: player.phoneNumber,
        goals: player.goals,
      });
    } else {
      setSelectedPlayer(null);
      setFormData({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        goals: 0,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPlayer(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = selectedPlayer
        ? `http://localhost:3001/api/players/${selectedPlayer.id}`
        : 'http://localhost:3001/api/players';
      
      const response = await fetch(url, {
        method: selectedPlayer ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Erreur lors de la sauvegarde');

      setSnackbar({
        open: true,
        message: selectedPlayer ? 'Joueur mis à jour' : 'Joueur ajouté',
        severity: 'success',
      });
      handleCloseDialog();
      fetchPlayers();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erreur lors de la sauvegarde',
        severity: 'error',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce joueur ?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/players/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression');

      setSnackbar({
        open: true,
        message: 'Joueur supprimé',
        severity: 'success',
      });
      fetchPlayers();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erreur lors de la suppression',
        severity: 'error',
      });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ color: colors.archeBlue }}>
          Gestion des Joueurs
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            background: colors.archeGradient,
            color: 'white',
            '&:hover': {
              filter: 'brightness(0.9)',
            },
          }}
        >
          Ajouter un joueur
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: colors.archeGradient }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nom</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Prénom</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Téléphone</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Buts</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {players.map((player) => (
              <TableRow key={player.id} hover>
                <TableCell>{player.lastName}</TableCell>
                <TableCell>{player.firstName}</TableCell>
                <TableCell>{player.phoneNumber}</TableCell>
                <TableCell>{player.goals}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpenDialog(player)}
                    sx={{ color: colors.archeBlue }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(player.id)}
                    sx={{ color: colors.archeRed }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedPlayer ? 'Modifier le joueur' : 'Ajouter un joueur'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Prénom"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Nom"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Téléphone"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Buts"
                type="number"
                value={formData.goals}
                onChange={(e) => setFormData({ ...formData, goals: parseInt(e.target.value) })}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Annuler</Button>
            <Button type="submit" variant="contained" sx={{ background: colors.archeGradient }}>
              {selectedPlayer ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PlayerManagement; 