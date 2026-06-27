<script lang="ts">
	import { notificationService } from '$lib/services/notification-service.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { base } from '$app/paths';

	let { sidebarOpen = $bindable(), roomId, currentUser } = $props();

	async function handleLogout() {
		localStorage.removeItem('m_user');
		await goto(resolve('/login'));
	}
</script>

{#if sidebarOpen}
	<button
		onclick={() => (sidebarOpen = false)}
		class="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity"
		aria-label="Close sidebar"
	></button>
{/if}

<aside
	class="w-64 bg-slate-800 border-r border-slate-700 flex flex-col justify-between fixed md:static inset-y-0 left-0 z-50 transform {sidebarOpen
		? 'translate-x-0'
		: '-translate-x-full'} md:translate-x-0 transition-transform duration-200 ease-in-out"
>
	<div>
		{#if notificationService.status === 'default'}
			<div class="p-4 pb-0">
				<button
					onclick={notificationService.requestPermission}
					class="w-full text-xs px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded transition"
				>
					🔔 Enable Desktop Alerts
				</button>
			</div>
		{/if}
		<div class="p-4 border-b border-slate-700 flex items-center justify-between">
			<span class="text-xl font-bold tracking-wider text-blue-500">m-chat</span>
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
