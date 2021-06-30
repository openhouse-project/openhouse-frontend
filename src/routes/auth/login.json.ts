import jwt from 'jsonwebtoken';
import redis from '$lib/server/redis';
import web3 from '$lib/server/web3';
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

	// See https://github.com/jitsi/lib-jitsi-meet/blob/master/doc/tokens.md
	const payload = {
		context: {
			user: {
				name: address
			}
		},
		aud: process.env['JWT_ISSUER_ID'], // From Jitsi JWT example
		iss: process.env['JWT_ISSUER_ID'], // Needs to match the Jitsi config
		sub: 'video.collaboratory.io', // Not sure this is validated by Jitsi
		room: '*', // All rooms allowed
		exp: Math.floor(Date.now() / 1000) + 60 * 60, // Expiration in 1 hour
		nbf: Math.floor(Date.now() / 1000) - 30 // Not good before 30 seconds ago
	};
	const token = jwt.sign(payload, process.env['JWT_APP_SECRET']);
	return {
		status: 200,
		headers: {
			'Set-Cookie': cookie.serialize('accessToken', token, { maxAge: 60 * 60, path: '/' })
		},
		body: {
			token
		}
	};
}
