<script lang="ts">
	import UserAvatar from '$lib/components/common/user-avatar.svelte';
	import UserBadge from '$lib/components/common/user-badge.svelte';
	import * as HoverCard from '$lib/components/ui/hover-card/index.js';
	import { Button } from '$lib/components/ui/button';
	import type { Message, ReactionInfo } from '$lib/types/message';

	let { message, sendReact } = $props<{
		message: Message;
		sendReact?: (messageId: number, emoji: string) => void;
	}>();

	const groupedReactions = $derived(() => {
		if (!message.reactions || message.reactions.length === 0) return [];
		const groups: Record<string, { type: string; count: number; users: string[] }> = {};

		for (const r of message.reactions) {
			if (!groups[r.type]) {
				groups[r.type] = { type: r.type, count: 0, users: [] };
			}
			groups[r.type].count++;
			if (r.sender?.displayName) {
				groups[r.type].users.push(r.sender.displayName);
			}
		}
		return Object.values(groups);
	});
</script>

{#if !message.isDeleted && message.reactions && groupedReactions().length > 0}
	<div
		class="absolute -bottom-3 left-0 flex gap-1 {message.isMine ? 'justify-end' : 'justify-start'}"
	>
		{#each groupedReactions() as reaction (reaction.type)}
			<HoverCard.Root openDelay={150} closeDelay={100}>
				<HoverCard.Trigger>
					<Button
						variant="ghost"
						size="icon-sm"
						class="border-primary "
						onclick={() => sendReact?.(message.id, reaction.type)}
					>
						{reaction.type}
						{#if reaction.count > 1}
							<span class="text-[10px] font-bold text-slate-400">{reaction.count}</span>
						{/if}
					</Button>
				</HoverCard.Trigger>
				<HoverCard.Content
					side="bottom"
					align={message.isMine ? 'end' : 'start'}
					sideOffset={8}
					class="w-fit p-2"
				>
					<div class="text-xs font-medium mb-2">
						{reaction.type}
					</div>

					<div class="max-h-36 overflow-y-auto flex flex-col gap-1">
						{#each message.reactions.filter((r: ReactionInfo) => r.type === reaction.type) as r (r.sender.username)}
							<div
								class="flex items-center gap-2 px-1 py-1 rounded hover:bg-muted transition-colors"
							>
								<UserAvatar user={r.sender} />
								<UserBadge user={r.sender} />
							</div>
						{/each}
					</div>
				</HoverCard.Content>
			</HoverCard.Root>
		{/each}
	</div>
{/if}
