import type { Message } from '$lib/types/message';
import { apiClient } from './client';

export interface RoomMessage {
	data: Message[];
	nextCursor: string | null;
	hasMore: boolean
}

export const roomService = {
	getRoomMessages: async (
		roomId: string,
		before?: string
	): Promise<RoomMessage> => {
		const queryParam = before ? `?before=${encodeURIComponent(before)}` : '';
		return apiClient.get(`/rooms/${roomId}/messages${queryParam}`);
	}
};

