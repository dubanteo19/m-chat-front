import { PUBLIC_BASE_URL } from '$env/static/public';
import { type MessagePayload } from '$lib/types/message';
import type { UserInfo } from '$lib/types/user';
export const EventType = {
	MESSAGE: 'MESSAGE',
	ONLINE_USERS: 'ONLINE_USERS',
	TYPING_START: 'TYPING_START',
	TYPING_STOP: 'TYPING_STOP',
	REACTION: 'REACTION',
	MESSAGE_DELETE: 'MESSAGE_DELETE',
	PING: 'PING',
	ROOM_EFFECT: 'ROOM_EFFECT'
} as const;

export type EventType = (typeof EventType)[keyof typeof EventType];

type ChatEventHandlers = {
	onMessage?: (message: any) => void;
	onReaction?: (payload: any) => void;
	onDeleteMessage?: (payload: any) => void;
	onRoomEffect?: (payload: any) => void;
};

function createWebsocketService() {
	let socket = $state<WebSocket | null>(null);

	let connected = $state(false);
	let typingUsers = $state<UserInfo[]>([]);
	let onlineUsers = $state<UserInfo[]>([]);
	let currentUser: UserInfo | null = null;
	let pingInterval: ReturnType<typeof setInterval>;

	function connect(roomId: string, user: UserInfo, handlers: ChatEventHandlers) {
		if (!roomId || !user) return;
		currentUser = user;
		socket = new WebSocket(`${PUBLIC_BASE_URL}/chat/${roomId}/${currentUser.username}`);
		socket.onopen = () => {
			connected = true;
			pingInterval = setInterval(() => {
				sendRaw({ eventType: EventType.PING });
			}, 30000);
		};

		socket.onclose = () => {
			connected = false;
			typingUsers = [];
			clearInterval(pingInterval);
		};

		socket.onmessage = (event) => {
			const parsed = JSON.parse(event.data)
			console.log('Received event:', parsed);
			switch (parsed.eventType as EventType) {
				case EventType.ONLINE_USERS:
					onlineUsers = Array.isArray(parsed) ? parsed : parsed.users || [];
					return;
				case EventType.TYPING_START:
					if (parsed.sender.username !== currentUser?.username && !typingUsers.includes(parsed.sender)) {
						typingUsers = [...typingUsers, parsed.sender];
					}
					return;

				case EventType.TYPING_STOP:
					typingUsers = typingUsers.filter((u) => u.username !== parsed.sender.username);
					return;

				case EventType.REACTION:
					handlers.onReaction?.(parsed);
					return;

				case EventType.MESSAGE_DELETE:
					handlers.onDeleteMessage?.(parsed);
					return;

				case EventType.ROOM_EFFECT:
					handlers.onRoomEffect?.(parsed);
					return;
				default:
					handlers.onMessage?.(parsed);
			}
		};
	}

	function disconnect() {
		socket?.close();
	}

	function sendRaw(payload: unknown) {
		if (socket?.readyState !== WebSocket.OPEN) return;
		socket.send(JSON.stringify(payload));
	}

	function sendMessage(payload: MessagePayload) {
		sendRaw({ ...payload, eventType: EventType.MESSAGE });
	}

	function sendReaction(messageId: number, emoji: string) {
		sendRaw({
			eventType: EventType.REACTION,
			messageId,
			content: emoji,
			sender: currentUser?.username
		});
	}

	function sendTyping(isTyping: boolean) {
		sendRaw({
			eventType: isTyping ? EventType.TYPING_START : EventType.TYPING_STOP,
			sender: currentUser
		});
	}

	return {
		get connected() {
			return connected;
		},

		get typingUsers() {
			return typingUsers;
		},
		get onlineUsers() {
			return onlineUsers;
		},
		connect,
		disconnect,
		sendMessage,
		sendReaction,
		sendTyping,
		sendRaw
	};
}

export const websocketService = createWebsocketService();
