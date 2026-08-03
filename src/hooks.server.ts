import type { Handle } from '@sveltejs/kit';
import { PUBLIC_BASE_URL } from '$env/static/public';
export const handle: Handle = async ({ event, resolve }) => {
	const cookie = event.request.headers.get("cookie");

	if (cookie) {
		const res = await fetch(`${PUBLIC_BASE_URL}/auth/me`, {
			headers: {
				cookie
			}
		});

		if (res.ok) {
			event.locals.user = await res.json();
		} else {
			event.locals.user = null;
		}
	} else {
		event.locals.user = null;
	}

	return resolve(event);
};