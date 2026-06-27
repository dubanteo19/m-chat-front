export type SenderInfo = {
	username: string;
	displayName: string;
	avatarUrl: string | null;
	title: string | null;
};
export type MessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'SYSTEM';
export type RepliedMessageInfo = {
	id: number;
	senderName: string;
	content: string;
	type: MessageType;
};
export type ReactionInfo = {
	type: string;
	sender: SenderInfo;
	reactedAt: string;
};
export interface MessagePayload {
	content: string;
	replyTo?: string | number | null;
	type: 'TEXT' | 'IMAGE' | 'STICKER' | 'VIDEO';
}
export type Message = {
	id: number;
	type: MessageType;
	sender: SenderInfo;
	content: string;
	sentAt: string;
	isMine?: boolean;
	isDeleted: boolean;
	repliedTo: RepliedMessageInfo | null;
	reactions: ReactionInfo[];
};

