import { PUBLIC_BASE_URL } from '$env/static/public';
import type { StickerStatus } from '$lib/types/sticker';


type RoomUnreadUpdated = {
    roomId: string;
    seq: number;
};

type StickerStatusChanged = {
    stickerId: number;
    status: StickerStatus;
};


type RoomUpdated = {
    roomId: string;
    name?: string;
    avatar?: string;
    unreadCount?: number;
};

type EventHandler<T> = (payload: T) => void;

export const UserEvent = {
    ROOM_UPDATED: 'ROOM_UPDATED',
    ROOM_UNREAD_UPDATED: 'ROOM_UNREAD_UPDATED',
    STICKER_STATUS_CHANGED: 'STICKER_STATUS_CHANGED',
} as const;

export type UserEvent = typeof UserEvent[keyof typeof UserEvent];

type UserEventPayloadMap = {
    [UserEvent.ROOM_UPDATED]: RoomUpdated;
    [UserEvent.ROOM_UNREAD_UPDATED]: RoomUnreadUpdated;
    [UserEvent.STICKER_STATUS_CHANGED]: StickerStatusChanged;
};

export type UserEventType = keyof UserEventPayloadMap;

function createUserEventService() {
    let eventSource: EventSource | null = null;
    const subscribers = new Map<
        UserEventType,
        Set<EventHandler<unknown>>
    >();
    function dispatch<K extends UserEventType>(type: K, payload: UserEventPayloadMap[K]) {
        subscribers.get(type)?.forEach((handler) => {
            handler(payload);
        });
    }
    function connect() {

        if (eventSource) return;

        eventSource = new EventSource(`${PUBLIC_BASE_URL}/events`, { withCredentials: true });

        eventSource.onopen = () => {
            console.log('User SSE connected');
        };

        eventSource.onerror = (error) => {
            console.error('User SSE error:', error);
        };

        Object.values(UserEvent).forEach((eventType) => {
            eventSource?.addEventListener(eventType, (event: MessageEvent) => {
                try {
                    const payload = JSON.parse(event.data);
                    dispatch(eventType as UserEventType, payload);
                } catch (error) {
                    console.error('Error parsing event data:', error);
                }
            });
        });
    }
    function subscribe<K extends keyof UserEventPayloadMap>(type: K, handler: EventHandler<UserEventPayloadMap[K]>) {
        let handlers = subscribers.get(type);
        // If there are no handlers for this event type, create a new set
        if (!handlers) {
            handlers = new Set();
            subscribers.set(type, handlers);
        }
        // Add the handler to the set of handlers for this event type
        handlers.add(handler as EventHandler<unknown>);
        return () => {
            // Remove the handler from the set of handlers for this event type
            handlers?.delete(handler as EventHandler<unknown>);
            // If there are no more handlers for this event type, remove the set from the map
            if (handlers?.size === 0) {
                subscribers.delete(type);
            }
        };
    }
    function disconnect() {
        eventSource?.close();
        eventSource = null;
    }

    return {
        connect,
        disconnect,
        subscribe
    };
}

export const userEventService = createUserEventService();