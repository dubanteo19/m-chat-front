<script lang="ts">
	import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui/tabs';
	import { MessageType } from '$lib/types/message';
	import GifPicker from './gif-picker.svelte';
	import StickerPicker from './sticker-picker.svelte';

	let { onClickItem }: { onClickItem: (url: string, type: MessageType) => void } = $props();
</script>

<Tabs value="sticker" class="w-full">
	<TabsList class="grid w-full grid-cols-2">
		<TabsTrigger value="sticker">Sticker</TabsTrigger>
		<TabsTrigger value="gif">GIF</TabsTrigger>
	</TabsList>

	<TabsContent value="sticker">
		<StickerPicker sendSticker={(url) => onClickItem(url, MessageType.STICKER)} />
	</TabsContent>

	<TabsContent value="gif">
		<GifPicker onSelectGif={(url) => onClickItem(url, MessageType.IMAGE)} />
	</TabsContent>
</Tabs>
