import { roomEffectsLabels } from '$lib/components/room-effects/effects/particles';
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
	sender: { displayName: string; username: string };
	currentUsername: string;
	effect: string;
}): Message {
	const id = Date.now(); // Generate a unique ID based on the current timestamp

	const effect = roomEffectsLabels.find(
		(effect) => effect.type === options.effect
	);

	const isCurrentUser = options.sender.username === options.currentUsername;

	const senderName = isCurrentUser
		? 'You'
		: options.sender.displayName;

	let content: string;

	if (!effect) {
		content = `${senderName} activated a room effect.`;
	} else if (effect.type === 'disco-fever') {
		const subject = isCurrentUser
			? "You're"
			: `${options.sender.displayName} is`;

		content =
			`The ${effect.icon} disco floor is lit! ` +
			`${subject} getting the party started.`;
	} else if (effect.type === 'cartoon-haunt') {
		content = 
			`${senderName} brought ${effect.icon} ${effect.label} into the room. Let the spooky fun begin!`
	} else {
		content =
			`${senderName} activated the ${effect.icon} ${effect.label} effect.`;
	}


	return {
		id: id,
		content,
		type: MessageType.SYSTEM,
		sender: options.sender,
		sentAt: new Date().toISOString(),
		isDeleted: false
	};
}
