import axios from 'axios';
import axiosRetry from 'axios-retry';
import { getTeamsConfig } from './teamConfigService';

const API_URL = 'https://api-dofa.fff.fr/api';
const MAX_CONCURRENT_REQUESTS = 2; // Nombre maximum de requêtes simultanées
const REQUEST_DELAY = 5000; // Délai entre les requêtes en ms
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes en millisecondes

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

class APICache {
  private static instance: APICache;
  private cache: Map<string, CacheItem<any>> = new Map();

  private constructor() {}

  static getInstance(): APICache {
    if (!APICache.instance) {
      APICache.instance = new APICache();
    }
    return APICache.instance;
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

const cache = APICache.getInstance();

class RequestQueue {
  private queue: (() => Promise<any>)[] = [];
  private activeRequests = 0;

  async enqueue<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const executeRequest = async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.activeRequests--;
          this.processQueue();
        }
      };

      this.queue.push(executeRequest);
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.activeRequests >= MAX_CONCURRENT_REQUESTS || this.queue.length === 0) {
      return;
    }

    this.activeRequests++;
    const request = this.queue.shift();
    if (request) {
      await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY));
      request();
    }
  }
}

const requestQueue = new RequestQueue();

export interface Match {
  id: string;
  competition: {
    name: string;
    cp_no: number;
  };
  home: {
    short_name: string;
    club: {
      cl_no: number;
      logo: string;
    };
  };
  away: {
    short_name: string;
    club: {
      cl_no: number;
      logo: string;
    };
  };
  date: string;
  time: string;
  home_score: number;
  away_score: number;
  status: string;
  home_resu: string;
  away_resu: string;
  poule_journee?: {
    number: string;
  };
}

export interface MatchesResponse {
  'hydra:member': Match[];
  'hydra:totalItems': number;
  'hydra:view': {
    '@id': string;
    '@type': string;
    'hydra:first': string;
    'hydra:last': string;
    'hydra:next'?: string;
  };
}

export interface Team {
  id: string;
  name: string;
  logo?: string;
  division: string;
  club?: {
    id: number;
    name: string;
    category?: string;
    address?: string;
    phone?: string;
    website?: string;
  };
}

export interface ClassementEquipe {
  rank: number;
  equipe: {
    short_name: string;
    club: {
      cl_no: number;
    };
  };
  point_count: number;
  won_games_count: number;
  draw_games_count: number;
  lost_games_count: number;
  goals_for_count: number;
  goals_against_count: number;
  goals_diff: number;
  total_games_count: number;
}

interface ClassementResponse {
  'hydra:member': ClassementEquipe[];
}

export interface MatchResult {
  id: string;
  competition: {
    name: string;
    cp_no: number;
  };
  home: {
    short_name: string;
  };
  away: {
    short_name: string;
  };
  home_score: number;
  away_score: number;
  date: string;
}

export interface MatchResultsResponse {
  'hydra:member': MatchResult[];
}

export interface NextMatch {
  id: string;
  competition: {
    name: string;
    cp_no: number;
  };
  home: {
    short_name: string;
  };
  away: {
    short_name: string;
  };
  date: string;
}

export interface NextMatchesResponse {
  'hydra:member': NextMatch[];
}



// Configuration de axios avec retry
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configuration du retry
axiosRetry(axiosInstance, { 
  retries: 3, // Nombre de tentatives
  retryDelay: (retryCount) => {
    return retryCount * 2000; // 2 secondes entre chaque tentative
  },
  retryCondition: (error) => {
    // On retry sur les erreurs 5xx et les erreurs réseau
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
           (error.response?.status && error.response.status >= 500) || false;
  }
});

export const fffService = {
  async getMatches(): Promise<Match[]> {
    const response = await axiosInstance.get<Match[]>(`/matches`);
    return response.data;
  },

  async getTeamInfo(teamId: string): Promise<Team> {
    try {
      const response = await axiosInstance.get<Team>(`/teams/${teamId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des informations de l\'équipe:', error);
      throw error;
    }
  },

  async getTeamMatches(teamId: string): Promise<Match[]> {
    const response = await axiosInstance.get<Match[]>(`/teams/${teamId}/matches`);
    return response.data;
  },

  async getCompetitionMatches(competId: string, pouleId: string, category?: string): Promise<Match[]> {
    const phase = category && category.toLowerCase() === 'jeune' ? 2 : 1;
    const cacheKey = `competition_matches_${competId}_${pouleId}_${phase}`;
    const cachedData = cache.get<Match[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      let allMatches: Match[] = [];
      let currentPage = 1;
      let hasNextPage = true;

      while (hasNextPage) {
        const response = await axiosInstance.get<MatchesResponse>(
          `/compets/${competId}/phases/${phase}/poules/${pouleId}/matchs?page=${currentPage}`,
          {
            timeout: 100000
          }
        );

        const matches = response.data['hydra:member'].map(match => ({
          ...match,
          home_score: match.home_score || 0,
          away_score: match.away_score || 0,
          status: match.status || 'A'
        }));

        allMatches = [...allMatches, ...matches];
        
        if (!response.data['hydra:view'] || !response.data['hydra:view']['hydra:next']) {
          hasNextPage = false;
        } else {
          currentPage++;
        }
      }

      cache.set(cacheKey, allMatches);
      return allMatches;
    } catch (error) {
      console.error(`Erreur lors de la récupération des matchs de la compétition ${competId}:`, error);
      throw error;
    }
  },

  async getTeamClassement(teamId: number): Promise<ClassementEquipe[]> {
    const teamsConfig = await getTeamsConfig();
    // id est un string; utiliser l'index (1..n)
    const teamConfig = teamsConfig[teamId - 1];
    if (!teamConfig) {
      throw new Error(`Configuration non trouvée pour l'équipe ${teamId}`);
    }

    const phase = teamConfig.category && teamConfig.category.toLowerCase() === 'jeune' ? 2 : 1;
    const cacheKey = `classement_${teamId}_${phase}`;
    const cachedData = cache.get<ClassementEquipe[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await axiosInstance.get<ClassementResponse>(
        `/compets/${teamConfig.competId}/phases/${phase}/poules/${teamConfig.pouleId}/classement_journees?page=1`,
        {
          timeout: 10000
        }
      );
      const data = response.data['hydra:member'];
      cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du classement de l'équipe ${teamId}:`, error);
      throw error;
    }
  },

  async getAllTeamsClassement(): Promise<{ [key: number]: ClassementEquipe[] }> {
    const classements: { [key: number]: ClassementEquipe[] } = {};
    const teamsConfig = await getTeamsConfig();
    
    // Initialiser tous les classements comme vides (index 1..n)
    teamsConfig.forEach((_, index) => {
      const numericTeamId = index + 1;
      classements[numericTeamId] = [];
    });

    try {
      const promises = teamsConfig.map(async (_, index) => {
        const numericTeamId = index + 1;
        try {
          const classement = await this.getTeamClassement(numericTeamId);
          return { teamId: numericTeamId, classement };
        } catch (error) {
          console.error(`Erreur lors de la récupération du classement de l'équipe ${numericTeamId}:`, error);
          return { teamId: numericTeamId, classement: [] };
        }
      });

      const results = await Promise.allSettled(promises);
      
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const { teamId, classement } = result.value;
          classements[teamId] = classement;
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des classements:', error);
    }

    return classements;
  },

  async getClubInfo(clubId: number): Promise<any> {
    const cacheKey = `club_info_${clubId}`;
    const cachedData = cache.get<any>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await axiosInstance.get(
        `/clubs/${clubId}`,
        {
          timeout: 10000
        }
      );
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des informations du club ${clubId}:`, error);
      throw error;
    }
  },

  async getClubResults(clubId: number): Promise<MatchResultsResponse> {
    const cacheKey = `club_results_${clubId}`;
    const cachedData = cache.get<MatchResultsResponse>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await axiosInstance.get<MatchResultsResponse>(
        `/clubs/${clubId}/resultat?page=1`,
        {
          timeout: 10000
        }
      );
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des résultats du club ${clubId}:`, error);
      throw error;
    }
  },

  async getClubCalendar(clubId: number): Promise<NextMatchesResponse> {
    const cacheKey = `club_calendar_${clubId}`;
    const cachedData = cache.get<NextMatchesResponse>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await axiosInstance.get<NextMatchesResponse>(
        `/clubs/${clubId}/calendrier?page=1`,
        {
          timeout: 10000
        }
      );
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du calendrier du club ${clubId}:`, error);
      throw error;
    }
  },

  async getTeamDetails(teamId: number): Promise<{
    clubInfo: any;
    results: any;
    calendar: any;
  }> {
    const teamsConfig = await getTeamsConfig();
    const teamConfig = teamsConfig[teamId - 1];
    if (!teamConfig) {
      throw new Error(`Configuration non trouvée pour l'équipe ${teamId}`);
    }

    const classement = await this.getTeamClassement(teamId);
    if (!classement || classement.length === 0) {
      throw new Error(`Aucun classement trouvé pour l'équipe ${teamId}`);
    }

    const clubId = classement[0].equipe.club.cl_no;
    
    const [clubInfo, results, calendar] = await Promise.all([
      this.getClubInfo(clubId),
      this.getClubResults(clubId),
      this.getClubCalendar(clubId)
    ]);

    return {
      clubInfo,
      results,
      calendar
    };
  },

  clearCache(): void {
    cache.clear();
  }
}; 