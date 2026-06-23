<script lang="ts">
	import Header from './Header.svelte';
	import './layout.css';

	let { children } = $props();
</script>

<div class="app flex flex-col min-h-screen">
	<Header />

	<main class="flex-1 flex flex-col min-h-0">
		{@render children()}
	</main>

	<!-- <footer class="p-4 border-t border-slate-700 bg-slate-800 text-center text-sm text-slate-400">
		<p>Copyright © 2026 Dbt19. All rights reserved.</p>
	</footer> -->
</div>
