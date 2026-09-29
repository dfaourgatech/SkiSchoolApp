import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		// Static output: the whole app (including bundled seed data) is
		// cacheable by the service worker, so it works fully offline on-hill.
		adapter: adapter({
			fallback: 'index.html'
		})
	}
};

export default config;
