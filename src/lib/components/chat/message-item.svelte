<script lang="ts">
	import type { Message, MessageReactPayload } from '$lib/types/message';
	import { formatDate } from '$lib/utils/date';
	import 'photoswipe/dist/photoswipe.css';
	import UserAvatar from '../common/user-avatar.svelte';
	import UserBadge from '../common/user-badge.svelte';
	import { CircleAlert, CircleCheck, LoaderCircle } from '@lucide/svelte';

	import { MessageContent, MessageReactions, MessageReply, MessageToolbar } from './message';

	let {
		message,
		onImageLoad,
		handleReply,
		handleDelete,
		sendReact,
		openReactionId,
		setOpenReactionId,
		onOpenLightbox
	} = $props<{
		message: Message;
		onImageLoad?: () => void;
		handleReply?: (message: Message) => void;
		handleDelete?: (message: Message) => void;
		sendReact?: (payload: MessageReactPayload) => void;
		openReactionId: number | null;
		setOpenReactionId: (id: number | null) => void;
		onOpenLightbox?: (message: Message, imgElement?: HTMLImageElement) => void;
	}>();

	const isSystem = $derived(message.type === 'SYSTEM');

	let pressTimer: ReturnType<typeof setTimeout>;

	function handlePressStart(id: number) {
		clearTimeout(pressTimer);

		pressTimer = setTimeout(() => {
			setOpenReactionId(id);
		}, 400);
	}

	function handlePressEnd() {
		clearTimeout(pressTimer);
	}
</script>

<div
	id="msg-{message.id}"
	class:justify-end={!isSystem && message.isMine}
	class:justify-start={!isSystem && !message.isMine}
	class:justify-center={isSystem}
	class="flex gap-2 w-full my-0.5"
>
	{#if !isSystem && !message.isMine}
		<UserAvatar user={message.sender} />
	{/if}
	<div
		onmousedown={(e) => {
			e.stopPropagation();
			handlePressStart(message.id);
		}}
		ontouchstart={(e) => {
			e.stopPropagation();
			handlePressStart(message.id);
		}}
		onmouseup={handlePressEnd}
		role="button"
		tabindex="0"
		onmouseleave={handlePressEnd}
		class:pb-5={message.reactions?.length > 0}
		ontouchend={handlePressEnd}
		class="flex flex-col gap-0.5 max-w-[85%] group relative {message.isMine
			? 'self-end'
			: 'self-start'}"
	>
		{#if !isSystem}
			<div
				class="flex items-baseline gap-1.5 px-1 my-1 {message.isMine ? 'self-end' : 'self-start'} 
					{message.isMine ? 'flex-row-reverse' : 'flex-row'}"
			>
				<UserBadge user={message.sender} />
				<span class="text-[9px]">{formatDate(message.sentAt)}</span>
			</div>
		{/if}

		{#if message.repliedTo}
			<MessageReply {message} />
		{/if}
		{#if isSystem}
			<div
				class="text-center mx-auto text-[11px] bg-slate-100/30 border px-3 py-1 rounded-full my-1"
			>
				{message.content}
				<span class="text-slate-400 font-normal ml-1">({formatDate(message.sentAt)})</span>
			</div>
		{:else}
			<MessageContent {message} {onImageLoad} {onOpenLightbox} />
			{@render messageStatus(message)}
			<MessageReactions {message} {sendReact} />
			<MessageToolbar
				{message}
				{openReactionId}
				{setOpenReactionId}
				{handleReply}
				{handleDelete}
				{sendReact}
			/>
		{/if}
	</div>
</div>

{#snippet messageStatus(message: Message)}
	{#if message.status}
		<div class="w-full flex justify-end mt-1">
			{#if message.status === 'sending'}
				<LoaderCircle
					size={13}
					strokeWidth={2}
					class="animate-spin text-slate-400"
					aria-label="Sending"
				/>
			{:else if message.status === 'sent'}
				<CircleCheck size={13} strokeWidth={2.5} class="text-slate-400" aria-label="Sent" />
			{:else if message.status === 'failed'}
				<CircleAlert size={14} strokeWidth={2} class="text-red-400" aria-label="Failed to send" />
			{/if}
		</div>
	{/if}
{/snippet}
