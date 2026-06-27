<script lang="ts">
	import { STICKER_PACKS } from '$lib/constants/stickers';
	interface StickerPickerProps {
		sendSticker: (stickerUrl: string) => void;
	}
	let { sendSticker }: StickerPickerProps = $props();
</script>

<div class="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
	{#each STICKER_PACKS as sticker (sticker.id)}
		<button
			type="button"
			onclick={() => sendSticker(sticker.url)}
			class="p-1.5 rounded-lg bg-slate-700/40 hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center group"
		>
			<img src={sticker.url} alt={sticker.name} class="w-12 h-12 object-contain" loading="lazy" />
		</button>
	{/each}
</div>
