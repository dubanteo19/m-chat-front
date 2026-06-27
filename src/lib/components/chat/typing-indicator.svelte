<script lang="ts">
	let { typingUsers = [] } = $props();
</script>

<div class="h-6 p-2 text-xs text-slate-400 italic">
	{#if typingUsers.length === 1}
		<span class="font-medium text-blue-400">{typingUsers[0]}</span> is typing
		<span class="animate-pulse">...</span>
	{:else if typingUsers.length === 2}
		<span class="font-medium text-blue-400">{typingUsers[0]}</span> and
		<span class="font-medium text-blue-400">{typingUsers[1]}</span> are typing
		<span class="animate-pulse">...</span>
	{:else if typingUsers.length > 2}
		<span class="font-medium text-blue-400">{typingUsers[0]}</span>,
		<span class="font-medium text-blue-400">{typingUsers[1]}</span>, and
		<span class="font-medium text-blue-400">{typingUsers.length - 2} others</span> are typing
		<span class="animate-pulse">...</span>
	{/if}
</div>
