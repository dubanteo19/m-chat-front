<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Hash, Info } from '@lucide/svelte';

	let { open = $bindable(false) } = $props<{
		open: boolean;
	}>();
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="gap-4 rounded-lg border-border bg-popover p-4 sm:max-w-[400px]">
		<Dialog.Header class="gap-1 border-b border-border pb-3">
			<Dialog.Title class="flex items-center gap-2 text-[14px] font-semibold"
				><Hash size={15} class="text-primary" />Room details</Dialog.Title
			>
			<Dialog.Description class="text-xs">
				Information about the current conversation.
			</Dialog.Description>
		</Dialog.Header>

		<div class="flex items-start gap-2.5 rounded-md border border-border bg-background/60 p-3">
			<Info size={15} class="mt-0.5 shrink-0 text-muted-foreground" />
			<p class="text-xs leading-5 text-muted-foreground">
				No additional room description has been added.
			</p>
		</div>
	</Dialog.Content>
</Dialog.Root>
