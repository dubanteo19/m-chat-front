<script lang="ts">
	import { roomService } from '$lib/api/room';
	import { storageService } from '$lib/api/storage';
	import ChatInput from '$lib/components/chat/chat-input.svelte';
	import MessageItem from '$lib/components/chat/message-item.svelte';
	import RoomHeader from '$lib/components/chat/room-header.svelte';
	import Sidebar from '$lib/components/chat/side-panel.svelte';
	import TypingIndicator from '$lib/components/chat/typing-indicator.svelte';
	import type { RoomEffect } from '$lib/components/room-effects/effects/particles';
	import RoomEffects from '$lib/components/room-effects/room-effects.svelte';
	import { ROOM_MEMBERS_KEY, RoomState } from '$lib/components/room/room-state.svelte';
	import { Button } from '$lib/components/ui/button';
	import { notificationService } from '$lib/services/notification-service.svelte';
	import { scrollService } from '$lib/services/scroll-service.svelte';
	import { websocketService } from '$lib/services/websocket-service.svelte';
	import { useUser } from '$lib/stores/auth.svelte';
	import {
		MessageType,
		type Message,
		type ReactionInfo,
		type RepliedMessageInfo
	} from '$lib/types/message';
	import type { UserInfo } from '$lib/types/user';
	import {
		createMessagePayload,
		createRoomEffectMessage,
		processIncomingMessage
	} from '$lib/utils/message';
	import {
		extractFileFromDrop,
		extractImageFromPaste,
		validateAndExtractMediaFile
	} from '$lib/utils/upload';
	import { ArrowDown } from '@lucide/svelte';
	import PhotoSwipe from 'photoswipe';
	import { onMount, setContext, untrack } from 'svelte';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	let roomId = $derived(data.room.id);
	const roomState = new RoomState(() => roomId);
	const { currentUser } = $derived(useUser());
	let openReactionId: number | null = $state(null);
	let roomEffect = $state<RoomEffect | null>(null);
	let repliedToMessage = $state<RepliedMessageInfo | null>(null);
	let messages = $state<Message[]>([]);
	let isDragging = $state(false);
	let sidebarOpen = $state(false);

	setContext(ROOM_MEMBERS_KEY, roomState);

	function updateMessageReactions(
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

				const isMyMessage = msg.sender.username === currentUser.username;
				const isNotMyOwnReaction = incomingReaction.sender.username !== currentUser.username;

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

	const loadChatHistory = async (targetRoom: string) => {
		try {
			const data = await roomService.getRoomMessages(targetRoom);
			messages = (data.data || []).map((msg) => processIncomingMessage(msg, currentUser.username));
			scrollService.scrollToBottom();
		} catch (err) {
			console.error('Failed to resolve room history channel logs:', err);
		}
	};

	onMount(() => {
		notificationService.init();
	});

	$effect(() => {
		const currentRoomId = roomId;
		if (!currentRoomId || currentRoomId === 'hall') return;

		// 2. Wrap state initialization & API calls in untrack to prevent infinite loops
		untrack(() => {
			messages = [];
			loadChatHistory(currentRoomId);
			websocketService.connect(currentRoomId, currentUser, {
				onMessage(raw) {
					const message = processIncomingMessage(raw, currentUser.username);
					messages = [...messages, message];
					if (message.sender.username !== currentUser.username && currentUser.allowNotify)
						notificationService.triggerPush(message, currentRoomId);
					scrollService.onIncomingMessage();
				},
				onReaction(payload) {
					messages = updateMessageReactions(messages, payload);
				},
				onDeleteMessage(payload) {
					const targetId = Number(payload.messageId);
					messages = messages.map((msg) => {
						if (msg.id !== targetId) return msg;
						return {
							...msg,
							content: 'This message was deleted.',
							isDeleted: true
						};
					});
				},
				onRoomEffect(payload) {
					roomEffect = payload.effect;
					const effectMsg = createRoomEffectMessage({
						sender: payload.sender,
						effect: payload.effect
					});
					messages = [...messages, effectMsg];
				}
			});
		});

		// Cleanup only when roomId changes or component unmounts
		return () => {
			websocketService.disconnect();
		};
	});
	function handleDelete(message: Message) {
		if (!roomId) return;
		roomService.deleteMessage(roomId, message.id);
	}

	function onOpenLightbox(selectedMsg: Message, imgElement?: HTMLImageElement) {
		// 1. Filter image messages
		const imageMessages = messages.filter((msg) => msg.type === 'IMAGE' && !msg.isDeleted);

		if (imageMessages.length === 0) return;

		// 2. Map gallery items
		const dataSource = imageMessages.map((msg) => {
			const isSelected = msg.id === selectedMsg.id;
			return {
				src: msg.content,
				width: isSelected && imgElement ? imgElement.naturalWidth : 1200,
				height: isSelected && imgElement ? imgElement.naturalHeight : 900,
				alt: 'Chat attachment'
			};
		});

		// 3. Find active index
		const initialIndex = imageMessages.findIndex((msg) => msg.id === selectedMsg.id);
		console.log('Opening lightbox for message ID:', selectedMsg.id, 'at index:', initialIndex);
		// 4. Instantiate PhotoSwipe
		const pswp = new PhotoSwipe({
			dataSource,
			index: initialIndex >= 0 ? initialIndex : 0,
			imageClickAction: 'zoom-or-close',
			bgClickAction: 'close',
			wheelToZoom: true,
			secondaryZoomLevel: 1.5,
			maxZoomLevel: 3,
			bgOpacity: 0.95,
			loop: true,
			padding: { top: 20, bottom: 40, left: 100, right: 100 },
			closeOnVerticalDrag: true
		});

		pswp.init();
	}

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
	<Sidebar bind:sidebarOpen {roomId} />

	{#if roomId === 'hall'}
		<div class="flex-center h-full w-full flex-col">
			<Button onclick={() => (sidebarOpen = true)} aria-label="Open sidebar">☰</Button>
			<p class="text-lg text-slate-400">Select a room to start chatting</p>
		</div>
	{/if}

	{#if roomId !== 'hall'}
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
			<RoomEffects {roomEffect} />
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
						<p class="text-xl font-semibold text-blue-400 animate-pulse">
							Drop image here to send...
						</p>
					</div>
				{/if}

				<RoomHeader
					sendRaw={websocketService.sendRaw}
					selectedRoomEffect={roomEffect}
					{roomId}
					bind:sidebarOpen
					onlineUsers={websocketService.onlineUsers}
				/>

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
							{onOpenLightbox}
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
	{/if}
</div>
<svelte:window onclick={() => (openReactionId = null)} />
