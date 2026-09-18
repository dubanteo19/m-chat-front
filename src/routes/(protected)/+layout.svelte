<script lang="ts">
	import { setProtectedUser } from '$lib/stores/auth.svelte';

	let { data, children } = $props();

	setProtectedUser(data.user);
	// const queryClient = useQueryClient();
	// onMount(() => {
	// 	userEventService.connect({
	// 		onRoomUnreadUpdated: ({ roomId, seq }) => {
	// 			updateUnread(queryClient, roomId, seq);
	// 		}
	// 	});

	// 	return () => {
	// 		userEventService.disconnect();
	// 	};
	// });
</script>

<div class="app flex flex-col min-h-0 h-dvh overflow-hidden">
	<main class="flex-1 flex flex-col min-h-0 overflow-hidden">
		{@render children()}
	</main>
</div>
