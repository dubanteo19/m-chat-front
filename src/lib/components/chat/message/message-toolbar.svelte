<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import { ALL_EMOJIS } from '$lib/constants/emojis';
	import type { Message } from '$lib/types/message';

	let { message, openReactionId, setOpenReactionId, handleReply, handleDelete, sendReact } =
		$props<{
			message: Message;
			openReactionId: number | null;
			setOpenReactionId: (id: number | null) => void;
			handleReply?: (message: Message) => void;
			handleDelete?: (message: Message) => void;
			sendReact?: (messageId: number, emoji: string) => void;
		}>();

	const visibleEmojis = ALL_EMOJIS.slice(0, 5);
	const hiddenEmojis = ALL_EMOJIS.slice(5);
	let showMore = $state(false);

	function selectEmoji(emoji: string) {
		sendReact?.(message.id, emoji);
		setOpenReactionId(null);
		showMore = false;
	}
</script>

<div
	class="absolute -top-6 z-20 flex items-center gap-1 bg-white border border-slate-200 shadow-md rounded-full px-2 py-1 transition-all fade-in zoom-in-95
	{message.isMine ? 'right-2' : 'left-2'}
	{openReactionId === message.id ? 'flex' : 'hidden md:group-hover:flex'}"
>
	<div class="relative flex items-center gap-0.5 border-r border-slate-200 pr-1.5 mr-0.5">
		{#each visibleEmojis as emoji (emoji)}
			<Button
				onclick={(e) => {
					e.stopPropagation();
					selectEmoji(emoji);
				}}
				class="hover:scale-125 active:scale-90 rounded-full"
				size="sm"
				variant="ghost"
				title="React with {emoji}"
			>
				{emoji}
			</Button>
		{/each}

		<Button onclick={() => (showMore = !showMore)} size="sm" variant="ghost" title="More reactions"
			>⋯</Button
		>

		{#if showMore}
			<div
				class="absolute bottom-full left-0 mb-1 z-50 grid grid-cols-6 gap-1.5 p-1.5 bg-white rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-2"
			>
				{#each hiddenEmojis as emoji (emoji)}
					<Button
						onclick={() => selectEmoji(emoji)}
						variant="ghost"
						class="hover:scale-125 active:scale-90  rounded-full"
						title="React with {emoji}"
					>
						{emoji}
					</Button>
				{/each}
			</div>
		{/if}
	</div>

	<Button onclick={() => handleReply?.(message)} size="sm" variant="ghost" title="Reply">⤶</Button>

	{#if message.isMine}
		<Button onclick={() => handleDelete?.(message)} size="sm" variant="ghost" title="Delete">
			✖
		</Button>
	{/if}
</div>
