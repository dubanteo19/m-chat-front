import { userService } from '$lib/api/user';
import type { PageLoad } from './$types';
export const ssr = false;
export const load: PageLoad = async ({ params }) => {
    const username = params.username;
    console.log(username);
    const res = await userService.getUserProfile(username);

    return {
        profile: res
    };
};