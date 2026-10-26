<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Spinner } from '$lib/components/ui/spinner';
	import { usePublicStickersQuery } from '$lib/queries/use-public-sticker';
	import type { StickerInfo, StickerPackage } from '$lib/types/sticker';
	import { SettingsIcon } from '@lucide/svelte';
	interface StickerPickerProps {
		sendSticker: (stickerUrl: string) => void;
	}
	let { sendSticker }: StickerPickerProps = $props();

	const { query } = usePublicStickersQuery();
	const { data: stickerPacks = [], isLoading } = $derived(query);
	let selectedPackageId = $state<number | null>(null);

	$effect(() => {
		if (stickerPacks && stickerPacks.length > 0) {
			selectedPackageId = stickerPacks[0].id;
		}
	});
	$effect(() => {
		if (selectedPackageId !== null) {
			const selectedPack = stickerPacks.find((pack) => pack.id === selectedPackageId);
			if (selectedPack) {
				const element = document.getElementById(`sticker-pack-${selectedPack.id}`);
				if (element) {
					element.scrollIntoView({ behavior: 'smooth', block: 'start' });
				}
			}
		}
	});
</script>

<div>
	<div class="flex  items-center gap-2 px-4 py-2 border-b bg-slate-500">
		{#if isLoading}
			<Spinner />
		{/if}
		<div class="flex gap-2 flex-1 overflow-x-auto">
			{#if stickerPacks.length > 0}
				{#each stickerPacks as pack, i (i)}
					{@render stickerPackageItem(pack, () => {
						selectedPackageId = pack.id;
					})}
				{/each}
			{/if}
		</div>
		<a href={resolve('/sticker-package')}>
			<Button><SettingsIcon /></Button>
		</a>
	</div>

	<div class="flex max-h-[700px] w-[520px] flex-col overflow-auto">
		{#if !isLoading && stickerPacks.length === 0}
			<p class="text-center text-sm text-muted-foreground">No sticker packages available.</p>
		{/if}
		{#if isLoading}
			<Spinner />
		{/if}

		{#each stickerPacks as pack (pack.id)}
			<div class="p-2" id={`sticker-pack-${pack.id}`}>
				<p class="text-yellow-300">{pack.name}</p>
				<div
					class=" grid content-start
                    grid-cols-4 gap-4 overflow-y-auto
                    [&::-webkit-scrollbar]:hidden"
				>
					{#each pack.stickers as sticker (sticker.id)}
						{@render stickerItem(sticker, sendSticker)}
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>

{#snippet stickerPackageItem(pack: StickerPackage, onclick: () => void)}
	<button
		class="px-3 py-1 rounded-md text-sm font-medium"
		{onclick}
		class:bg-blue-500={selectedPackageId === pack.id}
	>
		{pack.name}
	</button>
{/snippet}

{#snippet stickerItem(sticker: StickerInfo, sendSticker: (stickerUrl: string) => void)}
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
