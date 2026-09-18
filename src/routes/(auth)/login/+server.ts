import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request }) => {
	const authHeader = request.headers.get('authorization');

	if (!authHeader) {
		// Triggers the browser's native popup
		return new Response('Unauthorized', {
			status: 401,
			headers: {
				'WWW-Authenticate': 'Basic realm="oms-vista.vn"'
			}
		});
	}

	// Parse credentials
	const base64 = authHeader.split(' ')[1];
	const [username, password] = Buffer.from(base64, 'base64').toString().split(':');

	// Check if correct
	if (username === 'admin' && password === '123456') {
		return new Response('Logged in successfully!');
	}

	// Fail -> Ask again
	return new Response('Unauthorized', {
		status: 401,
		headers: {
			'WWW-Authenticate': 'Basic realm="oms-vista.vn"'
		}
	});
};