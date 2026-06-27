import type { Message } from '$lib/types/message';

function createNotificationService() {
	let status = $state<NotificationPermission | 'default'>('default');
	function init() {
		if (typeof window !== 'undefined' && 'Notification' in window) {
			status = Notification.permission;
		}
	}

	function requestPermission() {
		if (typeof window !== 'undefined' && 'Notification' in window) {
			Notification.requestPermission().then((permission) => {
				status = permission;
			});
		}
	}

	function triggerPush(msg: Message, roomId: string) {
		if (
			msg.isMine ||
			(typeof document !== 'undefined' && document.visibilityState === 'visible') ||
			msg.type === 'SYSTEM'
		) {
			return;
		}

		if (status === 'granted' && typeof window !== 'undefined' && 'Notification' in window) {
			let bodyText = msg.content;

			if (msg.type === 'IMAGE') bodyText = '📷 Sent an image file attachment';
			if (msg.type === 'VIDEO') bodyText = '🎥 Sent a video streaming attachment';

			const notification = new Notification(`#${roomId} - ${msg.sender.displayName}`, {
				body: bodyText,
				icon: '/favicon.png'
			});

			notification.onclick = () => {
				window.focus();
			};
		}
	}

	return {
		get status() {
			return status;
		},
		init,
		requestPermission,
		triggerPush
	};
}
export const notificationService = createNotificationService();
