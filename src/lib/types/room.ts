import type { UserInfo } from "./user";

export const RoomType = {
	GROUP: 'GROUP',
	DM: 'DM'
} as const;

export type RoomType = typeof RoomType[keyof typeof RoomType];
export interface RoomInfo {
	id: string;
	name: string;
	description?: string;
	type: RoomType;
	lastSeq: number;
	unreadCount: number;
	peerDisplayName?: string;
	peerAvatarUrl?: string;
	peerId: number;
	online: boolean;
}

export type RoomRole = 'MASTER' | 'MEMBER';

export type RoomMemberInfo = {
	user: UserInfo;
	role: RoomRole;
	joinedAt: string;
};