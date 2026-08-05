import type { RoomInfo } from '$lib/types/room';
import type { TitleStyle, UserInfo } from '$lib/types/user';
import { apiClient } from './client';
export interface PushSubscriptionRequest {
	endpoint: string;
	keys: {
		p256dh: string;
		auth: string;
	};
}

export interface UpdateUserProfileRequest {
	displayName: string;
	title: string;
	avatarUrl: string | null;
	titleStyle: TitleStyle;
}

export const userService = {
	getRooms: async (): Promise<RoomInfo[]> => {
		return apiClient.get(`/users/rooms`);
	},
	getUserProfile: async (username: string): Promise<UserInfo> => {
		return apiClient.get(`/users/${username}/profile`);
	},
	updateUserProfile: async (
		body: UpdateUserProfileRequest
	): Promise<UserInfo> => {
		return apiClient.put(`/users/profile`, body);
	},
	savePushSubscription: async (
		subscription: PushSubscriptionRequest
	): Promise<void> => {
		return apiClient.put(`/users/push-subscription`, subscription);
	}
};
