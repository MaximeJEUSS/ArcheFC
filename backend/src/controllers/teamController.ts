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

export const getTeamsFFFConfig = async (req: Request, res: Response) => {
  try {
    const teams = await prisma.team.findMany({
      where: {
        competId: { not: null },
        pouleId: { not: null }
      },
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        competId: true,
        pouleId: true
      }
    });
    
    // Transformer les données pour correspondre au format attendu par le frontend
    const fffConfig = teams.map((team) => ({
      id: team.id, // identifiant technique en base
      competId: team.competId!,
      pouleId: team.pouleId!
    }));
    
    res.json(fffConfig);
  } catch (error) {
    console.error('Erreur lors de la récupération de la configuration FFF:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la configuration FFF' });
  }
}; 