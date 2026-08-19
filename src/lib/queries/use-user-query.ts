import { userService } from '$lib/api/user';
import type { UserInfo } from '$lib/types/user';
import { createQuery } from '@tanstack/svelte-query';

export function useUsersQuery(searchTerm: () => string) {
    return createQuery<UserInfo[], Error>(() => {
        const query = searchTerm().trim();

        return {
            queryKey: ['users', 'search', query],
            queryFn: () => userService.search(query),
            enabled: query.length > 0,
            staleTime: 1000 * 60 * 5,
        };
    });
}