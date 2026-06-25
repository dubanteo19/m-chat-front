<script lang="ts">
	import { goto } from '$app/navigation';
	import { base, resolve } from '$app/paths';
	import { page } from '$app/stores';
	import { PUBLIC_BASE_URL } from '$env/static/public';
	import { roomService } from '$lib/api/room';
	import { storageService } from '$lib/api/storage';
	import MessageItem from '$lib/components/chat/message-item.svelte';
	import type { Message } from '$lib/types/message';
	import { truncateText } from '$lib/utils/text';
	import { tick } from 'svelte';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { v4 as uuidv4 } from 'uuid';
	let roomId = $derived($page.params.roomId);

	let pingInterval: ReturnType<typeof setInterval>;
	let currentUser = $state('');
	let messages = $state<Message[]>([]);
	let fileInputRef = $state<HTMLInputElement>();
	let textareaRef = $state<HTMLTextAreaElement>();
	let isDragging = $state(false);
	let sidebarOpen = $state(false);
	let repliedToMessage = $state<Message | null>(null);
	let inputMessage = $state('');
	let notificationStatus = $state('default');
	let chatContainer = $state<HTMLDivElement>();
	let typingUsers = $state<string[]>([]);
	let typingTimeout: NodeJS.Timeout;
	let amITyping = false;
	let socket: WebSocket;

	// Dynamic wrapper ensuring local metadata identity parses out flawlessly
	function processIncomingMessage(rawMsg: any): Message {
		return {
			...rawMsg,
			isMine: rawMsg.sender.username === currentUser
		};
	}

	function handleSystemSignals(parsedPayload: any) {
		const { type, sender } = parsedPayload;
		// Skip if the signal originated from our own client instance
		if (sender === currentUser) return;

		if (type === 'TYPING_START') {
			if (!typingUsers.includes(sender)) {
				typingUsers = [...typingUsers, sender];
			}
		} else if (type === 'TYPING_STOP') {
			typingUsers = typingUsers.filter((u) => u !== sender);
		}
	}

	// Unified loader for your Quarkus pagination endpoint
	async function loadChatHistory(targetRoom: string) {
		try {
			const data = await roomService.getRoomMessages(targetRoom);
			messages = (data.data || []).map((msg) => processIncomingMessage(msg));
			await tick();
			if (chatContainer) {
				chatContainer.scrollTop = chatContainer.scrollHeight;
			}
		} catch (err) {
			console.error('Failed to resolve room history channel logs:', err);
		}
	}

	function triggerPushNotification(msg: Message) {
		if (msg.isMine || document.visibilityState === 'visible' || msg.type === 'SYSTEM') return;
		if (notificationStatus === 'granted') {
			let bodyText = msg.content;

			if (msg.type === 'IMAGE') bodyText = '📷 Sent an image file attachment';
			if (msg.type === 'VIDEO') bodyText = '🎥 Sent a video streaming attachment';

			if (typeof window !== 'undefined' && 'Notification' in window) {
				const notification = new Notification(`#${roomId} - ${msg.sender.displayName}`, {
					body: bodyText,
					icon: '/favicon.png'
				});

				notification.onclick = () => {
					window.focus();
				};
			}
		}
	}
	$effect(() => {
		const storedUser = localStorage.getItem('m_user');
		if (!storedUser) {
			const currentPath = $page.url.pathname + $page.url.search;
			const params = new SvelteURLSearchParams();
			params.set('redirectTo', currentPath);
			const destination = `${resolve('/login')}?${params.toString()}`;
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			goto(destination);
			return;
		}
		currentUser = storedUser;
		messages = [];
		if (roomId) loadChatHistory(roomId);
		socket = new WebSocket(`wss://${PUBLIC_BASE_URL}/chat/${roomId}/${currentUser}`);
		socket.onmessage = (event) => {
			const parsed = JSON.parse(event.data);
			if (parsed.type === 'TYPING_START' || parsed.type === 'TYPING_STOP') {
				handleSystemSignals(parsed);
				return;
			}
			const formattedMessage = processIncomingMessage(parsed);
			messages = [...messages, formattedMessage];
			triggerPushNotification(formattedMessage);
			scrollToBottom();
		};

		socket.onopen = () => {
			pingInterval = setInterval(() => {
				if (socket?.readyState === WebSocket.OPEN) {
					socket.send(JSON.stringify({ type: 'PING' }));
				}
			}, 30000);
		};
		socket.onclose = () => {
			clearInterval(pingInterval);
		};
		return () => {
			if (socket) {
				socket.close();
			}
		};
	});

	function handleInputChange() {
		if (!socket || socket.readyState !== WebSocket.OPEN) return;
		if (!amITyping) {
			amITyping = true;
			socket.send(
				JSON.stringify({
					type: 'TYPING_START',
					sender: currentUser
				})
			);
		}
		clearTimeout(typingTimeout);
		typingTimeout = setTimeout(() => {
			amITyping = false;
			socket.send(
				JSON.stringify({
					type: 'TYPING_STOP',
					sender: currentUser
				})
			);
		}, 2000);
	}
	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault(); // Stop a literal new line from being added
			const mockEvent = new SubmitEvent('submit', { cancelable: true });
			sendMessage(mockEvent);
			if (textareaRef) textareaRef.style.height = 'auto';
		}
	}

	function handleDelete(message: Message) {}

	function handleReact(messageId: number, emoji: string) {
		if (!socket || socket.readyState !== WebSocket.OPEN) return;
		const payload = {
			type: 'REACTION',
			messageId: messageId,
			content: emoji,
			sender: currentUser
		};
		socket.send(JSON.stringify(payload));
	}

	function handleReply(message: Message) {
		repliedToMessage = message;
		if (textareaRef) {
			textareaRef.focus();
		}
	}

	function handleTextAreaInput() {
		handleInputChange();
		if (textareaRef) {
			textareaRef.style.height = 'auto';
			textareaRef.style.height = `${textareaRef.scrollHeight}px`;
		}
	}

	async function scrollToBottom() {
		await tick();
		if (chatContainer) {
			chatContainer.scrollTo({
				top: chatContainer.scrollHeight,
				behavior: 'smooth'
			});
		}
	}

	async function handleFileUpload(file: File) {
		const isImage = file.type.startsWith('image/');
		const isVideo = file.type.startsWith('video/');

		if (!isImage && !isVideo) {
			alert('Only images and videos are allowed!');
			return;
		}

		try {
			if (isVideo) {
				const userHandle = 'general';
				const formData = new FormData();
				formData.append('videos', file);
				const response = await storageService.uploadVideoToExpress(userHandle, file);
				if (!response.ok) throw new Error('Express server video processing rejected.');
				const videoStreamUrl = storageService.getVideoStreamUrl(userHandle, file.name);
				const videoPayload = {
					type: 'VIDEO',
					content: videoStreamUrl
				};
				socket?.send(JSON.stringify(videoPayload));
			} else if (isImage) {
				const filename = `${uuidv4()}-${file.name}`;
				const { uploadUrl, downloadUrl } = await storageService.getPresignedUrl(filename);
				const uploadResponse = await storageService.uploadFileToMinio(uploadUrl, file);

				if (!uploadResponse.ok) throw new Error('MinIO image upload failed');

				const imagePayload = {
					type: 'IMAGE',
					content: downloadUrl
				};
				socket?.send(JSON.stringify(imagePayload));
			}
		} catch (error) {
			console.error('Asset upload routing engine exception:', error);
		}
	}

	function handlePaste(event: ClipboardEvent) {
		const items = event.clipboardData?.items;
		if (!items) return;
		for (const item of items) {
			if (item.type.startsWith('image/')) {
				const file = item.getAsFile();
				if (file) handleFileUpload(file);
			}
		}
	}

	function sendMessage(event: SubmitEvent) {
		event.preventDefault();
		if (!inputMessage.trim() || !socket) return;
		const payload = {
			type: 'TEXT',
			content: inputMessage,
			parentId: repliedToMessage ? repliedToMessage.id : null
		};

		socket.send(JSON.stringify(payload));
		inputMessage = '';
		if (repliedToMessage) repliedToMessage = null;
		if (textareaRef) textareaRef.style.height = 'auto';
		if (amITyping) {
			clearTimeout(typingTimeout);
			amITyping = false;

			socket.send(
				JSON.stringify({
					type: 'TYPING_STOP',
					sender: currentUser
				})
			);
		}
	}

	async function handleLogout() {
		localStorage.removeItem('m_user');
		await goto(resolve('/login'));
	}
	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
		const files = event.dataTransfer?.files;
		if (files && files.length > 0) {
			handleFileUpload(files[0]);
		}
	}
	function requestAlertPermissions() {
		if (typeof window !== 'undefined' && 'Notification' in window) {
			Notification.requestPermission().then((permission) => {
				notificationStatus = permission;
			});
		}
	}
	$effect(() => {
		if (typeof window !== 'undefined' && 'Notification' in window) {
			notificationStatus = Notification.permission;
		}
	});
</script>

<div class="flex h-screen max-h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
	<!-- Mobile Sidebar Overlay Backdrop -->
	{#if sidebarOpen}
		<button
			onclick={() => (sidebarOpen = false)}
			class="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity"
			aria-label="Close sidebar"
		></button>
	{/if}

	<!-- Sidebar (Responsive Drawer) -->
	<aside
		class="w-64 bg-slate-800 border-r border-slate-700 flex flex-col justify-between fixed md:static inset-y-0 left-0 z-50 transform {sidebarOpen
			? 'translate-x-0'
			: '-translate-x-full'} md:translate-x-0 transition-transform duration-200 ease-in-out"
	>
		<div>
			{#if notificationStatus === 'default'}
				<div class="p-4 pb-0">
					<button
						onclick={requestAlertPermissions}
						class="w-full text-xs px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded transition"
					>
						🔔 Enable Desktop Alerts
					</button>
				</div>
			{/if}
			<div class="p-4 border-b border-slate-700 flex items-center justify-between">
				<span class="text-xl font-bold tracking-wider text-blue-500">m-chat</span>
				<!-- Close Button Mobile only -->
				<button
					onclick={() => (sidebarOpen = false)}
					class="md:hidden text-slate-400 hover:text-white text-xl"
				>
					✕
				</button>
			</div>
			<nav class="p-4 space-y-2">
				<p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Channels</p>

				<a
					href="{base}/room/general"
					onclick={() => (sidebarOpen = false)}
					class="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors {roomId ===
					'general'
						? 'bg-blue-600 text-white'
						: 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'}"
				>
					# general
				</a>
			</nav>
		</div>

		<div class="p-4 border-t border-slate-700 bg-slate-850 flex items-center justify-between">
			<div class="truncate mr-2">
				<p class="text-xs text-slate-400">Logged in as</p>
				<p class="text-sm font-semibold text-slate-200 truncate">
					{currentUser || 'Connecting...'}
				</p>
			</div>
			<button
				onclick={handleLogout}
				class="px-2 py-1 bg-red-600/80 hover:bg-red-600 text-xs font-medium rounded transition-colors text-white"
			>
				Logout
			</button>
		</div>
	</aside>

	<!-- Main Chat Window -->
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
		{#if isDragging}
			<div
				class="absolute inset-0 bg-blue-600/20 backdrop-blur-sm border-2 border-dashed border-blue-500 z-50 flex items-center justify-center pointer-events-none"
			>
				<p class="text-xl font-semibold text-blue-400 animate-pulse">Drop image here to send...</p>
			</div>
		{/if}

		<header
			class="h-16 border-b border-slate-700 bg-slate-800/50 flex items-center px-4 md:px-6 gap-3"
		>
			<!-- Hamburger menu button -->
			<button
				onclick={() => (sidebarOpen = true)}
				class="md:hidden p-2 text-slate-400 hover:text-slate-200 focus:outline-none"
				aria-label="Open sidebar"
			>
				☰
			</button>
			<h2 class="text-lg font-bold tracking-wide truncate">
				<span class="text-slate-400">#</span>
				{roomId}
			</h2>
		</header>

		<div
			bind:this={chatContainer}
			class="flex flex-1 flex-col gap-2 w-full p-4 overflow-y-auto [&::-webkit-scrollbar]:hidden"
		>
			{#each messages as message (message.sentAt)}
				<MessageItem
					{message}
					onImageLoad={scrollToBottom}
					{handleReply}
					{handleDelete}
					{handleReact}
				/>
			{/each}
			<div class="h-6 p-2 text-xs text-slate-400 italic">
				{#if typingUsers.length === 1}
					<span class="font-medium text-blue-400">{typingUsers[0]}</span> is typing
					<span class="animate-pulse">...</span>
				{:else if typingUsers.length === 2}
					<span class="font-medium text-blue-400">{typingUsers[0]}</span> and
					<span class="font-medium text-blue-400">{typingUsers[1]}</span> are typing
					<span class="animate-pulse">...</span>
				{:else if typingUsers.length > 2}
					<span class="font-medium text-blue-400">{typingUsers[0]}</span>,
					<span class="font-medium text-blue-400">{typingUsers[1]}</span>, and
					<span class="font-medium text-blue-400">{typingUsers.length - 2} others</span> are typing
					<span class="animate-pulse">...</span>
				{/if}
			</div>
		</div>

		<footer class="p-3 md:p-4 border-t border-slate-700 bg-slate-800/30">
			<form onsubmit={sendMessage} class="flex gap-2 md:gap-3 items-end">
				<input
					bind:this={fileInputRef}
					type="file"
					accept="image/*"
					class="hidden"
					onchange={(e) => {
						const target = e.currentTarget as HTMLInputElement;
						if (target.files?.[0]) handleFileUpload(target.files[0]);
					}}
				/>
				<button
					type="button"
					onclick={() => fileInputRef?.click()}
					class="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors h-[46px]"
					title="Upload Image"
				>
					📎
				</button>
				<div
					class="flex-1 flex flex-col bg-slate-700 border border-slate-600 rounded-lg focus-within:border-blue-500 transition-colors overflow-hidden"
				>
					{#if repliedToMessage}
						<div
							class="flex items-center justify-between bg-slate-800/40 w-50 m-2 px-3 py-2 text-xs text-slate-300 animate-in fade-in slide-in-from-bottom-1 duration-150"
						>
							<div class="min-w-0 flex-1 mr-4">
								<span class="font-semibold text-indigo-400 text-[11px] block">
									Replying to {repliedToMessage.sender.displayName}
								</span>
								<p class="text-slate-400 italic text-[11px] mt-0.5 truncate font-mono">
									{truncateText(repliedToMessage.content)}
								</p>
							</div>
							<button
								type="button"
								onclick={() => (repliedToMessage = null)}
								class="text-slate-400 hover:text-white p-0.5 rounded hover:bg-slate-600 transition-colors shrink-0"
								title="Cancel reply"
							>
								X
							</button>
						</div>
					{/if}

					<textarea
						bind:this={textareaRef}
						bind:value={inputMessage}
						oninput={handleTextAreaInput}
						onkeydown={handleKeyDown}
						rows="1"
						placeholder="Message #{roomId}..."
						class="w-full bg-transparent px-3 py-3 text-white placeholder-slate-400 resize-none max-h-36 overflow-y-auto min-h-[46px] leading-normal [&::-webkit-scrollbar]:hidden
		outline-none border-none ring-0 focus:outline-none focus:ring-0"></textarea>
				</div>
				<button
					type="submit"
					class="px-4 md:px-6 h-[46px] bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-blue-900/20 whitespace-nowrap"
				>
					Send
				</button>
			</form>
		</footer>
	</main>
</div>
