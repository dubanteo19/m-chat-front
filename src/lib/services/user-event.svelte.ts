import { PUBLIC_BASE_URL } from '$env/static/public';
import type { StickerStatus } from '$lib/types/sticker';

export const UserEvent = {
    ROOM_UNREAD_UPDATED: 'ROOM_UNREAD_UPDATED',
    ROOM_UPDATED: 'ROOM_UPDATED',
    STICKER_STATUS_CHANGED: 'STICKER_STATUS_CHANGED',
    PING: 'PING'
} as const;

export type UserEvent =
    (typeof UserEvent)[keyof typeof UserEvent];

type RoomUnreadUpdated = {
    roomId: string;
    seq: number;
};
type StickerStatusChanged = {
    stickerId: number;
    status: StickerStatus;
};
type UserEventHandlers = {
    onRoomUnreadUpdated?: (event: RoomUnreadUpdated) => void;
    onStickerStatusChanged?: (event: StickerStatusChanged) => void;
};

function createUserEventService() {
    let eventSource: EventSource | null = null;
    let handlers: UserEventHandlers = {};

    function connect(newHandlers: UserEventHandlers = {}) {
        handlers = newHandlers;

        if (eventSource) {
            eventSource.close();
        }

        eventSource = new EventSource(`${PUBLIC_BASE_URL}/events`, { withCredentials: true });

        eventSource.onopen = () => {
            console.log('User SSE connected');
        };

        eventSource.onerror = (error) => {
            console.error('User SSE error:', error);
        };

        eventSource.addEventListener(
            UserEvent.ROOM_UNREAD_UPDATED,
            (event) => handlers.onRoomUnreadUpdated?.(JSON.parse(event.data))
        );

        eventSource.addEventListener(
            UserEvent.STICKER_STATUS_CHANGED,
            (event) => handlers.onStickerStatusChanged?.(JSON.parse(event.data))
        );
    }

    function disconnect() {
        eventSource?.close();
        eventSource = null;
        handlers = {};
    }

    return {
        connect,
        disconnect
    };
}

export const userEventService = createUserEventService();