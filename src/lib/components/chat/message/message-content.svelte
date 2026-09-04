<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { downloadService } from '$lib/services/download-service.svelte';
	import { MessageType, type Message } from '$lib/types/message';
	import { RefreshCwIcon } from '@lucide/svelte';
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
	<div
		class="rounded-2xl border px-4 py-2 text-sm italic
		{message.repliedTo ? 'rounded-tl-none rounded-tr-none' : ''}
		{message.isMine ? 'rounded-br-none' : 'rounded-bl-none'}"
	>
		<span>{message.content}</span>
	</div>
{:else if message.type === MessageType.TEXT}
	<div
		class="message-bubble inline-block w-auto max-w-full rounded-2xl border px-4 py-2 text-sm shadow-sm
		{message.repliedTo ? 'rounded-t-none' : ''}
		{message.isMine
			? ' bg-secondary/80 text-black rounded-br-none'
			: ' bg-secondary  text-black rounded-bl-none'}"
	>
		<p class="whitespace-pre-wrap leading-relaxed wrap-anywhere">
			<MessageContentText text={message.content} />
		</p>
	</div>
{:else if message.type === MessageType.IMAGE}
	<button
		onclick={() => onOpenLightbox?.(message, imgElement)}
		class="overflow-hidden rounded-xl border border-slate-200 shadow-sm cursor-pointer block hover:opacity-95 transition-opacity focus:outline-none bg-slate-50"
	>
		<img
			bind:this={imgElement}
			onload={onImageLoad}
			src={message.content}
			alt="Chat attachment"
			class="max-h-64 max-w-sm object-cover"
		/>
	</button>
{:else if message.type === MessageType.STICKER}
	<div class="block my-1 select-none pointer-events-none">
		<img
			onload={onImageLoad}
			src={message.content}
			alt="Sticker"
			class="w-full h-full object-contain animate-in zoom-in-95 duration-150"
		/>
	</div>
{:else if message.type === MessageType.VIDEO}
	<div class="overflow-hidden group rounded-xl border border-slate-200 shadow-sm bg-black max-w-sm">
		<video
			src={`${message.content}?refresh=${refreshKey}`}
			controls
			class="max-h-64 w-full object-contain"
		>
			<track kind="captions" />
		</video>
		<Button
			onclick={() => downloadService.downloadVideo(message.content)}
			size="sm"
			class="absolute top-6 left-2 hidden group-hover:block "
		>
			Download
		</Button>

		<Button
			onclick={() => refreshVideo()}
			size="sm"
			class="absolute top-6 right-6 hidden group-hover:block "
		>
			<RefreshCwIcon />
		</Button>
	</div>
{/if}

<style>
	@media (pointer: coarse) {
		.message-bubble {
			user-select: none;
			-webkit-user-select: none;
		}
	}
</style>
