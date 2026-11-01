export type StickerVisibility = 'PUBLIC' | 'PRIVATE';

export interface StickerInfo {
	id: number;
	url: string;
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

