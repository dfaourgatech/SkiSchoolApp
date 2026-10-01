import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

// Same base path as svelte.config.js so the installed PWA launches
// under the GitHub Pages subpath instead of the domain root.
const basePath = process.env.BASE_PATH ?? '';

export default defineConfig({
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			manifest: {
				name: 'Ski School Coaching App',
				short_name: 'SkiCoach',
				description: 'Lesson plans, drills, and terrain guidance for ski instructors',
				theme_color: '#0b3d66',
				background_color: '#ffffff',
				display: 'standalone',
				start_url: `${basePath}/`
				// TODO: add 192/512px PNG icons under static/ and list them here
			},
			workbox: {
				// Precache everything the static build emits, including the
				// bundled seed-data JSON. Content updates ship with deploys.
				globPatterns: ['**/*.{js,css,html,json,png,svg,ico}']
			},
			devOptions: {
				enabled: false
			}
		})
	]
});
