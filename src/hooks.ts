import type { Handle } from '@sveltejs/kit';
import cookie from 'cookie';

export async function handle({ request, resolve }: any): Promise<Handle> {
	if (request.headers.cookie) {
		request.locals.cookies = cookie.parse(request.headers.cookie);
	}
	const response = await resolve(request);
	return response;
}
