// Configuration des URLs de l'API selon l'environnement
export const API_CONFIG = {
  // URL de l'API backend
  BACKEND_URL: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3001/api' 
    : 'https://archefc-backend.onrender.com/api',
  
  // URL de l'API FFF (toujours la même)
  FFF_URL: 'https://api-dofa.fff.fr/api'
};

// Fonction utilitaire pour obtenir l'URL complète d'un endpoint
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BACKEND_URL}${endpoint}`;
};
