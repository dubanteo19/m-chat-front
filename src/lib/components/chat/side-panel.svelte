<script lang="ts">
	import { notificationService } from '$lib/services/notification-service.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import CreateRoomDiaglog from '../room/create-room-diaglog.svelte';
	import { Button } from '$lib/components/ui/button';

	let { sidebarOpen = $bindable(), roomId, currentUser } = $props();
	let showCreateRoom = $state(false);
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
	class="w-64 border-r flex flex-col bg-sidebar justify-between fixed md:static inset-y-0 left-0 z-50 transform {sidebarOpen
		? 'translate-x-0'
		: '-translate-x-full'} md:translate-x-0 transition-transform duration-200 ease-in-out"
>
	<div>
		{#if notificationService.status === 'default'}
			<div class="p-4 pb-0">
				<Button
					onclick={async () => {
						await notificationService.requestPermission(currentUser);
					}}>🔔 Enable Notification</Button
				>
			</div>
		{/if}
		<div class="p-4 border-b flex items-center justify-between">
			<span class="text-xl font-bold tracking-wider text-primary">m-chat</span>
			<Button onclick={() => (sidebarOpen = false)} class="md:hidden ">✕</Button>
		</div>
		<nav class="p-4 space-y-2">
			<div class="flex items-center justify-between">
				<p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Rooms</p>
				<Button size="sm" variant="outline" onclick={() => (showCreateRoom = true)}>+</Button>
			</div>
			<a
				href={resolve('/room/general')}
				onclick={() => (sidebarOpen = false)}
				class="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors {roomId ===
				'general'
					? 'bg-primary'
					: ' hover:bg-slate-700/50 hover:text-slate-200'}"
			>
				# general
			</a>
		</nav>
	</div>

	<div class="p-4 border-t flex items-center justify-between">
		<div class="truncate mr-2">
			<p class="text-xs">Logged in as</p>
			{#if currentUser}
				<a href={resolve(`/profile/${currentUser}`)} class="text-sm font-medium text-blue-500">
					{currentUser}
				</a>
			{:else}
				<span class="text-sm font-medium text-slate-500">Connecting...</span>
			{/if}
		</div>
		<Button onclick={handleLogout} size="sm" variant="destructive">Logout</Button>
	</div>
	<CreateRoomDiaglog bind:open={showCreateRoom} />
</aside>
