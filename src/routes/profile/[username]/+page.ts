import type { UserInfo } from '$lib/types/message';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
export const ssr = false;
export const load: PageLoad = async ({ fetch, params }) => {
    // Read the username from the URL parameter path matching [username]
    const username = params.username;
    // Fetch the data from your Quarkus backend
    const res = await fetch(`/api/users/${username}`);

    if (!res.ok) {
        if (res.status === 404) {
            error(404, { message: `User "${username}" could not be found.` });
        }
        error(500, { message: 'Failed fetching user profile from server.' });
    }

    const profileData: UserInfo = await res.json();
    return {
        profile: profileData
    };
};