<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { downloadService } from '$lib/services/download-service.svelte';
	import { MessageType, type Message } from '$lib/types/message';
	import { Download, RefreshCwIcon } from '@lucide/svelte';
	import MessageContentText from './message-content-text.svelte';
	let imgElement = $state<HTMLImageElement>();
	let refreshKey = $state(0);

	function refreshVideo() {
		refreshKey++;
	}
	let { message, onImageLoad, onOpenLightbox } = $props<{
		message: Message;
		onImageLoad?: () => void;
		onOpenLightbox?: (selectedMsg: Message, imgElement: HTMLImageElement | undefined) => void;
	}>();
</script>

{#if message.isDeleted}
	<div class="text-xs italic text-muted-foreground">
		<span>{message.content}</span>
	</div>
{:else if message.type === MessageType.TEXT}
	<div class="message-content block min-w-0 max-w-full">
		<div class="whitespace-pre-wrap leading-5 wrap-anywhere">
			<MessageContentText text={message.content} />
		</div>
	</div>
{:else if message.type === MessageType.IMAGE}
	<button
		onclick={() => onOpenLightbox?.(message, imgElement)}
		class="mt-1 block max-w-full cursor-pointer overflow-hidden rounded-md border border-border bg-card transition-opacity hover:opacity-85 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
	>
		<img
			bind:this={imgElement}
			onload={onImageLoad}
			src={message.content}
			alt="Chat attachment"
			class="h-auto max-h-60 w-auto max-w-[min(20rem,100%)] object-contain animate-in zoom-in-95 duration-150"
		/>
	</button>
{:else if message.type === MessageType.STICKER}
	<div class="my-1 flex select-none">
		<img
			onload={onImageLoad}
			src={message.content}
			alt="Sticker"
			class="h-auto w-auto max-h-28 max-w-28 object-contain animate-in zoom-in-95 duration-150"
		/>
	</div>
{:else if message.type === MessageType.VIDEO}
	<div
		class="group/video relative mt-1 w-full max-w-[22.5rem] overflow-hidden rounded-md border border-border bg-black"
	>
		<video
			src={`${message.content}?refresh=${refreshKey}`}
			controls
			class="aspect-video max-h-[12.75rem] w-full object-contain"
		>
			<track kind="captions" />
		</video>
		<Button
			onclick={() => downloadService.downloadVideo(message.content)}
			size="icon-sm"
			variant="secondary"
			class="absolute top-2 left-2 hidden border border-border bg-popover/90 text-muted-foreground shadow-md backdrop-blur-sm group-hover/video:flex hover:text-foreground"
			title="Download video"
			aria-label="Download video"
		>
			<Download size={14} />
		</Button>

		<Button
			onclick={() => refreshVideo()}
			size="icon-sm"
			variant="secondary"
			class="absolute top-2 right-2 hidden border border-border bg-popover/90 text-muted-foreground shadow-md backdrop-blur-sm group-hover/video:flex hover:text-foreground"
			title="Reload video"
			aria-label="Reload video"
		>
			<RefreshCwIcon size={14} />
		</Button>
	</div>
{/if}

<style>
	@media (pointer: coarse) {
		.message-content {
			user-select: none;
			-webkit-user-select: none;
		}
	}
</style>
