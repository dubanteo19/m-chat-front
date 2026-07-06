<script lang="ts">
	import { roomService } from '$lib/api/room';


	let { open = $bindable() } = $props();

	let roomName = $state('');
	let description = $state('');
	let loading = $state(false);

	async function submit() {
		loading = true;

		try {
			await roomService.createRoom({
				name: roomName,
				description,
				roomMasterUsername: 'general'
			});

			open = false;

			roomName = '';
			description = '';
		} finally {
			loading = false;
		}
	}
</script>

{#if open}

{/if}
