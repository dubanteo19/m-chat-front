export type StickerVisibility = 'PUBLIC' | 'PRIVATE';

export const StickerStatus = {
	UPLOADING: 'UPLOADING',
	QUEUED: 'QUEUED',
	PROCESSING: 'PROCESSING',
	READY: 'READY',
	FAILED: 'FAILED'
} as const;
export type StickerStatus = typeof StickerStatus[keyof typeof StickerStatus];
export interface StickerInfo {
	id: number;
	url: string;
	status: StickerStatus;
}

export interface StickerPackage {
	id: number;
	name: string;
	description: string;
	visibility: StickerVisibility;
	stickers: StickerInfo[];
	createdAt: string;
	updatedAt: string;
}

