<script lang="ts">
	import { MessageType, type MessagePayload } from '$lib/types/message';
	import { createMessagePayload } from '$lib/utils/message';
	import { Send } from '@lucide/svelte';
	import { Button } from '../ui/button';
	import ReplyPreview from './chat-input/reply-preview.svelte';
	import StickerPicker from './chat-input/sticker-picker.svelte';
	import type { RoomMemberInfo } from '$lib/types/user';
	interface ChatInputProps {
		roomId: string | number;
		roomMembers: RoomMemberInfo[];
		onSendMessage: (payload: MessagePayload) => void;
		onTypingStateChange: (isTyping: boolean) => void;
		onFileUploadRequested: (file: File) => void;
		repliedToMessage: any;
	}

	let {
		roomId,
		roomMembers,
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

	let filteredMembers = $derived(
		roomMembers.filter((m) => m.user.username.toLowerCase().includes(mentionQuery.toLowerCase()))
	);
	//mention
	let showMentionMenu = $state(false);
	let mentionQuery = $state('');
	let selectedMentionIndex = $state(0);

	$effect(() => {
		if (repliedToMessage && textareaRef) {
			textareaRef.focus();
		}
	});

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
		checkMentionTrigger(textarea);
	}
	function selectMention(username: string) {
		if (!textareaRef) return;

		const cursorPosition = textareaRef.selectionStart;
		const textBeforeCursor = inputMessage.slice(0, cursorPosition);
		const textAfterCursor = inputMessage.slice(cursorPosition);

		// Replace the typed @query with @username + space
		const updatedTextBefore = textBeforeCursor.replace(/@([a-zA-Z0-9_-]*)$/, `@${username} `);

		inputMessage = updatedTextBefore + textAfterCursor;
		showMentionMenu = false;

		// Re-focus and set cursor after inserted mention
		setTimeout(() => {
			if (textareaRef) {
				textareaRef.focus();
				const newCursorPos = updatedTextBefore.length;
				textareaRef.setSelectionRange(newCursorPos, newCursorPos);
			}
		}, 0);
	}
	function checkMentionTrigger(textarea: HTMLTextAreaElement) {
		console.log('Checking mention trigger...');
		const cursorPosition = textarea.selectionStart;
		const textBeforeCursor = textarea.value.slice(0, cursorPosition);

		const match = textBeforeCursor.match(/@([a-zA-Z0-9_-]*)$/);

		if (match) {
			mentionQuery = match[1];
			showMentionMenu = true;
			selectedMentionIndex = 0; // Reset focus to top item
		} else {
			showMentionMenu = false;
		}
	}
	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();

		const trimmed = inputMessage.trim();
		if (!trimmed && !repliedToMessage) return;

		const payload = createMessagePayload({
			content: trimmed,
			replyTo: repliedToMessage?.id || null,
			type: MessageType.TEXT
		});

		onSendMessage(payload);

		inputMessage = '';
		repliedToMessage = null;
		showMentionMenu = false;
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
		if (showMentionMenu && filteredMembers.length > 0) {
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				selectedMentionIndex = (selectedMentionIndex + 1) % filteredMembers.length;
				return;
			}
			if (e.key === 'ArrowUp') {
				e.preventDefault();
				selectedMentionIndex =
					(selectedMentionIndex - 1 + filteredMembers.length) % filteredMembers.length;
				return;
			}
			if (e.key === 'Enter' || e.key === 'Tab') {
				e.preventDefault();
				selectMention(filteredMembers[selectedMentionIndex].user.username);
				return;
			}
			if (e.key === 'Escape') {
				e.preventDefault();
				showMentionMenu = false;
				return;
			}
		}
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
			<Button onclick={() => fileInputRef?.click()} class="p-3  h-[46px]" title="Upload Asset">
				📎
			</Button>

			<Button
				onclick={() => (showStickerPicker = !showStickerPicker)}
				class="p-3 h-[46px] "
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
			class="relative flex-1 flex flex-col bg-background border-secondary/20 border rounded-2xl transition-colors "
		>
			{#if repliedToMessage}
				<ReplyPreview {repliedToMessage} onCancelReply={() => (repliedToMessage = null)} />
			{/if}
			{#if showMentionMenu && filteredMembers.length > 0}
				<div
					class="absolute bottom-full mb-2 left-0 z-50 max-h-48 w-64 overflow-y-auto rounded-lg border bg-white shadow-lg"
				>
					{#each filteredMembers as member (member.user.username)}
						<button
							type="button"
							class="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-blue-50"
							onclick={() => selectMention(member.user.username)}
						>
							<span class="font-medium text-gray-800">@{member.user.username}</span>
						</button>
					{/each}
				</div>
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

		<Button type="submit" class=" h-11  font-medium rounded-lg   whitespace-nowrap">
			<Send />
		</Button>
	</form>
</footer>
