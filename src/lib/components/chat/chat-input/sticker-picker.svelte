<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { STICKER_PACKS } from '$lib/constants/stickers';
	import { SettingsIcon } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	interface StickerPickerProps {
		sendSticker: (stickerUrl: string) => void;
	}
	let { sendSticker }: StickerPickerProps = $props();
	const sickerPackages = [
		{
			name: 'Funny Stickers'
		},
		{
			name: 'Cute Stickers'
		},
		{
			name: 'Meme Stickers'
		},
		{
			name: 'Animal Stickers'
		},
		{
			name: 'Emoji Stickers'
		}
	];
	let selectedPackage = $state(sickerPackages[0]);
</script>

<div>
	<div class="flex items-center gap-2 px-4 py-2 border-b bg-slate-500">
		{#each sickerPackages as stickerPackage, i (i)}
			{@render stickerPackageItem(stickerPackage, () => {
				selectedPackage = stickerPackage;
			})}
		{/each}
		<a href={resolve('/sticker-package')}>
			<Button><SettingsIcon /></Button>
		</a>
	</div>
	<div
		class="grid h-[580px] w-[520px] content-start
	       grid-cols-4 gap-2
	       overflow-y-auto px-4 pt-4
	       [&::-webkit-scrollbar]:hidden"
	>
		{#each STICKER_PACKS as sticker, i (i)}
			{@render stickerItem(sticker, sendSticker)}
		{/each}
	</div>
</div>

{#snippet stickerPackageItem({ name }: { name: string }, onclick: () => void)}
	<button
		class="px-3 py-1 rounded-md text-sm font-medium"
		{onclick}
		class:bg-blue-500={selectedPackage.name === name}
	>
		{name}
	</button>
{/snippet}

{#snippet stickerItem(
	sticker: { name: string; id: string; url: string },
	sendSticker: (stickerUrl: string) => void
)}
	<button
		class="aspect-square w-full rounded-md flex-center
			       transition-colors hover:bg-muted"
		onclick={() => sendSticker(sticker.url)}
	>
		<img
			src={sticker.url}
			alt={sticker.name}
			class="max-h-full max-w-full object-contain pointer-events-none"
			loading="lazy"
		/>
	</button>
{/snippet}
