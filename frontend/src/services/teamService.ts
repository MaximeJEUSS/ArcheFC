import axios from 'axios';
import { getApiUrl } from '../config/api';

export interface Team {
  id: string;
  name: string;
  category: string;
  competId?: string;
  pouleId?: string;
}

export const teamService = {
  async getAllTeams(): Promise<Team[]> {
    const response = await axios.get<Team[]>(getApiUrl('/teams'));
    return response.data;
  },

  async getTeam(id: string): Promise<Team> {
    const response = await axios.get<Team>(getApiUrl(`/teams/${id}`));
    return response.data;
  },

  async createTeam(team: Omit<Team, 'id'>): Promise<Team> {
    const response = await axios.post<Team>(getApiUrl('/teams'), team);
    return response.data;
  },

  async updateTeam(id: string, team: Partial<Team>): Promise<Team> {
    const response = await axios.put<Team>(getApiUrl(`/teams/${id}`), team);
    return response.data;
  },

  async deleteTeam(id: string): Promise<void> {
    await axios.delete(getApiUrl(`/teams/${id}`));
  }
};
