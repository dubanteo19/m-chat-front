<script lang="ts">
	import { useUser } from '$lib/stores/auth.svelte';
	import { MessageType, type MessagePayload } from '$lib/types/message';
	import { createMessagePayload } from '$lib/utils/message';
	import { Send } from '@lucide/svelte';
	import { useRoom } from '../room/room-state.svelte';
	import { Button } from '../ui/button';
	import ChatEditor from './chat-input/chat-editor.svelte';
	import ReplyPreview from './chat-input/reply-preview.svelte';
	import StickerPicker from './chat-input/sticker-picker.svelte';
	interface ChatInputProps {
		roomId: string | number;
		onSendMessage: (payload: MessagePayload) => void;
		onTypingStateChange: (isTyping: boolean) => void;
		onFileUploadRequested: (file: File) => void;
		repliedToMessage: any;
	}

	let {
		roomId,
		onSendMessage,
		onTypingStateChange,
		onFileUploadRequested,
		repliedToMessage = $bindable(null)
	}: ChatInputProps = $props();

	const { currentUser } = $derived(useUser());

	let inputMessage = $state('');
	let showStickerPicker = $state(false);
	let chatEditorRef = $state<ChatEditor | null>(null);
	let fileInputRef = $state<HTMLInputElement | null>(null);
	let typingTimeout: NodeJS.Timeout;
	let amITyping = false;
	const roomState = useRoom();
	$effect(() => {
		if (repliedToMessage) {
			chatEditorRef?.focus();
		}
	});

	function handleEditorInput(value: string) {
		inputMessage = value;

		if (!amITyping) {
			amITyping = true;
			onTypingStateChange?.(true);
		}

		clearTimeout(typingTimeout);

		typingTimeout = setTimeout(() => {
			amITyping = false;
			onTypingStateChange?.(false);
		}, 2000);
	}

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();

		const trimmed = inputMessage.trim();
		if (!trimmed && !repliedToMessage) return;
		const payload: MessagePayload = {
			roomId: String(roomId),
			content: trimmed,
			replyTo: repliedToMessage?.id || null,
			type: MessageType.TEXT
		};

		onSendMessage(payload);

		inputMessage = '';
		repliedToMessage = null;
		chatEditorRef?.clear();
		if (amITyping) {
			clearTimeout(typingTimeout);
			amITyping = false;
			onTypingStateChange?.(false);
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e as unknown as SubmitEvent);
			return true;
		}

		return false;
	}

	function handleFileUpload(file: File) {
		onFileUploadRequested?.(file);
	}

	function sendSticker(stickerUrl: string) {
		onSendMessage(
			createMessagePayload({
				content: stickerUrl,
				type: MessageType.STICKER,
				replyTo: repliedToMessage?.id
			})
		);

		showStickerPicker = false;
		if (repliedToMessage) repliedToMessage = null;
	}
</script>

<footer class="p-3 md:p-4 border-t border-slate-700 bg-slate-800/30">
	<form onsubmit={handleSubmit} class="flex gap-2 md:gap-3 items-end">
		<input
			bind:this={fileInputRef}
			type="file"
			accept="image/*,video/*"
			class="hidden"
			onchange={(e) => {
				const target = e.currentTarget;
				if (target.files?.[0]) handleFileUpload(target.files[0]);
			}}
		/>

		<div class="relative flex gap-1 shrink-0">
			<Button onclick={() => fileInputRef?.click()} class="p-3  h-11.5" title="Upload Asset">
				📎
			</Button>

			<Button
				onclick={() => (showStickerPicker = !showStickerPicker)}
				class="p-3 h-11"
				title="Send a Sticker"
			>
				🎭
			</Button>

			{#if showStickerPicker}
				<div
					class="absolute bottom-full left-0 mb-3 z-50 w-84 rounded-xl p-3 fade-in bg-background slide-in-from-bottom-2 duration-200"
				>
					<div class="flex items-center justify-between pb-2 mb-2">
						<span class="text-sm uppercase tracking-wider">Select Sticker</span>
						<Button onclick={() => (showStickerPicker = false)}>✕</Button>
					</div>

					<StickerPicker {sendSticker} />
				</div>
			{/if}
		</div>

		<div
			class="relative flex-1 bg-background border-secondary/20 border rounded-2xl transition-colors min-h-11 max-h-36"
		>
			{#if repliedToMessage}
				<ReplyPreview {repliedToMessage} onCancelReply={() => (repliedToMessage = null)} />
			{/if}

			<ChatEditor
				bind:this={chatEditorRef}
				value={inputMessage}
				onkeydown={handleKeyDown}
				oninput={handleEditorInput}
				members={roomState.members.filter((m) => m.user.id !== currentUser?.id)}
			/>
		</div>

		<Button type="submit" class=" h-11  font-medium rounded-lg   whitespace-nowrap">
			<Send />
		</Button>
	</form>
</footer>
