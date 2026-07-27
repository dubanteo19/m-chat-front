<script lang="ts">
	import { notificationService } from '$lib/services/notification-service.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import CreateRoomDiaglog from '../room/create-room-diaglog.svelte';
	import { Button } from '$lib/components/ui/button';
	import { roomService, type CreateRoomRequest } from '$lib/api/room';
	import { userService } from '$lib/api/user';
	import type { RoomInfo } from '$lib/types/room';
	import { PlusIcon } from '@lucide/svelte';
	import { auth } from '$lib/stores/auth.svelte';

	let { sidebarOpen = $bindable(), roomId } = $props();
	let rooms = $state<RoomInfo[]>([]);
	let isOpenRoomDialog = $state(false);
	let { username } = $derived(auth.currentUser);
	async function handleLogout() {
		auth.logout();
		await goto(resolve('/login'));
	}
	$effect(() => {
		const loadRooms = async () => {
			if (username) {
				rooms = await userService.getRooms(username);
			}
		};
		loadRooms();
	});
	async function handleCreateRoom(data: CreateRoomRequest) {
		const response = await roomService.createRoom({
			...data,
			roomMasterUsername: username
		});
		if (response.id) {
			console.log('room created');
		}
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
						await notificationService.requestPermission(username);
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
				<Button size="icon" variant="outline" onclick={() => (isOpenRoomDialog = true)}>
					<PlusIcon />
				</Button>
			</div>
			{#each rooms as room (room.id)}
				<a
					href={resolve(`/room/${room.id}`)}
					onclick={() => (sidebarOpen = false)}
					class="flex items-center px-3 py-2 rounded-md text-sm transition-colors {room.id ===
					roomId
						? 'bg-primary'
						: ' hover:bg-slate-700/50 hover:text-slate-200'}"
				>
					# {room.name}
				</a>
			{/each}
		</nav>
	</div>

	<div class="p-4 border-t flex items-center justify-between">
		<div class="truncate mr-2">
			<p class="text-xs">Logged in as</p>
			{#if username}
				<a href={resolve(`/profile/${username}`)} class="text-sm text-primary">
					{username}
				</a>
			{:else}
				<span class="text-sm">Connecting...</span>
			{/if}
		</div>
		<Button onclick={handleLogout} size="sm" variant="destructive">Logout</Button>
	</div>
	<CreateRoomDiaglog onsubmit={handleCreateRoom} bind:open={isOpenRoomDialog} />
</aside>
