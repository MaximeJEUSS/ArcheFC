import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';

interface Match {
  id: string;
  competition: {
    name: string;
    cp_no: number;
  };
  home: {
    short_name: string;
    club: {
      cl_no: number;
      logo: string;
    };
  };
  away: {
    short_name: string;
    club: {
      cl_no: number;
      logo: string;
    };
  };
  date: string;
  time: string;
  home_score: number;
  away_score: number;
  status: string;
}

const FFFResults: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch('/api/fff/matches');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des matchs');
        }
        const data = await response.json();
        setMatches(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

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

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Résultats des matchs FFF
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {matches.map((match) => (
          <Paper key={match.id} elevation={3} sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="subtitle1">{match.competition.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(match.date).toLocaleDateString('fr-FR')} {match.time}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="h6">{match.home.short_name}</Typography>
                <Typography variant="h6" color="primary">
                  {match.home_score} - {match.away_score}
                </Typography>
                <Typography variant="h6">{match.away.short_name}</Typography>
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default FFFResults; 