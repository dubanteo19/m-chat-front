
import { apiClient } from './client';

export const roomMemberService = {
    addMember: async (roomId: string, username: string): Promise<void> => {
        return apiClient.post(`/rooms/${roomId}/members`, { username });
    },
    kickMember: async (roomId: string, username: string): Promise<void> => {
        return apiClient.delete(`/rooms/${roomId}/members/${username}`);
    }
};
