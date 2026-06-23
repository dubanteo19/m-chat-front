<script lang="ts">
	import { goto } from '$app/navigation';
	import { base, resolve } from '$app/paths';
	import { page } from '$app/stores';
	import { PUBLIC_BASE_URL } from '$env/static/public';
	import { roomService } from '$lib/api/room';
	import { storageService } from '$lib/api/storage';
	import MessageItem from '$lib/components/chat/message-item.svelte';
	import type { Message } from '$lib/types/message';
	import { tick } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';
	let roomId = $derived($page.params.roomId);

	let currentUser = $state('');
	let messages = $state<Message[]>([]);
	let fileInputRef = $state<HTMLInputElement>();
	let textareaRef = $state<HTMLTextAreaElement>();
	let isDragging = $state(false);
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
			isMine: rawMsg.sender === currentUser
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
		console.log(msg);
		if ((msg.isMine || document.visibilityState === 'visible' || msg.type === 'SYSTEM')) return;
		if (notificationStatus === 'granted') {
			let bodyText = msg.content;

			if (msg.type === 'IMAGE') bodyText = '📷 Sent an image file attachment';
			if (msg.type === 'VIDEO') bodyText = '🎥 Sent a video streaming attachment';

			if (typeof window !== 'undefined' && 'Notification' in window) {
				const notification = new Notification(`#${roomId} - ${msg.sender}`, {
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
			goto(resolve('/login'));
			return;
		}
		currentUser = storedUser;
		messages = [];
		if (roomId) loadChatHistory(roomId);
		socket = new WebSocket(`ws://${PUBLIC_BASE_URL}/chat/${roomId}/${currentUser}`);
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

		socket.send(inputMessage);
		inputMessage = ''; // Reset input field cleanly
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

<div class="flex flex-1 max-h-screen bg-slate-900 text-slate-100 font-sans">
	<aside class="w-64 bg-slate-800 border-r border-slate-700 flex flex-col justify-between">
		<div>
			{#if notificationStatus === 'default'}
				<button
					onclick={requestAlertPermissions}
					class="text-xs px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded transition"
				>
					🔔 Enable Desktop Alerts
				</button>
			{/if}
			<div class="p-4 border-b border-slate-700">
				<span class="text-xl font-bold tracking-wider text-blue-500">m-chat</span>
			</div>
			<nav class="p-4 space-y-2">
				<p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Channels</p>

				<a
					href="{base}/room/general"
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

	<main
		class="relative flex-1 flex flex-col min-w-0"
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
		<header class="h-16 border-b border-slate-700 bg-slate-800/50 flex items-center px-6">
			<h2 class="text-lg font-bold tracking-wide">
				<span class="text-slate-400">#</span>
				{roomId}
			</h2>
		</header>

		<div
			bind:this={chatContainer}
			class="flex flex-1 flex-col gap-2 w-full p-4 overflow-y-auto [&::-webkit-scrollbar]:hidden"
		>
			{#each messages as message (message.sentAt)}
				<MessageItem {message} onImageLoad={scrollToBottom} />
			{/each}
			<div class="h-6 p-4 text-xs text-slate-400 italic">
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

		<footer class="p-4 border-t border-slate-700 bg-slate-800/30">
			<form onsubmit={sendMessage} class="flex gap-3">
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
					class="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors"
					title="Upload Image"
				>
					📎
				</button>
				<textarea
					bind:this={textareaRef}
					bind:value={inputMessage}
					oninput={handleTextAreaInput}
					onkeydown={handleKeyDown}
					rows="1"
					placeholder="Message #{roomId}..."
					class="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors resize-none max-h-36 overflow-y-auto align-bottom leading-normal"
				></textarea>
				<button
					type="submit"
					class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-blue-900/20"
				>
					Send
				</button>
			</form>
		</footer>
	</main>
</div>
