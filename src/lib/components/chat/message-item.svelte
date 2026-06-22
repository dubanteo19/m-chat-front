<script lang="ts">
	import type { Message } from '$lib/types/message';

	let { message }: { message: Message } = $props();

	const isSystem = message.type === 'SYSTEM';
</script>

<div class="flex flex-col gap-1" class:self-start={!isSystem}>
	{#if !isSystem}
		<div class="text-xs text-slate-500">
			{message.sender}
		</div>
	{/if}

	{#if message.type === 'TEXT'}
		<div class="max-w-xl rounded-xl border border-slate-700 bg-slate-800 px-4 py-3">
			<p class="whitespace-pre-wrap break-words">
				{message.content}
			</p>
		</div>
	{:else if message.type === 'IMAGE'}
		<div class="max-w-xl overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
			<img src={message.content} alt="uploaded image" class="max-h-96 w-full object-contain" />
		</div>
	{:else if message.type === 'VIDEO'}
		<div class="max-w-xl overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
			<video src={message.content} controls class="max-h-96 w-full" />
		</div>
	{:else if message.type === 'SYSTEM'}
		<div class="text-center text-sm italic text-slate-500">
			{message.content}
		</div>
	{/if}

	<div class="text-xs text-slate-600">
		{new Date(message.sentAt).toLocaleTimeString()}
	</div>
</div>
