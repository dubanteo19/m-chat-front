<script lang="ts">
	import UserAvatar from '../common/user-avatar.svelte';
	import UserBadge from '../common/user-badge.svelte';
	import { Button } from '../ui/button';

	let { sidebarOpen = $bindable(), roomId, onlineUsers } = $props();
</script>

<header class="h-16 border-b flex items-center px-4 md:px-6 gap-3">
	<Button onclick={() => (sidebarOpen = true)} class="md:hidden p-2  " aria-label="Open sidebar">
		☰
	</Button>
	<h2 class="text-lg font-bold tracking-wide truncate">
		<span class="text-accent">#</span>
		{roomId}
	</h2>
	<div class="flex gap-2">
		{#each onlineUsers as user (user.username)}
			<div class="relative flex p-1 group">
				<UserAvatar {user} />
				<span class="absolute size-2 bottom-0 right-0 bg-green-500 rounded ring-2 ring-white z-10"
				></span>
				<UserBadge
					class="absolute -bottom-9 rounded w-max  p-2  hidden group-hover:flex z-20"
					{user}
				/>
			</div>
		{/each}
	</div>
</header>
