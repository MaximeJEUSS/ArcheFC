import { PrismaClient, User } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { LoginCredentials, RegisterCredentials, AuthResponse } from '../types/user';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { username: credentials.username }
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const isValid = await compare(credentials.password, user.password);
    if (!isValid) {
      throw new Error('Mot de passe incorrect');
    }

    const token = sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '24h'
    });

    const { password, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: credentials.username },
          { email: credentials.email }
        ]
      }
    });

    if (existingUser) {
      throw new Error('Un utilisateur avec cet identifiant ou cet email existe déjà');
    }

    const hashedPassword = await hash(credentials.password, 10);
    const user = await prisma.user.create({
      data: {
        ...credentials,
        password: hashedPassword,
        role: credentials.role || 'USER'
      }
    });

    const token = sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '24h'
    });

    const { password, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }

  async verifyToken(token: string): Promise<User> {
    try {
      const decoded = verify(token, JWT_SECRET) as { userId: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      return user;
    } catch (error) {
      throw new Error('Token invalide');
    }
  }
} 