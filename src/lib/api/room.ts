import type { Message } from '$lib/types/message';
import { apiClient } from './client';

export const roomService = {
	getRoomMessages: async (
		roomId: string,
		before?: string
	): Promise<{ data: Message[]; nextCursor: string | null; hasMore: boolean }> => {
		const queryParam = before ? `?before=${encodeURIComponent(before)}` : '';
		return apiClient.get(`/rooms/${roomId}/messages${queryParam}`);
	}
};

