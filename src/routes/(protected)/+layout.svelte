<script lang="ts">
	import { userEventService } from '$lib/services/user-event.svelte.js';
	import { setProtectedUser } from '$lib/stores/auth.svelte';
	import { onMount } from 'svelte';

	let { data, children } = $props();

	setProtectedUser(data.user);
	onMount(() => {
		userEventService.connect();
		return () => {
			userEventService.disconnect();
		};
	});
</script>

<div class="app flex flex-col min-h-0 h-dvh overflow-hidden">
	<main class="flex-1 flex flex-col min-h-0 overflow-hidden">
		{@render children()}
	</main>
</div>
