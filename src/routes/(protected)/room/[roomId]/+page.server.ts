// src/routes/rooms/[roomId]/+page.server.ts
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const { roomId } = params;

	const response = await fetch(`/api/rooms/${roomId}`);
	if (response.status === 401) {
		throw redirect(303, '/login');
	}

	if (response.status === 403) {
		throw error(403, { message: 'You do not have access to this room' });
	}

	if (response.status === 404) {
		throw error(404, { message: 'Room not found' });
	}

	if (!response.ok) {
		throw error(500, { message: 'Failed to load room' });
	}

	const room = await response.json();

	return {
		room
	};
};