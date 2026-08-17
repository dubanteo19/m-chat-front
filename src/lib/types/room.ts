import type { UserInfo } from "./user";

export interface RoomInfo {
	id: string;
	name: string;
	description?: string;
}

export type RoomRole = 'MASTER' | 'MEMBER';

export type RoomMemberInfo = {
	user: UserInfo;
	role: RoomRole;
	joinedAt: string;
};