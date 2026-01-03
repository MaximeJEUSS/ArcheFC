import axios from 'axios';
import { getApiUrl } from '../config/api';

export interface TeamConfig {
  id: string; // identifiant technique de l'équipe en base
  competId: string;
  pouleId: string;
  category: string;
}

// Cache pour la configuration des équipes
let teamsConfigCache: TeamConfig[] | null = null;
let teamsConfigCacheTimestamp = 0;
const TEAMS_CONFIG_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Promise partagée pour éviter les appels multiples simultanés
let pendingRequest: Promise<TeamConfig[]> | null = null;

// Configuration par défaut en cas d'erreur
const DEFAULT_TEAMS_CONFIG: TeamConfig[] = [];

export async function getTeamsConfig(): Promise<TeamConfig[]> {
  const now = Date.now();
  
  // Vérifier le cache
  if (teamsConfigCache && (now - teamsConfigCacheTimestamp) < TEAMS_CONFIG_CACHE_DURATION) {
    return teamsConfigCache;
  }
  
  // Si une requête est déjà en cours, attendre cette requête au lieu d'en lancer une nouvelle
  if (pendingRequest) {
    return pendingRequest;
  }
  
  // Créer une nouvelle requête
  pendingRequest = (async () => {
    try {
      const response = await axios.get<TeamConfig[]>(getApiUrl('/teams/fff-config'));
      teamsConfigCache = response.data;
      teamsConfigCacheTimestamp = Date.now();
      return teamsConfigCache;
    } catch (error) {
      console.error('Erreur lors de la récupération de la configuration des équipes:', error);
      // Retourner la configuration par défaut en cas d'erreur
      return DEFAULT_TEAMS_CONFIG;
    } finally {
      // Réinitialiser la promise partagée une fois la requête terminée
      pendingRequest = null;
    }
  })();
  
  return pendingRequest;
}

export function clearTeamsConfigCache(): void {
  teamsConfigCache = null;
  teamsConfigCacheTimestamp = 0;
  pendingRequest = null;
}
