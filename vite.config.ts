import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');

	return {
		server: {
			host: env.VITE_HOST || '0.0.0.0',
			port: Number(env.VITE_PORT) || 5173,
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
			sveltekit({
				compilerOptions: {
					runes: ({ filename }) =>
						filename.split(/[/\\]/).includes('node_modules') ? undefined : true
				}
			})
		]
	};
});