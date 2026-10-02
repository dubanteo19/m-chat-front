import type { StickerPackage } from '$lib/types/sticker';
import { apiClient } from './client';

export type CreateStickerPackageRequest = {
	name: string;
	description?: string;
	visibility: 'PUBLIC' | 'PRIVATE';
};
export const stickerService = {
	save: async (request: CreateStickerPackageRequest): Promise<StickerPackage> => {
		return apiClient.post(`/sticker-packages`, request);
	},
};
