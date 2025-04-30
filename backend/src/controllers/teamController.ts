import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllTeams = async (req: Request, res: Response) => {
  try {
    const teams = await prisma.team.findMany();
    res.json(teams);
  } catch (error) {
    console.error('Erreur lors de la récupération des équipes:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des équipes' });
  }
}; 