<script lang="ts">
	import UserAvatar from '$lib/components/common/user-avatar.svelte';
	import UserBadge from '$lib/components/common/user-badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import type { Message, ReactionInfo } from '$lib/types/message';

	let { message, sendReact } = $props<{
		message: Message;
		sendReact?: (messageId: number, emoji: string) => void;
	}>();

	let hoveredReactionType = $state<string | null>(null);

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

{#if message.reactions && groupedReactions().length > 0}
	<div class="flex flex-wrap gap-1 mt-1 px-1 {message.isMine ? 'justify-end' : 'justify-start'}">
		{#each groupedReactions() as reaction (reaction.type)}
			<div
				class="relative"
				role="none"
				onmouseenter={() => (hoveredReactionType = reaction.type)}
				onmouseleave={() => (hoveredReactionType = null)}
			>
				{#if hoveredReactionType === reaction.type}
					<div
						class="absolute top-full mb-1.5 z-30 min-w-[200px] bg-white border border-slate-200/80 rounded-lg shadow-xl p-2 flex flex-col gap-1 animate-fade-in {message.isMine
							? 'right-0'
							: 'left-0'}"
					>
						<div class="text-xs font-bold text-slate-500">{reaction.type}</div>
						<div class="max-h-36 overflow-y-auto flex flex-col gap-1 mt-1">
							{#each message.reactions.filter((r: ReactionInfo) => r.type === reaction.type) as r (r.sender.username)}
								<div
									class="flex items-center gap-2 px-1 py-1 rounded hover:bg-slate-50 transition-colors"
								>
									<UserAvatar user={r.sender} />
									<UserBadge user={r.sender} />
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<Button variant="plain" size="sm" onclick={() => sendReact?.(message.id, reaction.type)}>
					<span
						// class:border-amber-400={reaction.isMine}
						// class:border-slate-500={!reaction.isMine}
						class="border px-1 rounded-full">{reaction.type}</span
					>
					{#if reaction.count > 1}
						<span class="text-[10px] font-bold text-slate-400">{reaction.count}</span>
					{/if}
				</Button>
			</div>
		{/each}
	</div>
{/if}
