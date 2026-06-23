<script lang="ts">
	import type { Message } from '$lib/types/message';
	import { formatDate } from '$lib/utils/date';
	import PhotoSwipe from 'photoswipe';
	import 'photoswipe/dist/photoswipe.css';
	let { message, onImageLoad } = $props<{ message: Message; onImageLoad?: () => void }>();
	let imgElement = $state<HTMLImageElement>();
	const isSystem = message.type === 'SYSTEM';

	let finalWidth;
	let finalHeight;
	function openLightbox(e: MouseEvent) {
		e.preventDefault();
		finalWidth = imgElement?.naturalWidth || 1200;
		finalHeight = imgElement?.naturalHeight || 900;
		const pswp = new PhotoSwipe({
			dataSource: [
				{
					src: message.content,
					w: finalWidth,
					h: finalHeight,
					alt: 'Chat attachment'
				}
			],
			imageClickAction: 'zoom-or-close',
			bgClickAction: 'close',
			wheelToZoom: true,
			secondaryZoomLevel: 1.5,
			maxZoomLevel: 3,
			bgOpacity: 0.95,
			loop: false,
			closeOnVerticalDrag: true
		});

		pswp.init();
	}
</script>

<div
	class="flex flex-col gap-1 w-fit max-w-xl
	{isSystem ? 'self-center mx-auto' : message.isMine ? 'self-end' : 'self-start'}"
>
	{#if !isSystem}
		<div
			class="text-xs text-slate-500 flex gap-1.5 {message.isMine ? 'justify-end' : 'justify-start'}"
		>
			{#if !message.isMine}
				<span class="font-medium">{message.sender}</span>
			{/if}
			<span>{formatDate(message.sentAt)}</span>
		</div>
	{/if}

	{#if message.type === 'TEXT'}
		<div
			class="flex rounded-2xl border px-4 py-2.5 text-sm w-fit
			{message.isMine
				? 'border-slate-200 bg-slate-300 text-slate-900 rounded-br-none'
				: 'border-slate-200 bg-slate-100 text-slate-900 rounded-bl-none'}"
		>
			<p class="whitespace-pre-wrap break-words">
				{message.content}
			</p>
		</div>
	{:else if message.type === 'IMAGE'}
		<button
			onclick={openLightbox}
			class="overflow-hidden rounded-xl cursor-pointer block hover:opacity-95 transition-opacity focus:outline-none"
		>
			<img
				bind:this={imgElement}
				onload={onImageLoad}
				src={message.content}
				alt="uploaded item"
				class="max-h-96 w-full object-contain"
			/>
		</button>
	{:else if message.type === 'VIDEO'}
		<div
			class="overflow-hidden rounded-xl border {message.isMine
				? 'border-indigo-600'
				: 'border-slate-700 bg-slate-800'}"
		>
			<video src={message.content} controls class="max-h-96 w-full" />
		</div>
	{:else if message.type === 'SYSTEM'}
		<div class="text-center text-xs tracking-wide text-slate-500 px-3 py-1.5 rounded-full my-2">
			{message.content}
			<span class="text-slate-400 ml-1">({formatDate(message.sentAt)})</span>
		</div>
	{/if}
</div>
