import { Router, Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate.middleware';
import { LoginCredentials, RegisterCredentials } from '../types/user';

const router = Router();

router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('Identifiant requis'),
    body('password').notEmpty().withMessage('Mot de passe requis')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const credentials: LoginCredentials = req.body;
      const response = await authService.login(credentials);
      res.json(response);
    } catch (error: any) {
      res.status(401).json({ error: 'Identifiants invalides' });
    }
  }
);

router.post(
  '/register',
  [
    body('username')
      .notEmpty()
      .withMessage('Identifiant requis')
      .isLength({ min: 3 })
      .withMessage('L\'identifiant doit contenir au moins 3 caractères'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Le mot de passe doit contenir au moins 6 caractères')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const credentials: RegisterCredentials = req.body;
      const response = await authService.register(credentials);
      res.status(201).json(response);
    } catch (error: any) {
      res.status(400).json({ error: 'Erreur lors de l\'inscription' });
    }
  }
);

export default router; 