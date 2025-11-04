import type { Room } from '../types';

const getAPIURL = () => {
  const envUrl = import.meta.env.VITE_SOCKET_URL;

  if (!envUrl) {
    return 'http://localhost:3001';
  }

  // Normalizar la URL
  return envUrl.replace(/^ws:\/\//i, 'http://').replace(/^wss:\/\//i, 'https://');
};

const API_URL = getAPIURL();

export const apiService = {
  async getRoomById(roomId: string): Promise<Room | null> {
    try {
      const response = await fetch(`${API_URL}/rooms/${roomId}`);

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.room;
    } catch (error) {
      console.error('Error fetching room:', error);
      return null;
    }
  },
};
