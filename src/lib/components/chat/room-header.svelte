<script lang="ts">
	import UserAvatar from '../common/user-avatar.svelte';
	import * as HoverCard from '$lib/components/ui/hover-card/index.js';
	import UserBadge from '../common/user-badge.svelte';
	import { Button } from '../ui/button';
	import type { RoomEffect } from '../room-effects/effects/particles';
	import { EventType } from '$lib/services/websocket-service.svelte';

	let { sidebarOpen = $bindable(), roomId, onlineUsers, sendRaw, selectedRoomEffect } = $props();
	const roomEffects: { type: RoomEffect; icon: string; label: string }[] = [
		{ type: 'snow', icon: '❄️', label: 'Snow' },
		{ type: 'sakura', icon: '🌸', label: 'Sakura' },
		{ type: 'aurora', icon: '🌌', label: 'Aurora' },
		{ type: 'thunderstorm', icon: '🌩️', label: 'Thunderstorm' },
		{ type: 'radiance-of-amitabha', icon: '☸️', label: 'Radiance of Amitabha' }
	];
	console.log('selectedRoomEffect', selectedRoomEffect);
	const onRoomEffectSelect = (roomEffect: string) => {
		sendRaw({
			eventType: EventType.ROOM_EFFECT,
			effect: roomEffect
		});
	};
</script>

<header class="h-16 border-b flex items-center px-4 md:px-6 gap-3">
	<Button onclick={() => (sidebarOpen = true)} class="md:hidden p-2  " aria-label="Open sidebar">
		☰
	</Button>
	<h2 class="text-lg font-bold tracking-wide truncate">
		<span class="text-accent">#</span>
		{roomId}
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
		<div class="flex gap-1 px-2 py-1 border items-center rounded-full border-secondary">
			{#each roomEffects as effect (effect.type)}
				<Button
					variant={selectedRoomEffect.type === effect.type ? 'destructive' : 'ghost'}
					size="icon"
					title={effect.label}
					aria-label={effect.label}
					onclick={() => onRoomEffectSelect(effect.type)}
				>
					{effect.icon}
				</Button>
			{/each}
		</div>
	</div>
</header>
