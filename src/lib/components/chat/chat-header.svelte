<script lang="ts">
	import UserAvatar from '../common/user-avatar.svelte';
	import UserBadge from '../common/user-badge.svelte';

	let { sidebarOpen = $bindable(), roomId, onlineUsers } = $props();
</script>

<header class="h-16 border-b border-slate-700 bg-slate-800/50 flex items-center px-4 md:px-6 gap-3">
	<button
		onclick={() => (sidebarOpen = true)}
		class="md:hidden p-2 text-slate-400 hover:text-slate-200 focus:outline-none"
		aria-label="Open sidebar"
	>
		☰
	</button>
	<h2 class="text-lg font-bold tracking-wide truncate">
		<span class="text-slate-400">#</span>
		{roomId}
	</h2>
	<div class="flex gap-2">
		{#each onlineUsers as user (user.username)}
			<div class="relative  flex p-1 group ">
				<UserAvatar {user} />
				<span class="absolute size-2 bottom-0 right-0 bg-green-500 rounded ring-2 ring-white z-10"
				></span>
				<UserBadge class="absolute -bottom-9 rounded w-max  bg-white p-2  hidden group-hover:flex z-20" {user} />
			</div>
		{/each}
	</div>
</header>
