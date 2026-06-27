<script lang="ts">
	import { truncateText } from '$lib/utils/text';
	interface ReplyPreviewProps {
		repliedToMessage: any;
		onCancelReply: () => void;
	}
	let { repliedToMessage, onCancelReply }: ReplyPreviewProps = $props();
</script>

<div
	class="flex items-center justify-between bg-slate-800/40 w-50 m-2 px-3 py-2 text-xs text-slate-300 animate-in fade-in slide-in-from-bottom-1 duration-150"
>
	<div class="min-w-0 flex-1 mr-4">
		<span class="font-semibold text-indigo-400 text-[11px] block">
			Replying to {repliedToMessage.sender.displayName}
		</span>
		<p class="text-slate-400 italic text-[11px] mt-0.5 truncate font-mono">
			{truncateText(repliedToMessage.content)}
		</p>
	</div>
	<button
		type="button"
		onclick={onCancelReply}
		class="text-slate-400 hover:text-white p-0.5 rounded hover:bg-slate-600 transition-colors shrink-0"
		title="Cancel reply"
	>
		X
	</button>
</div>
