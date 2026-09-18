<script lang="ts">
	import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui/tabs';
	import GifPicker from './gif-picker.svelte';
	import StickerPicker from './sticker-picker.svelte';

	let { onClickItem }: { onClickItem: (payload: string) => void } = $props();
</script>

<Tabs value="sticker" class="w-full">
	<TabsList class="grid w-full grid-cols-2">
		<TabsTrigger value="sticker">Sticker</TabsTrigger>
		<TabsTrigger value="gif">GIF</TabsTrigger>
	</TabsList>

	<TabsContent value="sticker">
		<StickerPicker sendSticker={onClickItem} />
	</TabsContent>

	<TabsContent value="gif">
		<GifPicker onSelectGif={onClickItem} />
	</TabsContent>
</Tabs>
