<script lang="ts">
	import type { UserInfo } from '$lib/types/user';
	import UserAvatar from '../common/user-avatar.svelte';
	let { typingUsers }: { typingUsers: UserInfo[] } = $props();
</script>

<div class="h-6 p-2 text-xs text-slate-400 italic flex items-center gap-1">
	{#if typingUsers.length > 0}
		{#if typingUsers.length === 1}
			<UserAvatar user={typingUsers[0]} />
			<span class="font-medium text-blue-400">{typingUsers[0].displayName}</span> is typing
		{:else if typingUsers.length === 2}
			<UserAvatar user={typingUsers[0]} />
			<span class="font-medium text-blue-400">{typingUsers[0].displayName}</span>
			<UserAvatar user={typingUsers[1]} />
			<span class="font-medium text-blue-400">{typingUsers[1].displayName}</span> are typing
		{:else if typingUsers.length > 2}
			<UserAvatar user={typingUsers[0]} />
			<span class="font-medium text-blue-400">{typingUsers[0].displayName}</span>,
			<UserAvatar user={typingUsers[1]} />
			<span class="font-medium text-blue-400">{typingUsers[1].displayName}</span>,
			<span class="font-medium text-blue-400">{typingUsers.length - 2} others</span> are typing
		{/if}

		<!-- Single reusable animated dots block -->
		<span class="inline-flex items-center gap-1 ml-0.5 not-italic">
			<span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-typing-wave inline-block"></span>
			<span
				class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-typing-wave animation-delay-200 inline-block"
			></span>
			<span
				class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-typing-wave animation-delay-400 inline-block"
			></span>
		</span>
	{/if}
</div>

<style>
	@keyframes typing-wave {
		0%,
		60%,
		100% {
			transform: translateY(0);
			opacity: 0.4;
		}
		30% {
			transform: translateY(-4px);
			opacity: 1;
		}
	}

	.animate-typing-wave {
		animation: typing-wave 1.4s infinite ease-in-out;
	}

	.animation-delay-200 {
		animation-delay: 0.2s;
	}

	.animation-delay-400 {
		animation-delay: 0.4s;
	}
</style>
