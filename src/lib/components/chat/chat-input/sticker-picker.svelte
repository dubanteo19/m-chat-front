<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { STICKER_PACKS } from '$lib/constants/stickers';
	interface StickerPickerProps {
		sendSticker: (stickerUrl: string) => void;
	}
	let { sendSticker }: StickerPickerProps = $props();
</script>

<div
	class="grid h-[580px] w-[520px]  content-start
	       grid-cols-4 gap-2
	       overflow-y-auto px-4
	       [&::-webkit-scrollbar]:hidden"
>
	{#each STICKER_PACKS as sticker, i (i)}
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
	{/each}
</div>
