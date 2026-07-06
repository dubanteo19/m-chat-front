import type { Message } from '$lib/types/message';
import { apiClient } from './client';

export interface RoomMessage {
	data: Message[];
	nextCursor: string | null;
	hasMore: boolean
}
export interface CreateRoomRequest {
	name: string;
	description: string;
	roomMasterUsername: string;
}
export const roomService = {
	getRoomMessages: async (
		roomId: string,
		before?: string
	): Promise<RoomMessage> => {
		const queryParam = before ? `?before=${encodeURIComponent(before)}` : '';
		return apiClient.get(`/rooms/${roomId}/messages${queryParam}`);
	},

	createRoom: async (
		request: CreateRoomRequest
	): Promise<RoomMessage> => {
		return apiClient.post(`/rooms`, request);
	}
};

