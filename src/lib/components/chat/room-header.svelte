<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as HoverCard from '$lib/components/ui/hover-card/index.js';
	import { EventType } from '$lib/services/websocket-service.svelte';
	import UserAvatar from '../common/user-avatar.svelte';
	import UserBadge from '../common/user-badge.svelte';
	import type { RoomEffect } from '../room-effects/effects/particles';
	import { Button } from '../ui/button';

	import { roomMemberService } from '$lib/api/room-member';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { useUser } from '$lib/stores/auth.svelte';
	import type { RoomInfo } from '$lib/types/room';
	import { CornerUpLeft, Users, XIcon } from '@lucide/svelte';
	import RoomDetailDiaglog from '../room/room-detail-diaglog.svelte';
	import AddUserPopover from './room-header/add-user-popover.svelte';
	import { getContext } from 'svelte';
	import { ROOM_MEMBERS_KEY, type RoomState } from '../room/room-state.svelte';
	let { sidebarOpen = $bindable(), roomId, onlineUsers, sendRaw, selectedRoomEffect } = $props();
	let selectedRoom = $state<RoomInfo | null>(null);
	let isSubmitting = $state(false);
	let memberToKick: string | null = $state(null);
	const roomState = getContext<RoomState>(ROOM_MEMBERS_KEY);
	const currentUser = useUser();
	const roomEffects: { type: RoomEffect; icon: string; label: string }[] = [
		{ type: 'snow', icon: '❄️', label: 'Snow' },
		{ type: 'sakura', icon: '🌸', label: 'Sakura' },
		{ type: 'aurora', icon: '🌌', label: 'Aurora' },
		{ type: 'thunderstorm', icon: '🌩️', label: 'Thunderstorm' },
		{ type: 'radiance-of-amitabha', icon: '☸️', label: 'Radiance of Amitabha' },
		{ type: 'disco-fever', icon: '🎆', label: 'Disco Fever' },
		{ type: 'paper-butterfly-dream', icon: '🦋', label: 'Paper Butterfly Dream' },
		{ type: 'bioluminescent-tide', icon: '🌊', label: 'Bioluminescent Tide' },
		{ type: 'sticker-road-trip', icon: '🚗', label: 'Sticker Road Trip' }
	];
	const onRoomEffectSelect = (roomEffect: string) => {
		sendRaw({
			eventType: EventType.ROOM_EFFECT,
			effect: roomEffect,
			sender: {
				displayName: currentUser.displayName
			}
		});
	};
	const handleKickUser = async () => {
		if (!memberToKick) return;

		try {
			await roomMemberService.kickMember(roomId, memberToKick);
			alert(`User ${memberToKick} has been kicked from the room.`);
			roomState.removeMember(memberToKick);
			memberToKick = null;
		} catch (error) {
			console.error('Error kicking user from room:', error);
			alert('Failed to kick user from the room.');
		}
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
			onclick={() => (selectedRoom = { id: roomId, name: roomId })}
		>
			{roomId}
		</Button>
	</h2>
	<div class="flex-1 flex items-center justify-between gap-2">
		<div class="flex gap-4">
			{#each onlineUsers as user (user.username)}
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
			<Popover.Root>
				<Popover.Trigger>
					<div class="flex-center gap-1">
						<Users size={18} />
						<span>{roomState.members.length}</span>
					</div>
				</Popover.Trigger>
				<Popover.Content side="bottom" sideOffset={2} class="w-fit px-4">
					<div class="flex flex-col gap-1 min-w-54 max-h-64 overflow-y-auto">
						<span>Room members ({roomState.members.length})</span>
						{#each roomState.members as member (member.user.username)}
							<div
								class="group relative flex justify-between items-center gap-2 px-2 py-1 hover:bg-secondary rounded"
							>
								<div class="flex items-center gap-2">
									<UserAvatar user={member.user} />
									<div class="flex flex-col items-start">
										<span
											>{member.user.displayName}
											{#if member.user.username === currentUser.username}
												<span class="text-xs text-muted-foreground">(You)</span>
											{/if}
										</span>
										<span
											class="text-xs font-semibold"
											class:text-red-600={member.role === 'MASTER'}
										>
											{member.role.charAt(0).toUpperCase() + member.role.slice(1).toLowerCase()}
										</span>
									</div>
								</div>
								{#if member.user.username !== currentUser.username}
									<Button
										variant="ghost"
										size="icon"
										class="invisible group-hover:visible"
										onclick={() => (memberToKick = member.user.username)}
									>
										<XIcon size={16} />
									</Button>
								{/if}
							</div>
						{/each}

						<div class="border-t border-bg-gray-500 my-2"></div>
						<AddUserPopover {roomId} onAddMember={roomState.addMember} />

						<Button variant="ghost" size="sm">
							<CornerUpLeft />
							<span> Leave Room </span>
						</Button>
					</div>
				</Popover.Content>
			</Popover.Root>
			{#snippet effectButtons()}
				{#each roomEffects as effect (effect.type)}
					<Button
						variant={selectedRoomEffect === effect.type ? 'default' : 'ghost'}
						size="icon"
						title={effect.label}
						aria-label={effect.label}
						onclick={() => onRoomEffectSelect(effect.type)}
					>
						{effect.icon}
					</Button>
				{/each}
			{/snippet}
			<!--  Desktop View -->
			<div class="hidden md:flex gap-1 px-2 py-1 border items-center rounded-full border-secondary">
				{@render effectButtons()}
			</div>
			<!--  Mobile View -->
			<div class="block md:hidden">
				<Popover.Root>
					<Popover.Trigger>
						<Button variant="outline" size="icon" aria-label="Room Effects">
							{roomEffects.find((e) => e.type === selectedRoomEffect)?.icon ?? '✨'}
						</Button>
					</Popover.Trigger>
					<Popover.Content class="w-auto p-2">
						<div class="flex gap-1 items-center">
							{@render effectButtons()}
						</div>
					</Popover.Content>
				</Popover.Root>
			</div>
		</div>
	</div>
	<Dialog.Root
		open={memberToKick !== null}
		onOpenChange={(isOpen) => {
			if (!isOpen) {
				memberToKick = null;
			}
		}}
	>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Kick User</Dialog.Title>
				<Dialog.Description>
					Are you sure you want to kick this user from the room?
				</Dialog.Description>
			</Dialog.Header>

			<Dialog.Footer class="mt-4">
				<Dialog.Close>
					<Button type="button" variant="destructive">Cancel</Button>
				</Dialog.Close>
				<Button onclick={handleKickUser} disabled={isSubmitting}>
					{isSubmitting ? 'Kicking...' : 'Kick User'}
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
	<RoomDetailDiaglog open={selectedRoom !== null} />
</header>
