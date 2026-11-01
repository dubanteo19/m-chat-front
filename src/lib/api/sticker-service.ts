import type { PresignedUrlResponse } from '$lib/api/types';
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
	getMyStickerPackages: async (): Promise<StickerPackage[]> => {
		return apiClient.get(`/sticker-packages/my`);
	},
	getPublicStickerPackages: async (): Promise<StickerPackage[]> => {
		return apiClient.get(`/sticker-packages`);
	},
	save: async (request: CreateStickerPackageRequest): Promise<StickerPackage> => {
		return apiClient.post(`/sticker-packages`, request);
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
	): Promise<StickerInfo> => {
		return apiClient.post(`/sticker-packages/${packageId}/stickers`, request);
	},
	removeStickerFromPackage: async (packageId: number, stickerId: number): Promise<number> => {
		return apiClient.delete(`/sticker-packages/${packageId}/stickers/${stickerId}`);
	}
};
