import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();
const authService = new AuthService();

router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('Identifiant requis'),
    body('password').notEmpty().withMessage('Mot de passe requis')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const response = await authService.login(req.body);
      res.json(response);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
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
    body('email').isEmail().withMessage('Email invalide'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    body('firstName').notEmpty().withMessage('Prénom requis'),
    body('lastName').notEmpty().withMessage('Nom requis')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const response = await authService.register(req.body);
      res.status(201).json(response);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);

export default router; 