import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const createPlayer = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, phoneNumber, goals, teamId } = req.body;
    
    // Vérification des champs obligatoires
    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'Le nom et le prénom sont obligatoires' });
    }

    // Création du joueur avec les données
    const playerData = {
      firstName,
      lastName,
      phoneNumber: phoneNumber || null,
      goals: goals || 0,
      teamId: teamId || null
    };

    const player = await prisma.player.create({
      data: playerData,
    });

    res.status(201).json(player);
  } catch (error) {
    console.error('Erreur lors de la création du joueur:', error);
    if (error instanceof Error && 'code' in error && error.code === 'P2003') {
      return res.status(400).json({ error: 'L\'équipe spécifiée n\'existe pas' });
    }
    res.status(500).json({ error: 'Erreur lors de la création du joueur' });
  }
};

export const getPlayers = async (req: Request, res: Response) => {
  try {
    const players = await prisma.player.findMany({
      orderBy: {
        lastName: 'asc'
      },
    });
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des joueurs' });
  }
};

export const getAllPlayers = async (req: Request, res: Response) => {
  try {
    const players = await prisma.player.findMany({
      orderBy: {
        lastName: 'asc'
      },
    });
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des joueurs' });
  }
};

export const getPlayer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const player = await prisma.player.findUnique({
      where: { id: parseInt(id) },
    });
    if (!player) {
      return res.status(404).json({ error: 'Joueur non trouvé' });
    }
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du joueur' });
  }
};

export const updatePlayer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phoneNumber, goals, teamId } = req.body;

    // Vérification des champs obligatoires
    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'Le nom et le prénom sont obligatoires' });
    }

    // Si teamId est fourni, vérifier que l'équipe existe
    if (teamId) {
      const team = await prisma.team.findUnique({
        where: { id: teamId }
      });
      if (!team) {
        return res.status(400).json({ error: 'L\'équipe spécifiée n\'existe pas' });
      }
    }

    const player = await prisma.player.update({
      where: { id: parseInt(id) },
      data: {
        firstName,
        lastName,
        phoneNumber: phoneNumber || null,
        goals: goals || 0,
        teamId: teamId || null
      },
    });
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du joueur' });
  }
};

export const deletePlayer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.player.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression du joueur' });
  }
}; 