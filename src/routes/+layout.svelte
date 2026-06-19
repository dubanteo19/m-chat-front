<script lang="ts">
	import Header from './Header.svelte';
	import './layout.css';

	let { children } = $props();
</script>

<div class="app">
	<Header />
	<main>{@render children()}</main>

	<footer>
		<p>Copyright © 2026 Dbt19. All rights reserved.</p>
	</footer>
</div>
