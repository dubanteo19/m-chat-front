const VAPID_PUBLIC_KEY = "BBqdBHGfyH6dgCSAx_p12dqvwqjjW7x7VLIpxHlzolURsPnAlQpP61W2EshVRS9MNNhJ0docsYjAX_TbSJAMzTo";

import { userService } from '$lib/api/user';
import type { Message } from '$lib/types/message';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
}
function createNotificationService() {
    let status = $state<NotificationPermission | 'default'>('default');

    async function init(username: string) {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
            status = Notification.permission;
            
            if (status === 'granted' && username) {
                await ensureSubscriptionSync(username);
            }
        }
    }

    async function requestPermission(username: string) {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            try {
                const permission = await Notification.requestPermission();
                status = permission;
                if (permission === 'granted' && username) {
                    await ensureSubscriptionSync(username);
                }
            } catch (err) {
                console.error('Error requesting notification permission:', err);
            }
        }
    }

    function triggerPush(msg: Message, roomId: string) {
        // Skip system messages, your own messages, or if the user is already looking at the screen
        if (
            msg.isMine ||
            (typeof document !== 'undefined' && document.visibilityState === 'visible') ||
            msg.type === 'SYSTEM'
        ) {
            return;
        }

        // Fallback in-app foreground notification if the browser background sync isn't firing
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

    async function ensureSubscriptionSync(username: string) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            let subscription = await registration.pushManager.getSubscription();
            if (!subscription) {
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
                });
            }
            const subscriptionJSON = subscription.toJSON();
        await userService.savePushSubscription(username, {
            endpoint: subscriptionJSON.endpoint!,
            keys: subscriptionJSON.keys as { p256dh: string; auth: string }
        });
        } catch (err) {
            console.error('Failed to connect subscription with web-push endpoint', err);
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
