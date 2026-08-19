<script lang="ts">
	import { ROOM_MEMBERS_KEY, type RoomState } from '$lib/components/room/room-state.svelte';
	import { parseMessage } from '$lib/utils/message-parser';
	import type { MessageToken } from '$lib/utils/message-parser';
	import { truncateText } from '$lib/utils/text';
	import { getContext } from 'svelte';

	const roomState = getContext<RoomState>(ROOM_MEMBERS_KEY);

	let { text }: { text: string } = $props();

	const tokens = $derived(parseMessage(text));

	function getDisplayName(userId: string) {
		const member = roomState.members.find((m) => String(m.user.id) === userId);

		return member?.user.displayName || member?.user.username || userId;
	}
</script>

{#each tokens as token, i (i)}
	{@render renderToken(token)}
{/each}

{#snippet renderToken(token: MessageToken)}
	{#if token.type === 'text'}
		{token.value}
	{:else if token.type === 'mention'}
		<span class="mention-chip" data-user-id={token.userId}>
			@{getDisplayName(token.userId)}
		</span>
	{:else if token.type === 'link'}
		<a href={token.url} target="_blank" rel="noopener noreferrer" class="message-link">
			{truncateText(token.url)}
		</a>
	{/if}
{/snippet}

<style>
	.mention-chip {
		color: #60a5fa;
		font-weight: 600;
		padding: 1px 4px;
		border-radius: 4px;
		display: inline-block;
	}

	.message-link {
		color: #2563eb;
		text-decoration: underline;
		word-break: break-all;
	}
</style>
