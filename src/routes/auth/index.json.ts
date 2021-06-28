import jwt from 'jsonwebtoken';
import cookie from 'cookie';
export async function get({ locals }) {
	const token = jwt.decode(locals?.cookies?.accessToken);
	if (token && new Date().valueOf() / 1000 > token.exp) {
		return {
			status: 401,
			body: { error: 'Token is expired' },
			headers: {
				'Set-Cookie': cookie.serialize('accessToken', null, { maxAge: 60 * 60 * 24 * 7, path: '/' })
			}
		};
	}
	return {
		status: 200,
		body: { token: token && locals?.cookies?.accessToken }
	};
}
