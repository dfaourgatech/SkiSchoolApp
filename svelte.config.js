import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// GitHub Pages serves project sites under /<repo>/, so the base path is
// baked in at build time via BASE_PATH (empty for local dev).
const basePath = process.env.BASE_PATH ?? '';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		// Static output: the whole app (including bundled seed data) is
		// cacheable by the service worker, so it works fully offline on-hill.
		adapter: adapter({
			// 404.html doubles as the SPA fallback on GitHub Pages, so
			// deep links and refreshes resolve instead of 404ing.
			fallback: '404.html'
		}),
		paths: {
			base: basePath
		}
	}
};

export default config;
