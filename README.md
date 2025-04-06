# Arche FC Web Application

Application web pour la gestion de l'équipe de football Arche FC.

## Fonctionnalités

- Gestion des joueurs (CRUD)
- Composition d'équipe
- Générateur de posts pour les réseaux sociaux
- Actualités et photos
- Intégration avec l'API FFF
- Système d'authentification pour le staff

## Structure du projet

```
arche-fc/
├── frontend/          # Application React
├── backend/           # Serveur Node.js
└── .github/           # Configuration GitHub Actions
```

## Installation

### Prérequis

- Node.js (v18 ou supérieur)
- PostgreSQL
- npm ou yarn

### Configuration

1. Cloner le dépôt :
```bash
git clone https://github.com/MaximeJEUSS/ArcheFC.git
cd ArcheFC
```

2. Installer les dépendances :
```bash
npm install
```

3. Configurer les variables d'environnement :
```bash
# backend/.env
DATABASE_URL="postgresql://user:password@localhost:5432/archefc"
JWT_SECRET="votre_secret_jwt"
```

4. Initialiser la base de données :
```bash
cd backend
npx prisma migrate dev
```

### Démarrage

1. Démarrer le backend :
```bash
npm run start:backend
```

2. Démarrer le frontend :
```bash
npm run start:frontend
```

## Déploiement

Le frontend est déployé sur GitHub Pages, le backend sur Heroku.

### Frontend
```bash
npm run deploy:frontend
```

### Backend
```bash
npm run deploy:backend
```

## Technologies utilisées

- Frontend : React, TypeScript, Material-UI
- Backend : Node.js, Express, Prisma, PostgreSQL
- Authentification : JWT
- Déploiement : GitHub Pages, Heroku

## Licence

MIT 