<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { truncateText } from '$lib/utils/text';
	import { X } from '@lucide/svelte';
	interface ReplyPreviewProps {
		repliedToMessage: any;
		onCancelReply: () => void;
	}
	let { repliedToMessage, onCancelReply }: ReplyPreviewProps = $props();
</script>

<div
	class="flex min-h-11 w-full items-center border-b border-border bg-[#171a20] fade-in slide-in-from-bottom-1 duration-150"
>
	<div class="min-w-0 flex-1 border-l-2 border-[#7c5cff] py-1 pr-3 pl-3">
		<span class="block truncate text-[10px] leading-4 font-medium text-muted-foreground">
			Replying to <span class="text-[#9b8cff]">@{repliedToMessage.sender.displayName}</span>
		</span>
		<div class="truncate text-[11px] leading-4 text-[#9097a3]">
			{#if repliedToMessage.type === 'IMAGE'}
				🖼️ Photo
			{:else if repliedToMessage.type === 'STICKER'}
				🖼️ Sticker
			{:else if repliedToMessage.type === 'VIDEO'}
				🎥 Video
			{:else}
				{truncateText(repliedToMessage.content)}
			{/if}
		</div>
	</div>
	<Button
		size="icon-sm"
		variant="ghost"
		onclick={onCancelReply}
		class="mr-1 shrink-0 text-muted-foreground hover:text-foreground"
		title="Cancel reply"
		aria-label="Cancel reply"><X size={15} /></Button
	>
</div>
