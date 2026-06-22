<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { base, resolve } from '$app/paths';
	import { PUBLIC_BASE_URL } from '$env/static/public';
	import type { Message } from '$lib/types/message';
	import MessageItem from '$lib/components/chat/message-item.svelte';
	let roomId = $derived($page.params.roomId);

	let currentUser = $state('');
	let messages = $state<Message[]>([]);
	let inputMessage = $state('');
	let socket: WebSocket;

	onMount(async () => {
		const storedUser = localStorage.getItem('m_user');

		// Early Return Strategy: Secure the route immediately if unauthenticated
		if (!storedUser) {
			await goto(resolve('/login'));
			return;
		}

		currentUser = storedUser;
		socket = new WebSocket(`ws://${PUBLIC_BASE_URL}/chat/${roomId}/${currentUser}`);

		socket.onmessage = (event) => {
			messages = [...messages, event.data];
		};

		// Clean up when leaving the route channel
		return () => {
			if (socket) socket.close();
		};
	});

	function sendMessage(event: SubmitEvent) {
		event.preventDefault();
		if (!inputMessage.trim() || !socket) return;

		socket.send(inputMessage);
		inputMessage = ''; // Reset input field cleanly
	}

	async function handleLogout() {
		localStorage.removeItem('m_user');
		await goto(resolve('/login'));
	}
</script>

<div class="flex h-screen bg-slate-900 text-slate-100 font-sans">
	<aside class="w-64 bg-slate-800 border-r border-slate-700 flex flex-col justify-between">
		<div>
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

	<main class="flex-1 flex flex-col min-w-0">
		<header class="h-16 border-b border-slate-700 bg-slate-800/50 flex items-center px-6">
			<h2 class="text-lg font-bold tracking-wide">
				<span class="text-slate-400">#</span>
				{roomId}
			</h2>
		</header>

		<div class="flex-1 overflow-y-auto p-6 space-y-3">
			{#each messages as message (message.id + message.sentAt)}
				<MessageItem {message} />
			{:else}
				<div class="h-full flex items-center justify-center text-slate-500 text-sm italic">
					No messages in #{roomId} yet. Start the conversation!
				</div>
			{/each}
		</div>

		<footer class="p-4 border-t border-slate-700 bg-slate-800/30">
			<form onsubmit={sendMessage} class="flex gap-3">
				<input
					bind:value={inputMessage}
					type="text"
					placeholder="Message #{roomId}..."
					class="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
				/>
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
