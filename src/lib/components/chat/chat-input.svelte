<script lang="ts">
	import { useUser } from '$lib/stores/auth.svelte';

	import * as Popover from '$lib/components/ui/popover/index.js';
	import { MessageType, type MessagePayload } from '$lib/types/message';
	import { Paperclip, Send, Smile } from '@lucide/svelte';
	import { useRoom } from '../room/room-state.svelte';
	import { Button } from '../ui/button';
	import ChatEditor from './chat-input/chat-editor.svelte';
	import ReplyPreview from './chat-input/reply-preview.svelte';
	import ExpressionPicker from './chat-input/expression-picker.svelte';
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
	let showExpressionPicker = $state(false);
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
		const payload: MessagePayload = {
			content: stickerUrl,
			replyTo: null,
			type: MessageType.STICKER
		};

		onSendMessage(payload);

		showExpressionPicker = false;
		if (repliedToMessage) repliedToMessage = null;
	}
</script>

<footer class="shrink-0 border-t border-border bg-[#101216] p-2.5 md:px-4">
	<form onsubmit={handleSubmit} class="flex items-end gap-2">
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

		<div class="relative flex shrink-0 gap-1">
			<Button
				onclick={() => fileInputRef?.click()}
				variant="outline"
				size="icon"
				class="size-10 border-border bg-[#15181e] text-muted-foreground hover:text-foreground"
				title="Upload asset"
			>
				<Paperclip size={17} />
			</Button>

			<Popover.Root
				open={showExpressionPicker}
				onOpenChange={(open) => (showExpressionPicker = open)}
			>
				<Popover.Trigger>
					<Button
						variant="outline"
						size="icon"
						class="size-10 border-border bg-[#15181e] text-muted-foreground hover:text-foreground"
						title="Send a sticker"
					>
						<Smile size={17} />
					</Button>
				</Popover.Trigger>
				<Popover.Content
					align="start"
					sideOffset={5}
					class="w-[min(520px,calc(100vw-2rem))] rounded-md border-border bg-popover p-2.5 text-popover-foreground shadow-xl"
				>
					<ExpressionPicker onClickItem={sendSticker} />
				</Popover.Content>
			</Popover.Root>
		</div>

		<div
			class="relative min-h-10 max-h-36 flex-1 overflow-hidden rounded-md border border-border bg-[#15181e] transition-colors focus-within:border-[#6257a8]"
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

		<Button
			type="submit"
			size="icon"
			class="size-10 shrink-0 rounded-md bg-[#6d4aff] text-white shadow-[0_0_12px_rgba(109,74,255,0.25)] hover:bg-[#7c5cff]"
			title="Send message"
		>
			<Send size={17} />
		</Button>
	</form>
</footer>
