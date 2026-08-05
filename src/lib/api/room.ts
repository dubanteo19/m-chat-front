import type { Message } from '$lib/types/message';
import type { RoomInfo } from '$lib/types/room';
import { apiClient } from './client';

export interface RoomMessage {
	data: Message[];
	nextCursor: string | null;
	hasMore: boolean;
}
export interface CreateRoomRequest {
	name: string;
	description: string;
}
export const roomService = {
	getRoomMessages: async (roomId: string, before?: string): Promise<RoomMessage> => {
		const queryParam = before ? `?before=${encodeURIComponent(before)}` : '';
		return apiClient.get(`/rooms/${roomId}/messages${queryParam}`);
	},
	deleteMessage: async (roomId: string, messageId: number): Promise<void> => {
		return apiClient.delete(`/rooms/${roomId}/messages/${messageId}`);
	},
	createRoom: async (request: CreateRoomRequest): Promise<RoomInfo> => {
		return apiClient.post(`/rooms`, request);
	}
};
