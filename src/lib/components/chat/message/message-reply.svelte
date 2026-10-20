<script lang="ts">
	import { scrollService } from '$lib/services/scroll-service.svelte';
	import type { RepliedMessageInfo } from '$lib/types/message';
	import { getRepliedMessageContent } from '$lib/utils/message';

	let { repliedTo }: { repliedTo: RepliedMessageInfo } = $props();
</script>

<button
	class="mb-1 flex flex-col items-start rounded-md border-2 p-2 bg-secondary/10 border-primary/50"
	onclick={() => scrollService.scrollToMessage(repliedTo.id)}
>
	<div class="text-[11px] font-semibold">
		↳ Replying to
		<span class="text-primary">{repliedTo.senderName}</span>
	</div>

	<div class="mt-0.5 text-sm">
		{getRepliedMessageContent(repliedTo.content, repliedTo.type)}
	</div>
</button>
