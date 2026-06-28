<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import { STICKER_PACKS } from '$lib/constants/stickers';
	interface StickerPickerProps {
		sendSticker: (stickerUrl: string) => void;
	}
	let { sendSticker }: StickerPickerProps = $props();
</script>

<div class="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
	{#each STICKER_PACKS as sticker (sticker.id)}
		<Button onclick={() => sendSticker(sticker.url)}>
			<img src={sticker.url} alt={sticker.name} class="w-12 h-12 object-contain" loading="lazy" />
		</Button>
	{/each}
</div>
