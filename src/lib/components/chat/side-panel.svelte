<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authService } from '$lib/api/auth';
	import { roomService, type CreateRoomRequest } from '$lib/api/room';
	import { userService } from '$lib/api/user';
	import { Button } from '$lib/components/ui/button';
	import { useUserRoomsQuery } from '$lib/queries/use-user-room';
	import { notificationService } from '$lib/services/notification-service.svelte';
	import { useUser } from '$lib/stores/auth.svelte';
	import { Bell, BellOff, PlusIcon } from '@lucide/svelte';
	import CreateRoomDialog from '../room/create-room-dialog.svelte';
	import Spinner from '../ui/spinner/spinner.svelte';

	let { sidebarOpen = $bindable(), roomId } = $props();
	let isOpenRoomDialog = $state(false);

	const { currentUser, setUser } = useUser();
	const { query } = useUserRoomsQuery();
	let { data: rooms = [], isLoading } = $derived(query);
	async function handleLogout() {
		await authService.logout();
		await goto(resolve('/login'));
	}

	async function handleCreateRoom(data: CreateRoomRequest) {
		await roomService.createRoom(data);
	}
	const toggleUpdateNotifications = async () => {
		try {
			const updatedUser = await userService.updateNotificationSettings({
				allowNotify: !currentUser.allowNotify
			});
			console.log('Notification settings updated:', updatedUser);
			setUser(updatedUser);
		} catch (error) {
			console.error('Error toggling notifications:', error);
			alert('Failed to toggle notifications.');
		}
	};
</script>

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
						await notificationService.requestPermission();
					}}>🔔 Enable Notification</Button
				>
			</div>
		{/if}
		<div class="p-4 border-b flex items-center justify-between">
			<span class="text-xl font-bold tracking-wider text-primary">m-chat</span>
			<Button
				variant="default"
				size="icon"
				title="Toggle Notifications"
				onclick={toggleUpdateNotifications}
			>
				{#if currentUser.allowNotify}
					<Bell />
				{:else}
					<BellOff />
				{/if}
			</Button>
			<Button onclick={() => (sidebarOpen = false)} class="md:hidden ">✕</Button>
		</div>
		<nav class="p-4 space-y-2">
			<div class="flex items-center justify-between">
				<p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Rooms</p>
				<Button size="icon" variant="outline" onclick={() => (isOpenRoomDialog = true)}>
					<PlusIcon />
				</Button>
			</div>
			{#if isLoading}
				<Spinner />
			{:else}
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
			{/if}
		</nav>
	</div>

	<div class="p-4 border-t flex items-center justify-between">
		<div class="truncate mr-2">
			<p class="text-xs">Logged in as</p>
			{#if currentUser.username}
				<a href={resolve(`/profile/${currentUser.username}`)} class="text-sm text-primary">
					{currentUser.username}
				</a>
			{:else}
				<span class="text-sm">Connecting...</span>
			{/if}
		</div>
		<Button onclick={handleLogout} size="sm" variant="destructive">Logout</Button>
	</div>
	<CreateRoomDialog onsubmit={handleCreateRoom} bind:open={isOpenRoomDialog} />
</aside>
