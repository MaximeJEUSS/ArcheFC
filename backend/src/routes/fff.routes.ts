import { Router } from 'express';
import { FFFService } from '../services/fff.service';

const router = Router();
const fffService = new FFFService();

router.get('/matches', async (req, res) => {
  try {
    const matches = await fffService.getMatches();
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Une erreur est survenue' });
  }
});

router.get('/teams/:teamId', async (req, res) => {
  try {
    const teamInfo = await fffService.getTeamInfo(req.params.teamId);
    res.json(teamInfo);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Une erreur est survenue' });
  }
});

router.get('/teams/:teamId/matches', async (req, res) => {
  try {
    const matches = await fffService.getTeamMatches(req.params.teamId);
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Une erreur est survenue' });
  }
});

router.get('/competitions/:competitionId/matches', async (req, res) => {
  try {
    const matches = await fffService.getCompetitionMatches(req.params.competitionId);
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Une erreur est survenue' });
  }
});

export default router; 