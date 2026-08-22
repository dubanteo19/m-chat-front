import type {
	Message,
	MessagePayload,
	MessageReactPayload,
	ReactionInfo
} from '$lib/types/message';
import { apiClient } from './client';

export interface RoomMessage {
	data: Message[];
	nextCursor: string | null;
	hasMore: boolean;
}
export const messageService = {
	getRoomMessages: async (roomId: string, before?: string): Promise<RoomMessage> => {
		const queryParam = before ? `?before=${encodeURIComponent(before)}` : '';
		return apiClient.get(`/rooms/${roomId}/messages${queryParam}`);
	},
	sendMessage: async (roomId: string, payload: MessagePayload): Promise<Message> => {
		return apiClient.post(`/rooms/${roomId}/messages`, payload);
	},
	sendReact: async (roomId: string, payload: MessageReactPayload): Promise<ReactionInfo> => {
		return apiClient.post(`/rooms/${roomId}/messages/reactions`, payload);
	},
	deleteMessage: async (roomId: string, messageId: number): Promise<void> => {
		return apiClient.delete(`/rooms/${roomId}/messages/${messageId}`);
	}
};
