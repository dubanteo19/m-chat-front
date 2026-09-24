<script lang="ts">
	import * as HoverCard from '$lib/components/ui/hover-card/index.js';
	import { EventType } from '$lib/services/websocket-service.svelte';
	import UserAvatar from '../common/user-avatar.svelte';
	import UserBadge from '../common/user-badge.svelte';
	import { Button } from '../ui/button';

	import { useUser } from '$lib/stores/auth.svelte';
	import type { RoomInfo } from '$lib/types/room';
	import RoomEffectPicker from '../room-effects/room-effect-picker.svelte';
	import RoomDetailDiaglog from '../room/room-detail-diaglog.svelte';
	import RoomMembersPopover from './room-header/room-members-popover.svelte';
	let { sidebarOpen = $bindable(), roomId, onlineUsers, sendRaw, selectedRoomEffect } = $props();
	let selectedRoom = $state<RoomInfo | null>(null);
	const { currentUser } = $derived(useUser());
	const onRoomEffectSelect = (roomEffect: string) => {
		sendRaw({
			eventType: EventType.ROOM_EFFECT,
			effect: roomEffect,
			sender: {
				displayName: currentUser.displayName
			}
		});
	};
</script>

<header class="h-16 border-b flex items-center px-4 md:px-6 gap-3">
	{#if !sidebarOpen}
		<Button onclick={() => (sidebarOpen = true)} class="md:hidden p-2  " aria-label="Open sidebar">
			☰
		</Button>
	{/if}
	<h2 class="text-lg font-bold tracking-wide truncate">
		<span class="text-accent">#</span>
		<Button
			variant="link"
			size="sm"
			class="p-0 text-primary-foreground"
			onclick={() => (selectedRoom = { id: roomId, name: roomId, lastSeq: 0, unreadCount: 0 })}
		>
			{roomId}
		</Button>
	</h2>
	<div class="flex-1 flex items-center justify-between gap-2">
		<div class="flex gap-4">
			{#each onlineUsers as user (user.id)}
				<HoverCard.Root openDelay={200} closeDelay={50}>
					<HoverCard.Trigger>
						<div class="relative">
							<UserAvatar {user} />
							<span
								class="absolute size-2 bottom-0 right-0 bg-green-500 rounded ring-2 ring-white z-10"
							></span>
						</div>
					</HoverCard.Trigger>
					<HoverCard.Content side="bottom" sideOffset={2} class="w-fit">
						<UserBadge {user} />
					</HoverCard.Content>
				</HoverCard.Root>
			{/each}
		</div>
		<div class="flex gap-2 items-center">
			<RoomMembersPopover {roomId} {onlineUsers} />
			<RoomEffectPicker {selectedRoomEffect} onselect={onRoomEffectSelect} />
		</div>
	</div>
	<RoomDetailDiaglog open={selectedRoom !== null} />
</header>
