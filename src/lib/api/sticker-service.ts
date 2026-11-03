import type { PresignedUrlResponse } from '$lib/api/types';
import type { StickerPackage } from '$lib/types/sticker';
import { apiClient } from './client';

export type SaveStickerPackageRequest = {
	id?: number;
	name: string;
	description?: string;
	visibility: 'PUBLIC' | 'PRIVATE';
};

export type CreateStickerRequest = {
	objectKey: string;
};
export const stickerService = {
	getMyStickerPackages: async (): Promise<StickerPackage[]> => {
		return apiClient.get(`/sticker-packages/my`);
	},
	getPublicStickerPackages: async (): Promise<StickerPackage[]> => {
		return apiClient.get(`/sticker-packages`);
	},
	save: async (request: SaveStickerPackageRequest): Promise<StickerPackage> => {
		return apiClient.post(`/sticker-packages`, request);
	},
	update: async (request: SaveStickerPackageRequest): Promise<StickerPackage> => {
		return apiClient.put(`/sticker-packages`, request);
	},
	delete: async (packageId: number): Promise<StickerPackage> => {
		return apiClient.delete(`/sticker-packages/${packageId}`);
	},
	download: async (packageId: number): Promise<PresignedUrlResponse> => {
		return apiClient.post(`/sticker-packages/${packageId}/download`);
	},
	addStickerToPackage: async (
		packageId: number,
		request: CreateStickerRequest
	): Promise<number> => {
		return apiClient.post(`/sticker-packages/${packageId}/stickers`, request);
	},
	removeStickerFromPackage: async (packageId: number, stickerId: number): Promise<number> => {
		return apiClient.delete(`/sticker-packages/${packageId}/stickers/${stickerId}`);
	}
};
