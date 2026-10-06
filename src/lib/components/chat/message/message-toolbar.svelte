<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { ALL_EMOJIS } from '$lib/constants/emojis';
	import type { Message } from '$lib/types/message';
	import { Ellipsis, ReplyIcon, TrashIcon } from '@lucide/svelte';

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
	let isPopoverOpen = $state(false);
	function selectEmoji(emoji: string) {
		sendReact?.(message.id, emoji);
		setOpenReactionId(null);
		isPopoverOpen = false;
	}
	// Determine toolbar visibility
	let isVisible = $derived(openReactionId === message.id || isPopoverOpen);
</script>

{#if !message.isDeleted}
	<div
		class="absolute top-0 right-3 z-20 items-center gap-0.5 rounded-md border border-border bg-popover px-1 py-0.5 text-popover-foreground shadow-lg transition-all fade-in
	{isVisible ? 'flex' : 'hidden md:group-hover:flex'}"
	>
		<div class="relative mr-0.5 flex items-center gap-0.5 border-r border-border pr-1">
			{#each visibleEmojis as emoji (emoji)}
				<Button
					onclick={(e) => {
						e.stopPropagation();
						selectEmoji(emoji);
					}}
					class="size-7 rounded hover:scale-110 active:scale-90"
					size="icon-sm"
					variant="ghost"
					title="React with {emoji}"
				>
					{emoji}
				</Button>
			{/each}

			<Popover.Root bind:open={isPopoverOpen}>
				<Popover.Trigger>
					<Button size="icon-sm" variant="ghost" title="More reactions">
						<Ellipsis size={15} />
					</Button>
				</Popover.Trigger>
				<Popover.Content>
					<div
						class=" z-50 grid grid-cols-6 gap-1.5 p-1.5 rounded-lg animate-in fade-in slide-in-from-bottom-2"
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

		<Button onclick={() => handleReply?.(message)} size="icon-sm" variant="ghost" title="Reply">
			<ReplyIcon size={15} />
		</Button>

		{#if message.isMine}
			<Button onclick={() => handleDelete?.(message)} size="icon-sm" variant="ghost" title="Delete">
				<TrashIcon size={15} />
			</Button>
		{/if}
	</div>
{/if}
