import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthResponse } from '../types/auth';
import { User } from '../types/user';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_super_securise';

export const authService = {
  async login(credentials: { username: string; password: string }): Promise<AuthResponse> {
    console.log('Tentative de connexion pour:', credentials.username);
    
    const user = await prisma.user.findFirst({
      where: { username: credentials.username }
    });

    if (!user) {
      console.log('Utilisateur non trouvé');
      throw new Error('Utilisateur non trouvé');
    }

    console.log('Utilisateur trouvé, vérification du mot de passe');
    const isValidPassword = await bcrypt.compare(credentials.password, user.password);
    if (!isValidPassword) {
      console.log('Mot de passe incorrect');
      throw new Error('Mot de passe incorrect');
    }

    console.log('Authentification réussie, génération du token');
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
    const { password, ...userWithoutPassword } = user;
    const formattedUser = {
      ...userWithoutPassword,
      id: userWithoutPassword.id.toString(),
      role: userWithoutPassword.role as 'ADMIN' | 'USER'
    };

    return { token, user: formattedUser };
  },

  async register(userData: { username: string; password: string; role?: 'ADMIN' | 'USER' }): Promise<AuthResponse> {
    const existingUser = await prisma.user.findFirst({
      where: { username: userData.username }
    });

    if (existingUser) {
      throw new Error('Un utilisateur avec ce nom d\'utilisateur existe déjà');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await prisma.user.create({
      data: {
        username: userData.username,
        password: hashedPassword,
        role: userData.role || 'USER'
      }
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
    const { password, ...userWithoutPassword } = user;
    const formattedUser = {
      ...userWithoutPassword,
      id: userWithoutPassword.id.toString(),
      role: userWithoutPassword.role as 'ADMIN' | 'USER'
    };

    return { token, user: formattedUser };
  },

  async verifyToken(token: string): Promise<Omit<User, 'password'>> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      const { password, ...userWithoutPassword } = user;
      return {
        ...userWithoutPassword,
        id: userWithoutPassword.id.toString(),
        role: userWithoutPassword.role as 'ADMIN' | 'USER'
      };
    } catch (error) {
      throw new Error('Token invalide');
    }
  }
}; 