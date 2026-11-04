import { roomService, type CreateDmRequest, type CreateRoomRequest } from '$lib/api/room';
import { userService } from '$lib/api/user';
import type { RoomInfo } from '$lib/types/room';
import { createQuery, QueryClient, useQueryClient } from '@tanstack/svelte-query';

export const USER_ROOMS_QUERY_KEY = ['user-rooms'];

export function useUserRoomsQuery() {
    const queryClient = useQueryClient();

    const query = createQuery<RoomInfo[], Error>(() => ({
        queryKey: USER_ROOMS_QUERY_KEY,
        queryFn: () => userService.getRooms(),
        staleTime: 1000 * 60 * 5
    }));
    const updateCache = async (room: RoomInfo) => {
        queryClient.setQueryData<RoomInfo[]>(USER_ROOMS_QUERY_KEY, (old) => {
            if (!old) return [room];
            const index = old.findIndex((r) => r.id === room.id);
            // update cache if room already exists
            if (index > -1) {
                const updated = [...old];
                updated[index] = { ...updated[index], ...room };
                return updated;
            }
            // add new room to cache
            return [room, ...old];
        });
    }
    return {
        query,
        upsertRoom: async (request: CreateRoomRequest) => {
            const room = await roomService.createRoom(request);
            updateCache(room);
        },
        createDm: async (request: CreateDmRequest) => {
            const room = await roomService.createDm(request);
            updateCache(room);
            return room;
        },
        markRoomAsRead: async (roomId: string, seq: number) => {
            await roomService.readRoom(roomId, { seq });
            queryClient.setQueryData<RoomInfo[]>(
                USER_ROOMS_QUERY_KEY,
                (rooms) =>
                    rooms?.map((room) =>
                        room.id === roomId
                            ? { ...room, unreadCount: 0 }
                            : room
                    ) ?? []
            );
        },
        deleteRoom: async (roomId: string) => {
            await roomService.deleteRoom(roomId.toString());
            queryClient.setQueryData<RoomInfo[]>(USER_ROOMS_QUERY_KEY, (old) =>
                old ? old.filter((r) => r.id !== roomId) : []
            );
        },
        invalidate: () => {
            queryClient.invalidateQueries({ queryKey: USER_ROOMS_QUERY_KEY });
        }
    };
}

export function updateUnread(
    queryClient: QueryClient,
    roomId: string,
    seq: number
) {
    queryClient.setQueryData<RoomInfo[]>(
        USER_ROOMS_QUERY_KEY,
        (rooms) =>
            rooms?.map((room) => {
                if (room.id !== roomId) return room;

                const delta = Math.max(0, seq - room.lastSeq);

                return {
                    ...room,
                    lastSeq: Math.max(room.lastSeq, seq),
                    unreadCount: room.unreadCount + delta
                };
            }) ?? []
    );
}