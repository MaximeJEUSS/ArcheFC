const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const teamsData = [
  { 
    name: 'Senior A', 
    category: 'Senior', 
    competId: '436121', 
    pouleId: '4' 
  },
  { 
    name: 'Senior B', 
    category: 'Senior', 
    competId: '436122', 
    pouleId: '2' 
  },
  { 
    name: 'Senior C', 
    category: 'Senior', 
    competId: '436123', 
    pouleId: '9' 
  },
  { 
    name: 'Senior D', 
    category: 'Senior', 
    competId: '436124', 
    pouleId: '9' 
  }
];

async function seedTeams() {
  try {
    console.log('Début de l\'insertion des équipes...');
    
    // D'abord, supprimer toutes les équipes existantes
    await prisma.team.deleteMany({});
    console.log('Anciennes équipes supprimées');
    
    // Créer les nouvelles équipes
    const createdTeams = await prisma.team.createMany({
      data: teamsData
    });
    
    console.log(`${createdTeams.count} équipes créées avec succès !`);
    
    // Afficher les équipes créées
    const teams = await prisma.team.findMany();
    teams.forEach(team => {
      console.log(`- ${team.name}: competId=${team.competId}, pouleId=${team.pouleId}`);
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'insertion des équipes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTeams();
