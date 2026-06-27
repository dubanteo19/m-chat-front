<script lang="ts">
	import type { MessagePayload } from '$lib/types/message';
	import { createMessagePayload } from '$lib/utils/message';
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

	let inputMessage = $state('');
	let showStickerPicker = $state(false);
	let textareaRef = $state<HTMLTextAreaElement | null>(null);
	let fileInputRef = $state<HTMLInputElement | null>(null);
	let typingTimeout: NodeJS.Timeout;
	let amITyping = false;

	function handleTextAreaInput(e: Event) {
		const textarea = e.currentTarget as HTMLTextAreaElement;
		textarea.style.height = 'auto';
		textarea.style.height = `${Math.min(textarea.scrollHeight, 144)}px`;

		// Handle typing indicator
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

		const payload = createMessagePayload({
			content: trimmed,
			replyTo: repliedToMessage?.id || null,
			type: 'TEXT'
		});

		onSendMessage(payload);

		inputMessage = '';
		repliedToMessage = null;
		if (textareaRef) {
			textareaRef.style.height = '46px';
		}

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
		}
	}

	function handleFileUpload(file: File) {
		onFileUploadRequested?.(file);
	}

	function sendSticker(stickerUrl: string) {
		onSendMessage(
			createMessagePayload({
				content: stickerUrl,
				type: 'STICKER',
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
			<button
				type="button"
				onclick={() => fileInputRef?.click()}
				class="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors h-[46px]"
				title="Upload Asset"
			>
				📎
			</button>

			<button
				type="button"
				onclick={() => (showStickerPicker = !showStickerPicker)}
				class="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-xl transition-colors h-[46px] flex items-center justify-center"
				title="Send a Sticker"
			>
				🎭
			</button>

			{#if showStickerPicker}
				<div
					class="absolute bottom-full left-0 mb-3 z-50 w-64 bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200"
				>
					<div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-700">
						<span class="text-xs font-bold text-slate-400 uppercase tracking-wider"
							>Select Sticker</span
						>
						<button
							type="button"
							onclick={() => (showStickerPicker = false)}
							class="text-xs text-slate-400 hover:text-white">✕</button
						>
					</div>

					<StickerPicker {sendSticker} />
				</div>
			{/if}
		</div>

		<div
			class="flex-1 flex flex-col bg-slate-700 border border-slate-600 rounded-lg focus-within:border-blue-500 transition-colors overflow-hidden"
		>
			{#if repliedToMessage}
				<ReplyPreview {repliedToMessage} onCancelReply={() => (repliedToMessage = null)} />
			{/if}

			<textarea
				bind:this={textareaRef}
				bind:value={inputMessage}
				oninput={handleTextAreaInput}
				onkeydown={handleKeyDown}
				rows="1"
				placeholder="Message #{roomId}..."
				class="w-full bg-transparent px-3 py-3 text-white placeholder-slate-400 resize-none max-h-36 overflow-y-auto min-h-[46px] leading-normal [&::-webkit-scrollbar]:hidden outline-none border-none ring-0 focus:outline-none focus:ring-0"
			></textarea>
		</div>

		<button
			type="submit"
			class="px-4 md:px-6 h-[46px] bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-blue-900/20 whitespace-nowrap"
		>
			Send
		</button>
	</form>
</footer>
