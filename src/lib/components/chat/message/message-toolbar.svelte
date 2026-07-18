<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { ALL_EMOJIS } from '$lib/constants/emojis';
	import type { Message } from '$lib/types/message';
	import { Ellipsis, ReplyIcon } from '@lucide/svelte';

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

	function selectEmoji(emoji: string) {
		sendReact?.(message.id, emoji);
		setOpenReactionId(null);
	}
</script>

<div
	class="absolute -top-6 z-20 flex items-center gap-1 bg-secondary color-accent border-primary border shadow-2xs rounded-xl px-2 py-1 transition-all fade-in
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
				size="icon-sm"
				variant="ghost"
				title="React with {emoji}"
			>
				{emoji}
			</Button>
		{/each}

		<Popover.Root>
			<Popover.Trigger>
				<Button size="icon" variant="link" title="More reactions">
					<Ellipsis />
				</Button>
			</Popover.Trigger>
			<Popover.Content>
				<div
					class=" z-50 grid grid-cols-6 gap-1.5 p-1.5 bg-white rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-2"
				>
					{#each hiddenEmojis as emoji (emoji)}
						<Button
							onclick={() => selectEmoji(emoji)}
							variant="link"
							class="hover:scale-125 active:scale-90  rounded-full"
							title="React with {emoji}"
						>
							{emoji}
						</Button>
					{/each}
				</div>
			</Popover.Content>
		</Popover.Root>
	</div>

	<Button onclick={() => handleReply?.(message)} size="icon" variant="link" title="Reply">
		<ReplyIcon />
	</Button>

	{#if message.isMine}
		<Button onclick={() => handleDelete?.(message)} size="sm" variant="link" title="Delete">
			✖
		</Button>
	{/if}
</div>
