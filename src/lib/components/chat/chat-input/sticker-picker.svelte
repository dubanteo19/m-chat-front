<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { STICKER_PACKS } from '$lib/constants/stickers';
	interface StickerPickerProps {
		sendSticker: (stickerUrl: string) => void;
	}
	let { sendSticker }: StickerPickerProps = $props();
</script>

<div class="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
	{#each STICKER_PACKS as sticker (sticker.id)}
		<Button class="hover:bg-transparent" variant="ghost" onclick={() => sendSticker(sticker.url)}>
			<img src={sticker.url} alt={sticker.name} class="size-12 object-contain" loading="lazy" />
		</Button>
	{/each}
</div>
