import { roomService } from '$lib/api/room';
let readTimer: ReturnType<typeof setTimeout> | undefined;
let pendingReadSeq = 0;
const DEBOUNCE_DELAY = 1000;
export const readRoomService = {
    scheduleReadRoom(roomId: string, seq: number) {
        pendingReadSeq = Math.max(pendingReadSeq, seq);
        clearTimeout(readTimer);
        readTimer = setTimeout(async () => {
            const seqToRead = pendingReadSeq;
            pendingReadSeq = 0;
            readTimer = undefined;
            try {
                await roomService.readRoom(roomId, {
                    seq: seqToRead
                });
            } catch (err) {
                console.error('Failed to mark room as read:', err);
            }
        }, DEBOUNCE_DELAY);
    }
};