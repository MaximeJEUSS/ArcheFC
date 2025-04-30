import express from 'express';
import {
  createPlayer,
  getPlayers,
  getPlayer,
  updatePlayer,
  deletePlayer,
  getAllPlayers
} from '../controllers/playerController';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Routes GET accessibles à tous
router.get('/all', getAllPlayers);
router.get('/', getPlayers);
router.get('/:id', getPlayer);

// Routes de modification protégées par authentification et droits admin
router.post('/', authenticateToken, requireAdmin, createPlayer);
router.put('/:id', authenticateToken, requireAdmin, updatePlayer);
router.delete('/:id', authenticateToken, requireAdmin, deletePlayer);

export default router; 