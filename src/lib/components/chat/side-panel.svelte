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
	import { Bell, BellOff, ChevronDown, Folder, Hash, LogOut, PlusIcon, X } from '@lucide/svelte';
	import CreateRoomDialog from '../room/create-room-dialog.svelte';
	import Spinner from '../ui/spinner/spinner.svelte';
	import { Badge } from '../ui/badge';

	let { sidebarOpen = $bindable(), roomId } = $props();
	let isOpenRoomDialog = $state(false);

	const { currentUser, setUser } = $derived(useUser());
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
			setUser(updatedUser);
		} catch (error) {
			console.error('Error toggling notifications:', error);
			alert('Failed to toggle notifications.');
		}
	};
</script>

<aside
	class="
		fixed inset-y-0 left-0 z-50
		flex h-full min-h-0 w-[15.75rem] shrink-0 flex-col
		border-r border-sidebar-border bg-sidebar text-sidebar-foreground
		transition-transform duration-200 ease-in-out
		{sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
		md:static md:translate-x-0 md:transition-none
	"
>
	<div class="flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border px-3">
		<span class="px-1 text-xl font-bold tracking-tight text-[#8b7cf6]">m-chat</span>
		<div class="ml-auto flex items-center gap-1">
			{#if notificationService.status === 'default'}
				<Button
					variant="ghost"
					size="icon-sm"
					class="text-muted-foreground hover:text-foreground"
					title="Enable browser notifications"
					onclick={async () => {
						await notificationService.requestPermission();
					}}
				>
					<Bell size={16} />
				</Button>
			{/if}
			<Button
				variant="ghost"
				size="icon-sm"
				class="text-muted-foreground hover:text-foreground"
				title="Toggle Notifications"
				onclick={toggleUpdateNotifications}
			>
				{#if currentUser.allowNotify}
					<Bell size={16} />
				{:else}
					<BellOff size={16} />
				{/if}
			</Button>
			<Button
				variant="ghost"
				size="icon-sm"
				onclick={() => (isOpenRoomDialog = true)}
				title="Create room"
			>
				<PlusIcon size={18} />
			</Button>
			<Button
				variant="ghost"
				size="icon-sm"
				onclick={() => (sidebarOpen = false)}
				class="md:hidden"
				aria-label="Close sidebar"
			>
				<X size={18} />
			</Button>
		</div>
	</div>
	<nav class="min-h-0 flex-1 overflow-y-auto px-2 py-3">
		<div
			class="flex h-8 items-center gap-2 px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase"
		>
			<ChevronDown size={14} />
			<Folder size={16} />
			<span>Rooms</span>
		</div>
		{#if isLoading}
			<div class="px-3 py-2"><Spinner /></div>
		{:else}
			{#each rooms as room (room.id)}
				<div class="relative my-0.5">
					<a
						href={resolve(`/room/${room.id}`)}
						onclick={() => (sidebarOpen = false)}
						class="group flex h-9 items-center gap-2 border-l-2 px-3 text-sm transition-colors hover:bg-muted/70 hover:no-underline
							{room.id === roomId
							? 'border-[#7c5cff] bg-sidebar-accent text-sidebar-accent-foreground'
							: 'border-transparent text-muted-foreground hover:text-foreground'}"
					>
						<Hash size={15} class="shrink-0" />
						<span class="truncate">{room.name}</span>
					</a>
					{#if room.unreadCount > 0}
						<Badge
							class="absolute top-1/2 right-2 h-4 min-w-4 -translate-y-1/2 rounded-full px-1 font-mono text-[9px]"
							variant="default"
						>
							{room.unreadCount > 99 ? '99+' : room.unreadCount}
						</Badge>
					{/if}
				</div>
			{/each}
		{/if}
	</nav>

	<div class="flex h-16 shrink-0 items-center gap-2 border-t border-sidebar-border px-3">
		<div class="min-w-0 flex-1 px-1">
			<p class="text-[10px] tracking-wide text-muted-foreground uppercase">Logged in as</p>
			{#if currentUser.username}
				<a
					href={resolve(`/profile/${currentUser.username}`)}
					class="block truncate text-sm text-foreground hover:text-[#9b8cff] hover:no-underline"
				>
					{currentUser.username}
				</a>
			{:else}
				<span class="text-sm">Connecting...</span>
			{/if}
		</div>
		<Button
			onclick={handleLogout}
			size="sm"
			variant="outline"
			class="gap-1.5 border-destructive/35 text-destructive hover:bg-destructive/10 hover:text-destructive"
		>
			<LogOut size={14} />
			Logout
		</Button>
	</div>
	<CreateRoomDialog onsubmit={handleCreateRoom} bind:open={isOpenRoomDialog} />
</aside>
