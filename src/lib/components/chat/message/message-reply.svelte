<script lang="ts">
	import { scrollService } from '$lib/services/scroll-service.svelte';
	import type { Message } from '$lib/types/message';
	import { truncateText } from '$lib/utils/text';

	let { message } = $props<{
		message: Message;
	}>();
</script>

<button
	class="mb-1 flex flex-col items-start rounded-md border-2 p-2 bg-secondary/10 border-primary/50"
	onclick={() => scrollService.scrollToMessage(message?.repliedTo?.id)}
>
	<div class="text-[11px] font-semibold">
		↳ Replying to
		<span class="text-primary">{message.repliedTo.senderName}</span>
	</div>

	<div class="mt-0.5 text-sm">
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
