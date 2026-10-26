
import { stickerService } from '$lib/api/sticker-service';
import type { StickerPackage } from '$lib/types/sticker';
import { createQuery } from '@tanstack/svelte-query';


export function usePublicStickersQuery() {

    const query = createQuery<StickerPackage[], Error>(() => ({
        queryKey: ["public-sticker"],
        queryFn: () => stickerService.getPublicStickerPackages(),
        staleTime: 1000 * 60 * 5
    }));

    return {
        query
    };
}
