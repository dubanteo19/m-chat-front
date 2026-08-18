import { userService } from '$lib/api/user';
import type { RoomInfo } from '$lib/types/room';
import { createQuery, useQueryClient } from '@tanstack/svelte-query';

export const USER_ROOMS_QUERY_KEY = ['user-rooms'];

export function useUserRoomsQuery() {
    const queryClient = useQueryClient();

    const query = createQuery<RoomInfo[], Error>(() => ({
        queryKey: USER_ROOMS_QUERY_KEY,
        queryFn: () => userService.getRooms(),
        staleTime: 1000 * 60 * 5 
    }));

    return {
        query,
        upsertRoom: (room: RoomInfo) => {
            queryClient.setQueryData<RoomInfo[]>(USER_ROOMS_QUERY_KEY, (old) => {
                if (!old) return [room];
                const index = old.findIndex((r) => r.id === room.id);
                if (index > -1) {
                    const updated = [...old];
                    updated[index] = { ...updated[index], ...room };
                    return updated;
                }
                return [room, ...old];
            });
        },
        removeRoom: (roomId: string | number) => {
            queryClient.setQueryData<RoomInfo[]>(USER_ROOMS_QUERY_KEY, (old) =>
                old ? old.filter((r) => r.id !== roomId) : []
            );
        },
        invalidate: () => {
            queryClient.invalidateQueries({ queryKey: USER_ROOMS_QUERY_KEY });
        }
    };
}