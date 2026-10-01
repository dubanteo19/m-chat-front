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
		clientId: Date.now().toString(),
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
	sender: UserInfo;
	isMine: boolean;
	effect: string;
}): Message {
	const id = Date.now(); // Generate a unique ID based on the current timestamp

	const effect = roomEffectsLabels.find(
		(effect) => effect.type === options.effect
	);


	const senderName = options.isMine
		? 'You'
		: options.sender.displayName;

	let content: string;

	if (!effect) {
		content = `${senderName} activated a room effect.`;
	} else if (effect.type === 'disco-fever') {
		const subject = options.isMine
			? "You're"
			: `${options.sender.displayName} is`;

		content =
			`The ${effect.icon} disco floor is lit! ` +
			`${subject} getting the party started.`;
	} else if (effect.type === 'halloween-night') {
		content =
			`${senderName} brought ${effect.icon} ${effect.label} into the room. The corridor is no longer empty.`
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

export function createAnonymousActivityMessage(options: {
	sender: UserInfo;
	activity: string;
}): Message {
	const anynonymousName = options.sender.displayName.substring(0, Math.min(4, options.sender.displayName.length)) + '...';
	const content = `${anynonymousName} performed ${options.activity}.`;
	return {
		id: Date.now(),
		content,
		type: MessageType.SYSTEM,
		sender: options.sender,
		sentAt: new Date().toISOString(),
		isDeleted: false
	};
}
