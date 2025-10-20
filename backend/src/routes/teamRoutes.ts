import express from 'express';
import { getAllTeams, getTeamsFFFConfig } from '../controllers/teamController';

const router = express.Router();

router.get('/', getAllTeams);
router.get('/fff-config', getTeamsFFFConfig);

export default router; 