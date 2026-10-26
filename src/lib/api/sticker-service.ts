import type { StickerInfo, StickerPackage } from '$lib/types/sticker';
import { apiClient } from './client';

export type CreateStickerPackageRequest = {
	name: string;
	description?: string;
	visibility: 'PUBLIC' | 'PRIVATE';
};

export type CreateStickerRequest = {
	objectKey: string;
};
export const stickerService = {
	save: async (request: CreateStickerPackageRequest): Promise<StickerPackage> => {
		return apiClient.post(`/sticker-packages`, request);
	},
	getStickers: async (packageId: number): Promise<StickerInfo[]> => {
		return apiClient.get(`/sticker-packages/${packageId}/stickers`);
	},
	getMyStickerPackages: async (): Promise<StickerPackage[]> => {
		return apiClient.get(`/sticker-packages/my`);
	},
	getPublicStickerPackages: async (): Promise<StickerPackage[]> => {
		return apiClient.get(`/sticker-packages`);
	},
	addStickerToPackage: async (packageId: number, request: CreateStickerRequest): Promise<StickerInfo> => {
		return apiClient.post(`/sticker-packages/${packageId}/stickers`, request);
	}
};
