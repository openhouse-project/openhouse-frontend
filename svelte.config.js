import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-node';
import fs from 'fs';

const { dependencies } = JSON.parse(fs.readFileSync('./package.json').toString());

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [preprocess()],

	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		ssr: false,
		vite: {
			ssr: {
				external: [...Object.keys(dependencies), 'Buffer']
			}
		},
		adapter: adapter()
	}
};

export default config;
