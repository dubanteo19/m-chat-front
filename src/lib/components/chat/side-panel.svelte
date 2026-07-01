<script lang="ts">
	import { notificationService } from '$lib/services/notification-service.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Button from '../ui/button.svelte';

	let { sidebarOpen = $bindable(), roomId, currentUser } = $props();

	async function handleLogout() {
		localStorage.removeItem('m_user');
		await goto(resolve('/login'));
	}
</script>

{#if sidebarOpen}
	<Button
		onclick={() => (sidebarOpen = false)}
		class="fixed inset-0  z-40 md:hidden "
		aria-label="Close sidebar"
	></Button>
{/if}

<aside
	class="w-64 bg-slate-800 border-r border-slate-700 flex flex-col justify-between fixed md:static inset-y-0 left-0 z-50 transform {sidebarOpen
		? 'translate-x-0'
		: '-translate-x-full'} md:translate-x-0 transition-transform duration-200 ease-in-out"
>
	<div>
		{#if notificationService.status === 'default'}
			<div class="p-4 pb-0">
				<Button onclick={notificationService.requestPermission}>🔔 Enable Desktop Alerts</Button>
			</div>
		{/if}
		<div class="p-4 border-b border-slate-700 flex items-center justify-between">
			<span class="text-xl font-bold tracking-wider text-blue-500">m-chat</span>
			<Button onclick={() => (sidebarOpen = false)} class="md:hidden ">✕</Button>
		</div>
		<nav class="p-4 space-y-2">
			<p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Channels</p>
			<a
				href={resolve('/room/general')}
				onclick={() => (sidebarOpen = false)}
				class="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors {roomId ===
				'general'
					? 'bg-blue-600 text-white'
					: 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'}"
			>
				# general
			</a>
			<a
				href={resolve('/room/toxic')}
				onclick={() => (sidebarOpen = false)}
				class="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors {roomId ===
				'toxic'
					? 'bg-blue-600 text-white'
					: 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'}"
			>
				# toxic
			</a>
		</nav>
	</div>

	<div class="p-4 border-t border-slate-700 bg-slate-850 flex items-center justify-between">
		<div class="truncate mr-2">
			<p class="text-xs text-slate-400">Logged in as</p>
			{#if currentUser}
				<a href={resolve(`/profile/${currentUser}`)} class="text-sm font-medium text-blue-500">
					{currentUser}
				</a>
			{:else}
				<span class="text-sm font-medium text-slate-500">Connecting...</span>
			{/if}
		</div>
		<Button onclick={handleLogout} size="sm" variant="secondary">Logout</Button>
	</div>
</aside>
