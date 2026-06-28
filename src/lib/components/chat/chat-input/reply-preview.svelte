<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import { truncateText } from '$lib/utils/text';
	interface ReplyPreviewProps {
		repliedToMessage: any;
		onCancelReply: () => void;
	}
	let { repliedToMessage, onCancelReply }: ReplyPreviewProps = $props();
</script>

<div
	class="flex items-center justify-between bg-slate-800/40 w-60 m-2 p-2 fade-in slide-in-from-bottom-1 duration-150"
>
	<div class="min-w-0 flex-1 mr-4">
		<span class="font-semibold text-indigo-400 text-[11px] block">
			Replying to {repliedToMessage.sender.displayName}
		</span>
		<p class="text-slate-400 italic text-[11px] mt-0.5 truncate font-mono">
			{truncateText(repliedToMessage.content)}
		</p>
	</div>
	<Button size="sm" variant="ghost" onclick={onCancelReply} class="shrink-0" title="Cancel reply"
		>X</Button
	>
</div>
