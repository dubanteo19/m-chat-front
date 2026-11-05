import { apiClient } from './client';
export const presenceService = {
	getPresence: async (peerIds: number[]): Promise<Record<number, boolean>> => {
		return apiClient.post(`/presence`, peerIds);
	},
};
