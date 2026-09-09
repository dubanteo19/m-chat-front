import { PUBLIC_BASE_URL } from '$env/static/public';

export const UserEventType = {
    ROOM_UNREAD_UPDATED: 'ROOM_UNREAD_UPDATED',
    ROOM_UPDATED: 'ROOM_UPDATED',
    PING: 'PING'
} as const;

export type UserEventType =
    (typeof UserEventType)[keyof typeof UserEventType];

type RoomUnreadUpdated = {
    roomId: string;
    seq: number;
};

type UserEventHandlers = {
    onRoomUnreadUpdated?: (event: RoomUnreadUpdated) => void;
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
            'ROOM_UNREAD_UPDATED',
            (event) => {
                const payload = JSON.parse(event.data);

                handlers.onRoomUnreadUpdated?.(payload);
            }
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