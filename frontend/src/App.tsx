import React from 'react';
import { ThemeProvider, CssBaseline, Container, Box } from '@mui/material';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { theme } from './theme/theme';
import Header from './components/Header';
import Classement from './components/Classement';
import PlayerManagement from './components/PlayerManagement';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { Convocations } from './components/Convocations';

function App() {
  return (
    <HashRouter>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <CssBaseline />
          <Box sx={{ 
            minHeight: '100vh', 
            backgroundColor: 'background.default',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Header />
            <Container maxWidth="lg" sx={{ pt: 4, pb: 4, flex: 1 }}>
              <Routes>
                <Route path="/" element={<Classement />} />
                <Route path="/team/:teamId" element={<Classement />} />
                <Route path="/team/:teamId/:subTab" element={<Classement />} />
                <Route path="/convocations" element={<Convocations />} />
                <Route path="/admin/players" element={
                  <ProtectedRoute>
                    <PlayerManagement />
                  </ProtectedRoute>
                } />
              </Routes>
            </Container>
          </Box>
        </AuthProvider>
      </ThemeProvider>
    </HashRouter>
  );
}

export default App; 