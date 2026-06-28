<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import { scrollService } from '$lib/services/scroll-service.svelte';
	import type { Message } from '$lib/types/message';
	import { truncateText } from '$lib/utils/text';

	let { message } = $props<{
		message: Message;
	}>();
</script>

{#if message.repliedTo}
	<Button
		class="mb-1 flex flex-col items-start w-fit max-w-sm rounded-md border-l-2 "
		onclick={() => scrollService.scrollToMessage(message?.repliedTo?.id)}
	>
		<div class="text-[11px] font-semibold text-slate-400">
			↳ Replying to
			<span class="text-blue-400">{message.repliedTo.senderName}</span>
		</div>

		<div class="mt-0.5 text-sm text-slate-200">
			{#if message.repliedTo.type === 'IMAGE'}
				🖼️ Photo
			{:else if message.repliedTo.type === 'VIDEO'}
				🎥 Video
			{:else}
				{truncateText(message.repliedTo.content)}
			{/if}
		</div>
	</Button>
{/if}
