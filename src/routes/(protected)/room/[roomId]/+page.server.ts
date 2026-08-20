import { PUBLIC_BASE_URL } from '$env/static/public';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const { roomId } = params;
	if (roomId === "hall") {
		return {
			room: {
				id: "hall",
				name: "Hall",
				description: "Welcome to the Hall! This is a public room where everyone can chat."
			}
		}
	}

	console.log(`Fetching room data for roomId: ${roomId}`);
	const response = await fetch(`${PUBLIC_BASE_URL}/rooms/${roomId}`);


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