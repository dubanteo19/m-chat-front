<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { STICKER_PACKS } from '$lib/constants/stickers';
	interface StickerPickerProps {
		sendSticker: (stickerUrl: string) => void;
	}
	let { sendSticker }: StickerPickerProps = $props();
</script>

<div class="grid grid-cols-3 gap-2 h-[580px] w-[520px] overflow-y-auto pr-1">
	{#each STICKER_PACKS as sticker, index (index)}
		<Button
			variant="ghost"
			class="h-auto w-full aspect-square p-2 "
			onclick={() => sendSticker(sticker.url)}
		>
			<img
				src={sticker.url}
				alt={sticker.name}
				class="w-full h-full object-contain pointer-events-none"
				loading="lazy"
			/>
		</Button>
	{/each}
</div>
