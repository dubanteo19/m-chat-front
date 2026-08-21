import type { Message } from '$lib/types/message';
import type { RoomInfo, RoomMemberInfo } from '$lib/types/room';
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
	getRoomMembers: async (roomId: string): Promise<RoomMemberInfo[]> => {
		return apiClient.get(`/rooms/${roomId}/members`);
	},
	getRoomInfo: async (roomId: string): Promise<RoomInfo> => {
		return apiClient.get(`/rooms/${roomId}`);
	},
	createRoom: async (request: CreateRoomRequest): Promise<RoomInfo> => {
		return apiClient.post(`/rooms`, request);
	},
	deleteRoom: async (roomId: string): Promise<boolean> => {
		return apiClient.delete(`/rooms/${roomId}`);
	}
};
