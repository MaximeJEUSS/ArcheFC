import axios from 'axios';
import { Player } from '../types/player';

const API_URL = 'https://archefc-backend.onrender.com/api';

// Fonction pour obtenir le token depuis le localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Configuration d'axios pour inclure le token dans toutes les requêtes
axios.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    };
  }
  return config;
});

export const playerService = {
  async getPlayers(): Promise<Player[]> {
    const response = await axios.get<Player[]>(`${API_URL}/players`);
    return response.data;
  },

  async getAllPlayers(): Promise<Player[]> {
    const response = await axios.get<Player[]>(`${API_URL}/players/all`);
    return response.data;
  },

  async getPlayer(id: number): Promise<Player> {
    const response = await axios.get<Player>(`${API_URL}/players/${id}`);
    return response.data;
  },

  async createPlayer(player: Omit<Player, 'id'>): Promise<Player> {
    const response = await axios.post<Player>(`${API_URL}/players`, player);
    return response.data;
  },

  async updatePlayer(id: number, player: Partial<Player>): Promise<Player> {
    const response = await axios.put<Player>(`${API_URL}/players/${id}`, player);
    return response.data;
  },

  async deletePlayer(id: number): Promise<void> {
    await axios.delete(`${API_URL}/players/${id}`);
  }
}; 