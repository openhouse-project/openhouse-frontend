import redis from '$lib/server/redis';
import web3 from '$lib/server/web3';
import crypto from 'crypto';

export async function get({ params }): Promise<any> {
	const { address = false } = params;
	if (!web3.utils.isAddress(address)) {
		return {
			status: 400,
			body: {
				error: 'Invalid address'
			}
		};
	}

	let challenge = await redis.get(`challenge:${params.address}`);
	if (!challenge) {
		challenge = crypto.randomBytes(16).toString('hex');
		await redis.set(`challenge:${params.address}`, challenge, 'EX', 180);
	}
	return {
		status: 200,
		body: {
			challenge
		}
	};
}
