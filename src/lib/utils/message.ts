import { MessageType, type Message, type RepliedMessageInfo } from '$lib/types/message';
import type { UserInfo } from '$lib/types/user';

export interface CreateMessagePayloadOptions {
	content: string;
	type: MessageType;
	replyTo?: number | null;
}

export function createMessagePayload(options: CreateMessagePayloadOptions) {
	return {
		content: options.content,
		type: options.type,
		replyTo: options.replyTo ?? null
	};
}

function toRepliedMessageInfo(message: Message) {
	return {
		id: message.id,
		senderName: message.sender.displayName,
		content: message.content,
		type: message.type
	};
}
export function createOptimisticMessage(
	content: string,
	type: MessageType,
	sender: UserInfo,
	repliedTo: Message | null
): Message {
	const repliedToInfo = repliedTo ? toRepliedMessageInfo(repliedTo) : null;
	const message: Message = {
		clientId: crypto.randomUUID(),
		id: Date.now(),
		type,
		sender,
		content: content,
		isMine: true,
		isDeleted: false,
		repliedTo: repliedToInfo,
		reactions: [],
		sentAt: new Date().toISOString(),
		status: 'sending'
	};
	return message;
}
export function processIncomingMessage(rawMsg: any, currentUser: string): Message {
	return {
		...rawMsg,
		isMine: rawMsg.sender.username === currentUser
	};
}

export function createRoomEffectMessage(options: {
	sender: { displayName: string };
	effect: string;
}): Message {
	const id = Date.now(); // Generate a unique ID based on the current timestamp
	return {
		id: id,
		content: `${options.sender.displayName} activated the ${options.effect} effect!`,
		type: MessageType.SYSTEM,
		sender: options.sender,
		sentAt: new Date().toISOString(),
		isDeleted: false
	};
}

