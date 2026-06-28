<script lang="ts">
	import { MessageType, type Message } from '$lib/types/message';

	let {
		message,
		imgElement = $bindable(),
		onImageLoad,
		openLightbox
	} = $props<{
		message: Message;
		imgElement?: HTMLImageElement;
		onImageLoad?: () => void;
		openLightbox: (e: MouseEvent) => void;
	}>();
</script>

{#if message.isDeleted}
	<div
		class="rounded-2xl border px-4 py-2 text-sm italic text-slate-400 bg-slate-50 border-slate-200
		{message.repliedTo ? 'rounded-tl-none rounded-tr-none' : ''}
		{message.isMine ? 'rounded-br-none' : 'rounded-bl-none'}"
	>
		<span>{message.content}</span>
	</div>
{:else if message.type === MessageType.TEXT}
	<div
		class="inline-block w-auto max-w-full rounded-2xl border px-4 py-2 text-sm shadow-sm
		{message.repliedTo ? 'rounded-t-none' : ''}
		{message.isMine
			? 'border-indigo-100 bg-indigo-600 text-white rounded-br-none'
			: 'border-slate-200 bg-white text-slate-800 rounded-bl-none'}"
	>
		<p class="whitespace-pre-wrap leading-relaxed" style="overflow-wrap: anywhere;">
			{message.content}
		</p>
	</div>
{:else if message.type === MessageType.IMAGE}
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
{:else if message.type === MessageType.STICKER}
	<div class="block my-1 select-none pointer-events-none">
		<img
			onload={onImageLoad}
			src={message.content}
			alt="Sticker"
			class="w-28 h-28 object-contain animate-in zoom-in-95 duration-150"
		/>
	</div>
{:else if message.type === MessageType.VIDEO}
	<div class="overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-black max-w-sm">
		<video src={message.content} controls class="max-h-64 w-full object-contain">
			<track kind="captions" />
		</video>
	</div>
{/if}
