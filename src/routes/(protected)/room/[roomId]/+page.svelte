<script lang="ts">
	import { notificationService } from '$lib/services/notification-service.svelte';
	import { scrollService } from '$lib/services/scroll-service.svelte';
	import { roomService } from '$lib/api/room';
	import {
		validateAndExtractMediaFile,
		extractImageFromPaste,
		extractFileFromDrop
	} from '$lib/utils/upload';
	import { page } from '$app/stores';
	import TypingIndicator from '$lib/components/chat/typing-indicator.svelte';
	import Sidebar from '$lib/components/chat/side-panel.svelte';
	import ChatInput from '$lib/components/chat/chat-input.svelte';
	import RoomHeader from '$lib/components/chat/room-header.svelte';
	import MessageItem from '$lib/components/chat/message-item.svelte';
	import {
		MessageType,
		type Message,
		type ReactionInfo,
		type RepliedMessageInfo,
		type UserInfo
	} from '$lib/types/message';
	import { storageService } from '$lib/api/storage';
	import { createMessagePayload, processIncomingMessage } from '$lib/utils/message';
	import { Button } from '$lib/components/ui/button';
	import { websocketService } from '$lib/services/websocket-service.svelte';
	import { onMount, untrack } from 'svelte';
	import { ArrowDown } from '@lucide/svelte';
	import { useUser } from '$lib/stores/auth.svelte';
	import RoomEffects from '$lib/components/room-effects/room-effects.svelte';

	let roomId = $derived($page.params.roomId);
	const { username: currentUser } = useUser();
	let openReactionId: number | null = $state(null);
	let repliedToMessage = $state<RepliedMessageInfo | null>(null);
	let messages = $state<Message[]>([]);
	let isDragging = $state(false);
	let sidebarOpen = $state(false);
	export function updateMessageReactions(
		currentMessages: Message[],
		payload: {
			messageId: string | number;
			action: 'ADDED' | 'REMOVED';
			reaction: {
				type: string;
				sender: UserInfo;
				reactedAt: string;
			};
		}
	): Message[] {
		const targetId = Number(payload.messageId);
		const action = payload.action;
		const incomingReaction = payload.reaction;

		return currentMessages.map((msg) => {
			if (msg.id !== targetId) return msg;

			const currentReactions = msg.reactions || [];

			if (action === 'ADDED') {
				const exists = currentReactions.some(
					(r) =>
						r.type === incomingReaction.type &&
						r.sender.username === incomingReaction.sender.username
				);
				if (exists) return msg;

				const isMyMessage = msg.sender.username === currentUser;
				const isNotMyOwnReaction = incomingReaction.sender.username !== currentUser;

				if (isMyMessage && isNotMyOwnReaction) {
					const mockReactionMessage: Message = {
						...msg,
						isMine: false,
						type: MessageType.TEXT,
						sender: incomingReaction.sender,
						content: `Reacted ${incomingReaction.type} to your message: "${msg.content || 'Attachment'}"`
					};

					notificationService.triggerPush(mockReactionMessage, roomId);
				}

				const newReaction: ReactionInfo = {
					type: incomingReaction.type,
					sender: incomingReaction.sender,
					reactedAt: incomingReaction.reactedAt || new Date().toISOString()
				};

				return {
					...msg,
					reactions: [...currentReactions, newReaction]
				};
			}

			if (action === 'REMOVED') {
				return {
					...msg,
					reactions: currentReactions.filter(
						(r) =>
							!(
								r.type === incomingReaction.type &&
								r.sender.username === incomingReaction.sender.username
							)
					)
				};
			}

			return msg;
		});
	}

	async function loadChatHistory(targetRoom: string) {
		try {
			const data = await roomService.getRoomMessages(targetRoom);
			messages = (data.data || []).map((msg) => processIncomingMessage(msg, currentUser));
			scrollService.scrollToBottom();
		} catch (err) {
			console.error('Failed to resolve room history channel logs:', err);
		}
	}
	// 1. One-time client mount: Verify user once
	onMount(() => {
		notificationService.init(currentUser);
	});

	$effect(() => {
		const targetRoom = roomId;
		if (!targetRoom) return;
		untrack(() => {
			messages = [];
			loadChatHistory(targetRoom);
			websocketService.connect(targetRoom, currentUser, {
				onMessage(raw) {
					const message = processIncomingMessage(raw, currentUser);
					messages = [...messages, message];
					notificationService.triggerPush(message, targetRoom);
					scrollService.onIncomingMessage();
				},
				onReaction(payload) {
					messages = updateMessageReactions(messages, payload);
				}
			});
		});

		// 3. Cleanup runs when roomId or currentUser changes
		return () => {
			console.log('Cleaning up room:', targetRoom);
			websocketService.disconnect();
		};
	});
	function handleDelete(message: Message) {}

	async function processFile(file: File) {
		const fileType = validateAndExtractMediaFile(file);
		if (!fileType) {
			alert('Only images and videos are allowed!');
			return;
		}
		try {
			let contentUrl = '';
			if (fileType === 'VIDEO') {
				const userHandle = 'general';
				const response = await storageService.uploadVideoToExpress(userHandle, file);
				if (!response.ok) throw new Error('Express server video processing rejected.');
				contentUrl = storageService.getVideoStreamUrl(userHandle, file.name);
			} else if (fileType === 'IMAGE') {
				const filename = `${crypto.randomUUID()}-${file.name}`;
				const { uploadUrl, downloadUrl } = await storageService.getPresignedUrl(filename);
				const uploadResponse = await storageService.uploadFileToMinio(uploadUrl, file);

				if (!uploadResponse.ok) throw new Error('MinIO image upload failed');
				contentUrl = downloadUrl;
			}

			const payload = createMessagePayload({
				content: contentUrl,
				type: fileType,
				replyTo: null
			});
			websocketService.sendMessage(payload);
		} catch (error) {
			console.error('Asset upload routing engine exception:', error);
		}
	}

	function handlePaste(event: ClipboardEvent) {
		const file = extractImageFromPaste(event);
		if (file) processFile(file);
	}

	function handleDrop(event: DragEvent) {
		const file = extractFileFromDrop(event);
		if (file) {
			isDragging = false;
			processFile(file);
		}
	}
</script>

<div class="flex h-screen max-h-screen overflow-hidden">
	<Sidebar {sidebarOpen} {roomId} />
	<main
		class="relative flex-1 flex flex-col min-w-0 h-full"
		onpaste={handlePaste}
		ondragover={(e) => {
			e.preventDefault();
			isDragging = true;
		}}
		ondragleave={() => (isDragging = false)}
		ondrop={handleDrop}
	>
	<!-- Background layer -->
	<RoomEffects />
	<div class="relative z-10 flex flex-col h-full">
		{#if !scrollService.isNearBottom}
			<Button
				class="absolute left-[50%] -translate-x-1/2 bottom-24 z-50 flex"
				onclick={() => scrollService.scrollToBottom()}
			>
				<ArrowDown />
			</Button>
		{/if}
		{#if isDragging}
			<div
				class="flex-center absolute inset-0 bg-blue-600/20 backdrop-blur-sm border-2 border-dashed border-blue-500 z-50 pointer-events-none"
			>
				<p class="text-xl font-semibold text-blue-400 animate-pulse">Drop image here to send...</p>
			</div>
		{/if}

		<RoomHeader {roomId} {sidebarOpen} onlineUsers={websocketService.onlineUsers} />

		<div
			use:scrollService.use
			class="flex flex-1 flex-col gap-2 w-full p-4 overflow-y-auto [&::-webkit-scrollbar]:hidden"
		>
			{#each messages as message (message.sentAt)}
				<MessageItem
					{message}
					onImageLoad={scrollService.scrollToBottom}
					{openReactionId}
					setOpenReactionId={(id) => (openReactionId = id)}
					handleReply={(msg) => (repliedToMessage = msg)}
					{handleDelete}
					sendReact={websocketService.sendReaction}
				/>
			{/each}
			<TypingIndicator typingUsers={websocketService.typingUsers} />
		</div>

		<ChatInput
			{roomId}
			bind:repliedToMessage
			onSendMessage={websocketService.sendMessage}
			onTypingStateChange={websocketService.sendTyping}
			onFileUploadRequested={processFile}
		/>
	</div>
	</main>
</div>
<svelte:window onclick={() => (openReactionId = null)} />
