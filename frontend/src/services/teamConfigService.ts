import axios from 'axios';
import { getApiUrl } from '../config/api';

export interface TeamConfig {
  id: string; // identifiant technique de l'équipe en base
  competId: string;
  pouleId: string;
}

// Cache pour la configuration des équipes
let teamsConfigCache: TeamConfig[] | null = null;
let teamsConfigCacheTimestamp = 0;
const TEAMS_CONFIG_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Configuration par défaut en cas d'erreur
const DEFAULT_TEAMS_CONFIG: TeamConfig[] = [];

export async function getTeamsConfig(): Promise<TeamConfig[]> {
  const now = Date.now();
  
  // Vérifier le cache
  if (teamsConfigCache && (now - teamsConfigCacheTimestamp) < TEAMS_CONFIG_CACHE_DURATION) {
    return teamsConfigCache;
  }
  
  try {
    const response = await axios.get<TeamConfig[]>(getApiUrl('/teams/fff-config'));
    teamsConfigCache = response.data;
    teamsConfigCacheTimestamp = now;
    return teamsConfigCache;
  } catch (error) {
    console.error('Erreur lors de la récupération de la configuration des équipes:', error);
    // Retourner la configuration par défaut en cas d'erreur
    return DEFAULT_TEAMS_CONFIG;
  }
}

export function clearTeamsConfigCache(): void {
  teamsConfigCache = null;
  teamsConfigCacheTimestamp = 0;
}
