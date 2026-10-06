<script lang="ts">
	import type { Message } from '$lib/types/message';
	import { formatDate } from '$lib/utils/date';
	import { CircleAlert, CircleCheck, LoaderCircle } from '@lucide/svelte';
	import 'photoswipe/dist/photoswipe.css';
	import TitleBadge from '../common/title-badge.svelte';

	import { MessageContent, MessageReactions, MessageReply, MessageToolbar } from './message';

	let {
		message,
		lineNumber,
		isLastMessage,
		onImageLoad,
		handleReply,
		handleDelete,
		sendReact,
		openReactionId,
		setOpenReactionId,
		onOpenLightbox
	} = $props<{
		message: Message;
		lineNumber: number;
		isLastMessage: boolean;
		onImageLoad?: () => void;
		handleReply?: (message: Message) => void;
		handleDelete?: (message: Message) => void;
		sendReact?: (messageId: number, emoji: string) => void;
		openReactionId: number | null;
		setOpenReactionId: (id: number | null) => void;
		onOpenLightbox?: (message: Message, imgElement?: HTMLImageElement) => void;
	}>();

	const isSystem = $derived(message.type === 'SYSTEM');
	const formattedLineNumber = $derived(String(lineNumber).padStart(2, '0'));

	let pressTimer: ReturnType<typeof setTimeout>;

	function handlePressStart(id: number) {
		clearTimeout(pressTimer);
		pressTimer = setTimeout(() => setOpenReactionId(id), 400);
	}

	function handlePressEnd() {
		clearTimeout(pressTimer);
	}
</script>

<div
	id="msg-{message.id}"
	class="group/message grid w-full grid-cols-[3.75rem_minmax(0,1fr)] border-l-2 border-transparent py-1.5 transition-colors hover:bg-[#14171d] focus-within:bg-[#14171d]"
>
	<div
		class="select-none border-r border-[#20232a] pr-3 text-right text-[11px] leading-5 text-[#656b76] tabular-nums"
		aria-hidden="true"
	>
		{formattedLineNumber}
	</div>

	{#if isSystem}
		<div class="min-w-0 px-4 text-xs leading-5 text-[#656b76] italic">
			<span class="text-[#4f5662]">//</span>
			{message.content}
			<span class="ml-1 text-[#4f5662]">· {formatDate(message.sentAt)}</span>
		</div>
	{:else}
		<div
			role="button"
			tabindex="0"
			onmousedown={(event) => {
				event.stopPropagation();
				handlePressStart(message.id);
			}}
			ontouchstart={(event) => {
				event.stopPropagation();
				handlePressStart(message.id);
			}}
			onmouseup={handlePressEnd}
			onmouseleave={handlePressEnd}
			ontouchend={handlePressEnd}
			class="relative min-w-0 px-4"
		>
			<div class="flex min-w-0 items-center gap-2 text-[11px] leading-5">
				<span
					class="truncate font-semibold {message.isMine ? 'text-[#d276c9]' : 'text-[#8b7cf6]'}"
					title={message.sender.displayName}
				>
					@{message.sender.displayName}
				</span>
				{#if message.sender.title}
					<TitleBadge user={message.sender} variant="compact" animationMode="interaction" />
				{/if}
				<span class="text-[#656b76]">·</span>
				<span class="shrink-0 text-[#9097a3] tabular-nums">{formatDate(message.sentAt)}</span>
				{@render messageStatus(message, isLastMessage)}
			</div>

			<div class="min-w-0 text-[13px] leading-5 text-[#d8dbe1]">
				{#if message.repliedTo}
					<MessageReply {message} />
				{/if}
				<MessageContent {message} {onImageLoad} {onOpenLightbox} />
				<MessageReactions {message} {sendReact} />
			</div>

			<MessageToolbar
				{message}
				{openReactionId}
				{setOpenReactionId}
				{handleReply}
				{handleDelete}
				{sendReact}
			/>
		</div>
	{/if}
</div>

{#snippet messageStatus(message: Message, isLastMessage: boolean)}
	{#if message.status === 'sending'}
		<LoaderCircle
			size={12}
			strokeWidth={2}
			class="animate-spin text-[#656b76]"
			aria-label="Sending"
		/>
	{:else if message.status === 'sent' && isLastMessage}
		<CircleCheck size={12} strokeWidth={2} class="text-[#656b76]" aria-label="Sent" />
	{:else if message.status === 'failed'}
		<CircleAlert size={13} strokeWidth={2} class="text-destructive" aria-label="Failed to send" />
	{/if}
{/snippet}
