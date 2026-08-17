import { roomService } from "$lib/api/room";
import { PROTECTED_USER_KEY } from "$lib/stores/auth.svelte";
import type { RoomMemberInfo } from "$lib/types/room";
import { createQuery, useQueryClient, type CreateQueryResult } from "@tanstack/svelte-query";
import { getContext, setContext } from "svelte";

export const ROOM_MEMBERS_KEY = Symbol('ROOM_MEMBERS');

export class RoomState {
    private getRoomId: () => string;
    private queryClient = useQueryClient();

    membersQuery: CreateQueryResult<RoomMemberInfo[], Error>;

    constructor(getRoomId: () => string) {
        this.getRoomId = getRoomId;

        this.membersQuery = createQuery(() => ({
            queryKey: ['room-members', this.getRoomId()],
            queryFn: () => roomService.getRoomMembers(this.getRoomId()),
            enabled: !!this.getRoomId(),
        }));
    }

    get members(): RoomMemberInfo[] {
        return this.membersQuery.data ?? [];
    }

    addMember(newMember: RoomMemberInfo) {
        this.queryClient.setQueryData<RoomMemberInfo[]>(
            ['room-members', this.getRoomId()],
            (old) => {
                if (!old) return [newMember];
                if (old.some((m) => m.user.username === newMember.user.username)) return old;
                return [...old, newMember];
            }
        );
    }
    removeMember(username: string) {
        this.queryClient.setQueryData<RoomMemberInfo[]>(
            ['room-members', this.getRoomId()],
            (old) => old ? old.filter(m => m.user.username !== username) : []
        );
    }
}



// Call in (protected)/+layout.svelte
export function setRoomId(roomId: string) {
	setContext(ROOM_MEMBERS_KEY, roomId);
}

// Call in ANY component or page inside (protected)/
export function useRoom(): RoomState {
	const roomState = getContext<RoomState>(ROOM_MEMBERS_KEY);
	if (!roomState) {
		throw new Error('useRoom() must be called within a protected route.');
	}
	return roomState;
}
