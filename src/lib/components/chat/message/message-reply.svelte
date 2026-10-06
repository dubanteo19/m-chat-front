<script lang="ts">
	import { scrollService } from '$lib/services/scroll-service.svelte';
	import type { Message } from '$lib/types/message';
	import { truncateText } from '$lib/utils/text';

	let { message } = $props<{
		message: Message;
	}>();
</script>

<button
	class="mb-1 block max-w-full border-l-2 border-[#7c5cff] py-1 pr-3 pl-2.5 text-left text-muted-foreground transition-colors hover:bg-muted/50"
	onclick={() => scrollService.scrollToMessage(message?.repliedTo?.id)}
	title="Jump to original message"
>
	<div class="flex min-w-0 items-center gap-1 text-[10px] leading-4 font-medium">
		<span aria-hidden="true">↳</span>
		<span>Replying to</span>
		<span class="truncate text-[#9b8cff]">@{message.repliedTo.senderName}</span>
	</div>

	<div class="max-w-full truncate text-[11px] leading-4 text-[#9097a3]">
		{#if message.repliedTo.type === 'IMAGE'}
			🖼️ Photo
		{:else if message.repliedTo.type === 'STICKER'}
			🖼️ Sticker
		{:else if message.repliedTo.type === 'VIDEO'}
			🎥 Video
		{:else}
			{truncateText(message.repliedTo.content)}
		{/if}
	</div>
</button>
