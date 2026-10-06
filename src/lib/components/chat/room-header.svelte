<script lang="ts">
	import { EventType } from '$lib/services/websocket-service.svelte';
	import { Button } from '../ui/button';

	import { useUser } from '$lib/stores/auth.svelte';
	import type { RoomInfo } from '$lib/types/room';
	import RoomEffectPicker from '../room-effects/room-effect-picker.svelte';
	import RoomDetailDiaglog from '../room/room-detail-diaglog.svelte';
	import RoomMembersPopover from './room-header/room-members-popover.svelte';
	import { Bot, Menu } from '@lucide/svelte';
	import AiDiaglog from '../room/ai-diaglog.svelte';
	let { sidebarOpen = $bindable(), roomId, onlineUsers, sendRaw, selectedRoomEffect } = $props();
	let selectedRoom = $state<RoomInfo | null>(null);
	const { currentUser } = $derived(useUser());

	let openAiDialog = $state(false);
	const onRoomEffectSelect = (roomEffect: string | null) => {
		sendRaw({
			eventType: EventType.ROOM_EFFECT,
			effect: roomEffect,
			sender: {
				displayName: currentUser.displayName
			}
		});
	};
</script>

<header
	class="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-[#101216]/95 px-3 md:px-5"
>
	{#if !sidebarOpen}
		<Button
			onclick={() => (sidebarOpen = true)}
			variant="ghost"
			size="icon-sm"
			class="md:hidden"
			aria-label="Open sidebar"
		>
			<Menu size={18} />
		</Button>
	{/if}
	<h2 class="flex min-w-0 items-center gap-1 text-base font-semibold tracking-tight">
		<span class="text-[#8b7cf6]">#</span>
		<Button
			variant="link"
			size="sm"
			class="h-auto min-w-0 p-0 text-[#9b8cff] underline decoration-[#6257a8] underline-offset-4 hover:text-[#b2a8ff]"
			onclick={() => (selectedRoom = { id: roomId, name: roomId, lastSeq: 0, unreadCount: 0 })}
		>
			<span class="truncate">{roomId}</span>
		</Button>
	</h2>
	<div class="h-5 w-px bg-border"></div>
	<div class="flex min-w-0 flex-1 items-center justify-between gap-2">
		<div class="flex items-center gap-2 text-xs text-muted-foreground">
			<span class="size-2 rounded-full bg-[#3ecf8e] shadow-[0_0_8px_rgba(62,207,142,0.4)]"></span>
			<span>{onlineUsers.length} online</span>
		</div>
		<div class="flex items-center gap-2">
			<!-- <Button
				variant="ghost"
				onclick={() => (openAiDialog = true)}
				size="icon-sm"
				class="text-muted-foreground hover:text-foreground"
				title="AI assistant"
			>
				<Bot size={17} />
			</Button> -->
			<RoomMembersPopover {roomId} {onlineUsers} />
			<RoomEffectPicker {selectedRoomEffect} onselect={onRoomEffectSelect} />
		</div>
	</div>

	<!-- <AiDiaglog bind:open={openAiDialog} /> -->
	<RoomDetailDiaglog open={selectedRoom !== null} />
</header>
