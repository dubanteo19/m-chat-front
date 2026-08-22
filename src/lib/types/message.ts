import type { UserInfo } from './user';

export const MessageType = {
	TEXT: 'TEXT',
	IMAGE: 'IMAGE',
	VIDEO: 'VIDEO',
	SYSTEM: 'SYSTEM',
	STICKER: 'STICKER'
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export type RepliedMessageInfo = {
	id: number;
	senderName: string;
	content: string;
	type: MessageType;
};

export type ReactionInfo = {
	type: string;
	sender: UserInfo;
	reactedAt: string;
};

export interface MessagePayload {
	content: string;
	replyTo?: string | number | null;
	type: MessageType;
}

export interface MessageReactPayload {
	emoji: string;
}

export type MessageStatus = 'sending' | 'sent' | 'failed';
export type Message = {
	id: number;
	clientId: string;
	type: MessageType;
	sender: UserInfo;
	content: string;
	sentAt: string;
	isMine?: boolean;
	isDeleted: boolean;
	repliedTo?: RepliedMessageInfo | null;
	reactions?: ReactionInfo[];
	status: MessageStatus;
};
