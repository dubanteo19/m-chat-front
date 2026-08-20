import type { Handle, HandleFetch } from '@sveltejs/kit';
import { PUBLIC_BASE_URL } from '$env/static/public';
import type { CurrentUserInfo } from '$lib/types/user';

type CacheEntry = {
	user: CurrentUserInfo;
	expiresAt: number;
};

const sessionCache = new Map<string, CacheEntry>();

// 1 hour cache for user sessions
const CACHE_TTL = 60 * 60 * 1000;

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('m_user');

	if (!token) {
		event.locals.user = null;
		return resolve(event);
	}

	const now = Date.now();
	const cached = sessionCache.get(token);

	if (cached && cached.expiresAt > now) {
		event.locals.user = cached.user;
		return resolve(event);
	}
	const res = await event.fetch(`${PUBLIC_BASE_URL}/auth/me`);
	if (res.ok) {
		const user = (await res.json()) as CurrentUserInfo;

		sessionCache.set(token, {
			user,
			expiresAt: now + CACHE_TTL
		});
		event.locals.user = user;
	} else {
		sessionCache.delete(token);
		event.locals.user = null;
	}

	return resolve(event);
};

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
	if (request.url.startsWith(PUBLIC_BASE_URL)) {
		const cookie = event.request.headers.get('cookie');

		if (cookie) {
			request.headers.set('cookie', cookie);
		}
		if (import.meta.env.DEV) {
			return globalThis.fetch(request);
		}
	}

	return fetch(request);
};