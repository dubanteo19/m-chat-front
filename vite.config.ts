import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');

	return {
		server: {
			host: '0.0.0.0',
			port: 5173,
			allowedHosts: ['chat.dbt19.site', 'mchat.dbt19.site'],
			proxy: {
				'/api': {
					target: env.PUBLIC_BASE_URL,
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/api/, '')
				}
			}
		},
		ssr: {
			noExternal: ['@tanstack/svelte-query']
		},
		plugins: [
			tailwindcss(),
			sveltekit()
		]
	};
});