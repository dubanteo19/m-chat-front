<script lang="ts">
	import type { Message } from '$lib/types/message';
	import { formatDate } from '$lib/utils/date';
	import { truncateText } from '$lib/utils/text';
	import PhotoSwipe from 'photoswipe';
	import 'photoswipe/dist/photoswipe.css';

	let { message, onImageLoad, handleReply, handleDelete, handleReact } = $props<{
		message: Message;
		onImageLoad?: () => void;
		handleReply?: (message: Message) => void;
		handleDelete?: (message: Message) => void;
		handleReact?: (messageId: number, emoji: string) => void;
	}>();
	let imgElement = $state<HTMLImageElement>();

	const isSystem = $derived(message.type === 'SYSTEM');

	let finalWidth = $state(1200);
	let finalHeight = $state(900);

	function openLightbox(e: MouseEvent) {
		e.preventDefault();
		if (message.isUnsent) return; // Prevent lightboxing an unsent item

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

	function scrollToMessage(messageId: number) {
		const element = document.getElementById(`msg-${messageId}`);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'center' });
			element.classList.add('animate-pulse');
			setTimeout(() => element.classList.remove('animate-pulse'), 2000);
		}
	}
</script>

<div
	id="msg-{message.id}"
	class:justify-end={message.isMine}
	class:justify-start={!message.isMine}
	class:justify-center={isSystem}
	class="flex gap-2 w-full my-0.5 {isSystem && 'mx-auto'}"
>
	{#if !isSystem}
		<div class="shrink-0 w-8 h-8 rounded-full bg-slate-200 overflow-hidden self-end">
			{#if message.sender.avatarUrl}
				<img
					src={message.sender.avatarUrl}
					alt={message.sender.displayName}
					class="w-full h-full object-cover"
				/>
			{:else}
				<div
					class="w-full h-full flex items-center justify-center bg-slate-400 text-white text-xs font-semibold uppercase"
				>
					{message.sender.displayName.slice(0, 2)}
				</div>
			{/if}
		</div>
	{/if}

	<div
		class="flex flex-col gap-0.5 max-w-[85%] group relative {message.isMine
			? 'self-end'
			: 'self-start'}"
	>
		{#if !isSystem}
			<div class="text-[11px] text-slate-400 flex items-baseline gap-1.5 px-1">
				<span class="font-bold text-slate-600">{message.sender.displayName}</span>
				{#if message.sender.title}
					<span class="bg-slate-200 text-purple-500 font-bold text-[9px] px-1 rounded uppercase"
						>{message.sender.title}</span
					>
				{/if}
				<span class="text-[9px]">{formatDate(message.sentAt)}</span>
			</div>
		{/if}

		{#if message.repliedTo && !isSystem}
			<button
				onclick={() => scrollToMessage(message.repliedTo!.id)}
				class="text-left text-xs bg-slate-50 border-l-2 border-slate-300 px-2.5 py-1 text-slate-500 rounded-t-md opacity-85 hover:opacity-100 transition-opacity max-w-full truncate"
			>
				<span class="font-semibold text-[11px] block text-slate-600"
					>↳ Replying to {message.repliedTo.senderName}</span
				>
				<span class="italic truncate block">
					{#if message.repliedTo.type === 'IMAGE'}
						🖼️ Photo item
					{:else if message.repliedTo.type === 'VIDEO'}
						🎥 Video file
					{:else}
						{truncateText(message.repliedTo.content)}
					{/if}
				</span>
			</button>
		{/if}

		{#if message.isUnsent}
			<div
				class="rounded-2xl border px-4 py-2 text-sm italic select-none text-slate-400 bg-slate-50 border-slate-200
				{message.repliedTo ? 'rounded-tl-none rounded-tr-none' : ''}
				{message.isMine ? 'rounded-br-none' : 'rounded-bl-none'}"
			>
				<span>{message.content}</span>
			</div>
		{:else if message.type === 'TEXT'}
			<div
				class="inline-block w-auto max-w-full rounded-2xl border px-4 py-2 text-sm shadow-sm
				{message.repliedTo ? 'rounded-t-none' : ''}
				{message.isMine
					? 'border-indigo-100 bg-slate-400 text-white rounded-br-none'
					: 'border-slate-200 bg-white text-slate-800 rounded-bl-none'}"
			>
				<p class="whitespace-pre-wrap leading-relaxed" style="overflow-wrap:anywhere">
					{message.content}
				</p>
			</div>
		{:else if message.type === 'IMAGE'}
			<button
				onclick={openLightbox}
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
		{:else if message.type === 'VIDEO'}
			<div class="overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-black max-w-sm">
				<video src={message.content} controls class="max-h-64 w-full object-contain" />
			</div>
		{:else if message.type === 'SYSTEM'}
			<div
				class="text-center text-[11px] tracking-wide font-medium bg-slate-100/30 border border-slate-200/50 px-3 py-1 rounded-full my-1"
			>
				{message.content}
				<span class="text-slate-400 font-normal ml-1">({formatDate(message.sentAt)})</span>
			</div>
		{/if}
		{#if !isSystem && !message.isUnsent}
			<div
				class="absolute -top-6 z-20 hidden group-hover:flex items-center gap-1 bg-white border border-slate-200
				shadow-md rounded-full px-2 py-1 transition-all fade-in zoom-in-95
				{message.isMine ? 'right-2' : 'left-2'}"
			>
				<div class="flex items-center gap-0.5 border-r border-slate-100 pr-1.5 mr-0.5">
					{#each ['👍', '❤️', '😂', '😮', '😢', '🙏'] as emoji (emoji)}
						<button
							onclick={() => handleReact(message.id, emoji)}
							class="hover:scale-125 active:scale-90 transition-transform text-base p-0.5 rounded-full duration-700"
							title="React with {emoji}"
						>
							{emoji}
						</button>
					{/each}
				</div>

				<button
					onclick={() => handleReply(message)}
					class="text-xs font-medium text-slate-600 hover:bg-slate-50 px-2 py-1 rounded-full flex items-center gap-1 transition-colors"
				>
					↩
				</button>

				{#if message.isMine}
					<button
						onclick={() => handleDelete(message)}
						class="text-xs font-medium text-slate-600 hover:bg-slate-50 px-2 py-1 rounded-full flex items-center gap-1 transition-colors"
					>
						🗑️
					</button>
				{/if}
			</div>
		{/if}
	</div>
</div>
