export type TitleStyle = {
	textColor: string;
	backgroundColor: string;
	borderRadius: string;
	borderStyle?: string;
	borderColor?: string;
	textEffect?: string;
	animationVibe?: string;
};
export type UserInfo = {
	username: string;
	displayName: string;
	avatarUrl: string | null;
	title: string | null;
	titleStyle: TitleStyle;
};
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
export type Message = {
	id: number;
	type: MessageType;
	sender: UserInfo;
	content: string;
	sentAt: string;
	isMine?: boolean;
	isDeleted: boolean;
	repliedTo: RepliedMessageInfo | null;
	reactions: ReactionInfo[];
};
