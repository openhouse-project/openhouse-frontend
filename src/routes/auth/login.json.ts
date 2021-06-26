import jwt from 'jsonwebtoken';
import redis from '$lib/server/redis';
import web3 from '$lib/server/web3';
import env from '$lib/server/env';
import cookie from 'cookie';

export async function post({ body }): Promise<any> {
	const { address, signature } = body;
	if (!web3.utils.isAddress(address)) {
		return {
			status: 400,
			body: {
				error: 'Invalid address'
			}
		};
	}
	const challenge = await redis.get(`challenge:${address}`);
	if (!challenge) {
		return {
			status: 400,
			body: {
				error: 'Invalid challenge'
			}
		};
	}
	const signingAddress = web3.eth.accounts.recover(challenge, signature);
	if (signingAddress !== address) {
		return {
			status: 401,
			body: {
				error: 'Invalid signature'
			}
		};
	}
	const token = jwt.sign({ address }, env.JWT_APP_SECRET, {
		jwtid: env.JWT_APP_ID,
		issuer: env.JWT_ISSUER_ID
	});
	return {
		status: 200,
		headers: {
			'Set-Cookie': cookie.serialize('accessToken', token, { maxAge: 60 * 60 * 24 * 7, path: '/' })
		},
		body: {
			token
		}
	};
}
