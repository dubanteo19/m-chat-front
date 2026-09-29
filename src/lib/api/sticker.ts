import type { Message } from '$lib/types/message';
import type { RoomInfo, RoomMemberInfo } from '$lib/types/room';
import { apiClient } from './client';

export type CreateStickerPackageRequest = {
	name: string;
	description?: string;
	visibility: 'PUBLIC' | 'PRIVATE';
};
export const stickerService = {
	createStickerPackage: async (request: CreateStickerPackageRequest): Promise<RoomInfo> => {
		return apiClient.post(`/sticker-packages`, request);
	},
};
