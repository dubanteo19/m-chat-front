<script lang="ts">
	import { setProtectedUser } from '$lib/stores/auth.svelte';

	let { data, children } = $props();

	setProtectedUser(data.user);
</script>

<div class="app flex flex-col min-h-screen">
	<main class="flex-1 flex flex-col min-h-0">
		{@render children()}
	</main>

</div>
