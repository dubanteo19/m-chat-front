
import { stickerService, type CreateStickerRequest } from '$lib/api/sticker-service';
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
        upsertStickerPackage: async (stickerPackage: StickerPackage) => {
            await stickerService.save(stickerPackage)
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
        addStickerToPackage: async (packageId: number, request: CreateStickerRequest) => {
            await stickerService.addStickerToPackage(packageId, request);
            await queryClient.invalidateQueries({ queryKey: USER_STICKERS_QUERY_KEY });
        },
        removeSticker: async (stickerPackageId: number, stickerId: number) => {
            await stickerService.removeStickerFromPackage(stickerPackageId, stickerId);
            await queryClient.invalidateQueries({ queryKey: USER_STICKERS_QUERY_KEY });
        },
        invalidate: () => {
            queryClient.invalidateQueries({ queryKey: USER_STICKERS_QUERY_KEY });
        }
    };
}
