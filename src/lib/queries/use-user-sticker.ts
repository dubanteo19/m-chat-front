
import { stickerService } from '$lib/api/sticker-service';
import type { StickerPackage } from '$lib/types/sticker';
import { createQuery, useQueryClient } from '@tanstack/svelte-query';

export const USER_STICKERS_QUERY_KEY = ['user-sticker'];

export function useUserStickersQuery() {
    const queryClient = useQueryClient();

    const query = createQuery<StickerPackage[], Error>(() => ({
        queryKey: USER_STICKERS_QUERY_KEY,
        queryFn: () => stickerService.getMyStickerPackages(),
        staleTime: 1000 * 60 * 5
    }));

    return {
        query,
        upsertStickerPackage: (stickerPackage: StickerPackage) => {
            queryClient.setQueryData<StickerPackage[]>(USER_STICKERS_QUERY_KEY, (old) => {
                if (!old) return [stickerPackage];
                const index = old.findIndex((s) => s.id === stickerPackage.id);
                if (index > -1) {
                    const updated = [...old];
                    updated[index] = { ...updated[index], ...stickerPackage };
                    return updated;
                }
                return [stickerPackage, ...old];
            });
        },
        invalidate: () => {
            queryClient.invalidateQueries({ queryKey: USER_STICKERS_QUERY_KEY });
        }
    };
}
