import express from 'express';
import { getAllTeams } from '../controllers/teamController';

const router = express.Router();

router.get('/', getAllTeams);

export default router; 