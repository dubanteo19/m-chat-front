// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Read the session cookie set during login
	const username = event.cookies.get('m_user');

	if (username) {
		event.locals.user = { username };
	} else {
		event.locals.user = null;
	}

	return resolve(event);
};
