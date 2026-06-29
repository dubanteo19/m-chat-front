import { PUBLIC_BASE_URL } from '$env/static/public';
import { type MessagePayload, type UserInfo } from '$lib/types/message';

type ChatEventHandlers = {
	onMessage?: (message: any) => void;
	onReaction?: (payload: any) => void;
};

function createWebsocketService() {
	let socket = $state<WebSocket | null>(null);

	let connected = $state(false);
	let typingUsers = $state<string[]>([]);
	let onlineUsers = $state<UserInfo[]>([]);
	let currentUser = '';
	let pingInterval: ReturnType<typeof setInterval>;

	function connect(roomId: string, username: string, handlers: ChatEventHandlers) {
		if (!roomId || !username) return;
		currentUser = username;
		socket = new WebSocket(`${PUBLIC_BASE_URL}/chat/${roomId}/${username}`);
		socket.onopen = () => {
			connected = true;
			pingInterval = setInterval(() => {
				sendRaw({ type: 'PING' });
			}, 30000);
		};

		socket.onclose = () => {
			connected = false;
			typingUsers = [];
			clearInterval(pingInterval);
		};

		socket.onmessage = (event) => {
			const parsed = JSON.parse(event.data);

			switch (parsed.type) {
				case 'ONLINE_USERS':
					const usersList = Array.isArray(parsed) ? parsed : parsed.users || [];
					onlineUsers = usersList;
					return;
				case 'TYPING_START':
					if (parsed.sender !== currentUser && !typingUsers.includes(parsed.sender)) {
						typingUsers = [...typingUsers, parsed.sender];
					}
					return;

				case 'TYPING_STOP':
					typingUsers = typingUsers.filter((u) => u !== parsed.sender);
					return;

				case 'REACTION':
					handlers.onReaction?.(parsed);
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
		sendRaw(payload);
	}

	function sendReaction(messageId: number, emoji: string) {
		sendRaw({
			type: 'REACTION',
			messageId,
			content: emoji,
			sender: currentUser
		});
	}

	function sendTyping(isTyping: boolean) {
		sendRaw({
			type: isTyping ? 'TYPING_START' : 'TYPING_STOP',
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
		sendTyping
	};
}

export const websocketService = createWebsocketService();
