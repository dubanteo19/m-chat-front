export type MessageType = 'TEXT' | 'IMAGE' | 'STICKER' | 'VIDEO';

export interface CreateMessagePayloadOptions {
	content: string;
	type: MessageType;
	replyTo?: string | number | null;
}

export function createMessagePayload(options: CreateMessagePayloadOptions) {
	return {
		content: options.content,
		type: options.type,
		replyTo: options.replyTo ?? null
	};
}
