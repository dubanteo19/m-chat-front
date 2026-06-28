import type { Message, MessageType } from '$lib/types/message';

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

export function processIncomingMessage(rawMsg: any, currentUser: string): Message {
	return {
		...rawMsg,
		isMine: rawMsg.sender.username === currentUser
	};
}
