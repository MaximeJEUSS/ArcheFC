import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // Créer les équipes avec competId et pouleId
  const teams = [
    { 
      name: 'Senior A', 
      category: 'SENIOR', 
      competId: '436121', 
      pouleId: '4' 
    },
    { 
      name: 'Senior B', 
      category: 'SENIOR', 
      competId: '436122', 
      pouleId: '2' 
    },
    { 
      name: 'Senior C', 
      category: 'SENIOR', 
      competId: '436123', 
      pouleId: '9' 
    },
    { 
      name: 'Senior D', 
      category: 'SENIOR', 
      competId: '436124', 
      pouleId: '9' 
    }
  ];

  // Supprimer les équipes existantes
  await prisma.team.deleteMany({});
  console.log('🗑️ Anciennes équipes supprimées');

  // Créer les nouvelles équipes
  for (const teamData of teams) {
    const team = await prisma.team.create({
      data: teamData
    });
    console.log(`✅ Équipe créée: ${team.name} (ID: ${team.id})`);
  }

  // Créer un utilisateur admin par défaut
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  // Supprimer les utilisateurs existants
  await prisma.user.deleteMany({});
  console.log('🗑️ Anciens utilisateurs supprimés');

  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });
  console.log(`✅ Admin créé: ${admin.username}`);

  // Créer quelques joueurs de test
  const players = [
    {
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '0612345678',
      goals: 5,
      teamId: teams[0].name // Senior A
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '0623456789',
      goals: 3,
      teamId: teams[1].name // Senior B
    }
  ];

  // Supprimer les joueurs existants
  await prisma.player.deleteMany({});
  console.log('🗑️ Anciens joueurs supprimés');

  for (const playerData of players) {
    const team = await prisma.team.findFirst({
      where: { name: playerData.teamId }
    });
    
    if (team) {
      const player = await prisma.player.create({
        data: {
          firstName: playerData.firstName,
          lastName: playerData.lastName,
          phoneNumber: playerData.phoneNumber,
          goals: playerData.goals,
          teamId: team.id
        }
      });
      console.log(`✅ Joueur créé: ${player.firstName} ${player.lastName}`);
    }
  }

  console.log('🎉 Seeding terminé avec succès!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
