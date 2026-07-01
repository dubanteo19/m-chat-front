import type { TitleStyle, UserInfo } from '$lib/types/message';
import { apiClient } from './client';

export interface UpdateUserProfileRequest {
	displayName: string;
	title: string;
	avatarUrl: string | null;
	titleStyle: TitleStyle;
}


export const userService = {
	getUserProfile: async (
		username: string,
	): Promise<UserInfo> => {
		return apiClient.get(`/users/${username}/profile`);
	},
	updateUserProfile: async (
		username: string,
		body: UpdateUserProfileRequest
	): Promise<UserInfo> => {
		return apiClient.put(`/users/${username}/profile`, body);
	}

};

