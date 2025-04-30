import axios from 'axios';

const FFF_API_URL = 'https://api.fff.fr/api/v1';

export class FFFService {
  async getMatches() {
    try {
      const response = await axios.get(`${FFF_API_URL}/matches`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des matchs:', error);
      throw new Error('Impossible de récupérer les matchs');
    }
  }

  async getTeamInfo(teamId: string) {
    try {
      const response = await axios.get(`${FFF_API_URL}/teams/${teamId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des informations de l\'équipe:', error);
      throw new Error('Impossible de récupérer les informations de l\'équipe');
    }
  }

  async getTeamMatches(teamId: string) {
    try {
      const response = await axios.get(`${FFF_API_URL}/teams/${teamId}/matches`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des matchs de l\'équipe:', error);
      throw new Error('Impossible de récupérer les matchs de l\'équipe');
    }
  }

  async getCompetitionMatches(competitionId: string) {
    try {
      const response = await axios.get(`${FFF_API_URL}/competitions/${competitionId}/matches`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des matchs de la compétition:', error);
      throw new Error('Impossible de récupérer les matchs de la compétition');
    }
  }
} 