<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { Message } from '$lib/types/message';
	import { getRepliedMessageContent } from '$lib/utils/message';
	interface ReplyingPreviewProps {
		replyingToMessage: Message;
		onCancelReply: () => void;
	}
	let { replyingToMessage, onCancelReply }: ReplyingPreviewProps = $props();
</script>

<div
	class="flex items-center justify-between bg-slate-800/40 w-60 m-2 p-2 fade-in slide-in-from-bottom-1 duration-150"
>
	<div class="min-w-0 flex-1 mr-4">
		<span class="font-semibold text-indigo-400 text-[11px] block">
			Replying to {replyingToMessage.sender.displayName}
		</span>
		<div class="mt-0.5 text-sm">
			{getRepliedMessageContent(replyingToMessage.content, replyingToMessage.type)}
		</div>
	</div>
	<Button size="sm" variant="ghost" onclick={onCancelReply} class="shrink-0" title="Cancel reply"
		>X</Button
	>
</div>
