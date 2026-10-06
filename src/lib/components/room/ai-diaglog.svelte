<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { ArrowUp } from '@lucide/svelte';
	import Button from '../ui/button/button.svelte';
	import Textarea from '../ui/textarea/textarea.svelte';

	let { open = $bindable(false) } = $props<{
		open: boolean;
	}>();

	let prompt = $state('');

	function handleSubmit() {
		if (!prompt.trim()) return;
		const url = `https://www.google.com/search?q=${encodeURIComponent(prompt)}&udm=50`;
		window.open(url, '_blank');
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="gap-4 rounded-lg border-border bg-popover p-4 sm:max-w-[620px]">
		<Dialog.Header class="gap-1 border-b border-border pb-3">
			<Dialog.Title class="text-[14px] font-semibold">AI Assistant</Dialog.Title>
			<Dialog.Description class="text-xs">
				How can I assist you today? You can ask questions, get information, or seek help with
				various topics.
			</Dialog.Description>
		</Dialog.Header>

		<div class="relative w-full overflow-hidden">
			<Textarea
				placeholder="Type your prompt here..."
				bind:value={prompt}
				rows={5}
				class="min-h-[104px] w-full max-w-full resize-none rounded-md border-border bg-background/70 pr-11 pb-10 text-[13px] break-words focus-visible:ring-2"
				onkeydown={handleKeydown}
			/>
			<Button
				variant="default"
				size="icon"
				class="absolute right-2.5 bottom-2.5 size-8 rounded-md"
				onclick={handleSubmit}
				disabled={!prompt.trim()}
				aria-label="Submit prompt"
			>
				<ArrowUp class="h-4 w-4" />
			</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>
