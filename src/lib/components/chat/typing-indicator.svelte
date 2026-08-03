<script lang="ts">
	import type { UserInfo } from '$lib/types/user';
	import UserAvatar from '../common/user-avatar.svelte';
	let { typingUsers }: { typingUsers: UserInfo[] } = $props();
</script>

<div class="h-6 p-2 text-xs text-slate-400 italic flex items-center gap-1">
	{#if typingUsers.length === 1}
		<UserAvatar user={typingUsers[0]} />
		<span class="font-medium text-blue-400">{typingUsers[0].displayName}</span> is typing
		<span class="animate-pulse">...</span>
	{:else if typingUsers.length === 2}
		<UserAvatar user={typingUsers[0]} />
		<span class="font-medium text-blue-400">{typingUsers[0].displayName}</span>
		<UserAvatar user={typingUsers[1]} />
		<span class="font-medium text-blue-400">{typingUsers[1].displayName}</span> are typing
		<span class="animate-pulse">...</span>
	{:else if typingUsers.length > 2}
		<UserAvatar user={typingUsers[0]} />
		<span class="font-medium text-blue-400">{typingUsers[0].displayName}</span>,
		<UserAvatar user={typingUsers[1]} />
		<span class="font-medium text-blue-400">{typingUsers[1].displayName}</span>,
		<span class="font-medium text-blue-400">{typingUsers.length - 2} others</span> are typing
		<span class="animate-pulse">...</span>
	{/if}
</div>
