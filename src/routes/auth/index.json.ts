export async function get({ locals }) {
	return {
		status: 200,
		body: { token: locals?.cookies?.accessToken }
	};
}
