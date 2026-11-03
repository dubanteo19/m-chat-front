
import { stickerService, type SaveStickerPackageRequest, type CreateStickerRequest } from '$lib/api/sticker-service';
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
        upsertStickerPackage: async (request: SaveStickerPackageRequest) => {
            let response = null;
            if (request.id) response = await stickerService.update(request);
            else response = await stickerService.save(request);

            queryClient.setQueryData<StickerPackage[]>(USER_STICKERS_QUERY_KEY, (old) => {
                if (!old) return [response];
                const index = old.findIndex((s) => s.id === response.id);
                // update cache with the new package data while preserving the existing stickers array
                if (index > -1) {
                    const updated = [...old];
                    const existingStickers = updated[index].stickers;
                    updated[index] = {
                        ...updated[index],
                        ...response,
                        stickers: existingStickers // Preserve the existing stickers array
                    };
                    return updated;

                }
                // If the package is new, add it to the beginning of the list
                return [response, ...old];
            });
            return response;
        },
        addStickerToPackage: async (packageId: number, request: CreateStickerRequest) => {
            const stickerId = await stickerService.addStickerToPackage(packageId, request);
            await queryClient.invalidateQueries({
                queryKey: USER_STICKERS_QUERY_KEY
            });

            return stickerId;
        },
        deletePackage: async (packageId: number) => {
            await stickerService.delete(packageId);
            queryClient.setQueryData<StickerPackage[]>(USER_STICKERS_QUERY_KEY, (old) =>
                old?.filter((pkg) => pkg.id !== packageId) || []
            );
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
