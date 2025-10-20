const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAdmin() {
  try {
    console.log('Réinitialisation de l\'utilisateur admin...');
    
    // Supprimer l'ancien utilisateur admin s'il existe
    await prisma.user.deleteMany({
      where: {
        username: 'admin'
      }
    });
    
    // Créer un nouvel utilisateur admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await prisma.user.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    
    console.log('Utilisateur admin créé avec succès !');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Role: ADMIN');
    console.log('ID:', adminUser.id);
    
  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdmin();
