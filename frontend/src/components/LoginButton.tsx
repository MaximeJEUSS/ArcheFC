import React, { useState } from 'react';
import { 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button,
  Typography,
  Box
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/theme';

export const LoginButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { user, login, logout } = useAuth();
  const isLoggedIn = Boolean(user);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setError('');
  };

  const handleLogin = async () => {
    try {
      await login(username, password);
      handleClose();
    } catch (error) {
      setError('Identifiants incorrects');
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {!isLoggedIn ? (
        <Button
          onClick={handleClickOpen}
          startIcon={<LoginIcon />}
          variant="outlined"
          sx={{
            color: colors.archeYellow,
            borderColor: colors.archeYellow,
            transition: 'all 0.3s ease',
            transform: 'scale(1)',
            minWidth: { xs: '40px', sm: 'auto' },
            px: { xs: 1, sm: 2 },
            '& .MuiButton-startIcon': {
              margin: { xs: 0, sm: '0 8px 0 -4px' }
            },
            '&:hover': {
              borderColor: colors.archeYellow,
              backgroundColor: 'rgba(255, 215, 0, 0.1)',
              transform: 'scale(1.05)',
              boxShadow: '0 4px 8px rgba(255, 215, 0, 0.2)'
            },
            '&:active': {
              transform: 'scale(0.95)'
            }
          }}
        >
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            Se connecter
          </Box>
        </Button>
      ) : (
        <Button
          onClick={handleLogout}
          startIcon={<LogoutIcon />}
          variant="outlined"
          sx={{
            color: colors.archeYellow,
            borderColor: colors.archeYellow,
            transition: 'all 0.3s ease',
            transform: 'scale(1)',
            minWidth: { xs: '40px', sm: 'auto' },
            px: { xs: 1, sm: 2 },
            '& .MuiButton-startIcon': {
              margin: { xs: 0, sm: '0 8px 0 -4px' }
            },
            '&:hover': {
              borderColor: colors.archeYellow,
              backgroundColor: 'rgba(255, 215, 0, 0.1)',
              transform: 'scale(1.05)',
              boxShadow: '0 4px 8px rgba(255, 215, 0, 0.2)'
            },
            '&:active': {
              transform: 'scale(0.95)'
            }
          }}
        >
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            Se déconnecter
          </Box>
        </Button>
      )}

      <Dialog 
        open={open} 
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            transition: 'all 0.3s ease',
            transform: open ? 'scale(1)' : 'scale(0.9)',
            opacity: open ? 1 : 0
          }
        }}
      >
        <DialogTitle>Connexion</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom d'utilisateur"
            type="text"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Mot de passe"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <Typography color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          <Button onClick={handleLogin} variant="contained" sx={{ backgroundColor: colors.archeYellow, '&:hover': { backgroundColor: colors.archeYellow } }}>
            Se connecter
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 