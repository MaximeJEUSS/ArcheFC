import axios from 'axios';
import { Player } from '../types/player';
import { getApiUrl } from '../config/api';

// Pas d'interceptor global - l'authentification sera gérée au cas par cas

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const playerService = {
  async getPlayers(): Promise<Player[]> {
    const response = await axios.get<Player[]>(getApiUrl('/players'));
    return response.data;
  },

  async getAllPlayers(): Promise<Player[]> {
    const response = await axios.get<Player[]>(getApiUrl('/players/all'));
    return response.data;
  },

  async getPlayer(id: number): Promise<Player> {
    const response = await axios.get<Player>(getApiUrl(`/players/${id}`));
    return response.data;
  },

  async createPlayer(player: Omit<Player, 'id'>): Promise<Player> {
    const response = await axios.post<Player>(getApiUrl('/players'), player, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  async updatePlayer(id: number, player: Partial<Player>): Promise<Player> {
    const response = await axios.put<Player>(getApiUrl(`/players/${id}`), player, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  async deletePlayer(id: number): Promise<void> {
    await axios.delete(getApiUrl(`/players/${id}`), {
      headers: getAuthHeaders()
    });
  }
}; 