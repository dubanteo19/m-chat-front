import { MessageType, type Message } from '$lib/types/message';

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


export function createRoomEffectMessage(options: { sender: { displayName: string }, effect: string }): Message {
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