import React from 'react';
import { ThemeProvider, CssBaseline, Container, Box } from '@mui/material';
import { theme } from './theme/theme';
import Header from './components/Header';
import Classement from './components/Classement';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: 'background.default',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Header />
        <Container maxWidth="lg" sx={{ pt: 4, pb: 4, flex: 1 }}>
          <Classement />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App; 