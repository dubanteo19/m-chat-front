<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button';
	import { Power, Sparkles } from '@lucide/svelte';
	import type { RoomEffect } from './effects/particles';
	import {
		getRoomEffectDefinition,
		roomEffects,
		type RoomEffectDefinition
	} from './effect-registry';
	import RoomEffectCard from './room-effect-card.svelte';

	let {
		selectedRoomEffect,
		onselect
	}: {
		selectedRoomEffect: RoomEffect | null;
		onselect: (effect: RoomEffect | null) => void;
	} = $props();

	let open = $state(false);

	let activeEffect = $derived(getRoomEffectDefinition(selectedRoomEffect));

	function selectEffect(effect: RoomEffectDefinition) {
		if (effect.type !== selectedRoomEffect) onselect(effect.type);
		open = false;
	}

	function turnOffEffect() {
		onselect(null);
		open = false;
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button
				{...props}
				variant="outline"
				size="sm"
				class="max-w-36 gap-1.5 px-2.5"
				aria-label={activeEffect ? `Room effect: ${activeEffect.label}` : 'Choose a room effect'}
				title={activeEffect?.label ?? 'Room effects'}
			>
				{#if activeEffect}
					<span class="text-base leading-none" aria-hidden="true">{activeEffect.icon}</span>
					<span class="hidden truncate lg:inline">{activeEffect.label}</span>
				{:else}
					<Sparkles size={16} />
					<span class="hidden lg:inline">Effects</span>
				{/if}
			</Button>
		{/snippet}
	</Popover.Trigger>

	<Popover.Content
		align="end"
		side="bottom"
		sideOffset={8}
		class="w-[min(92vw,21rem)] rounded-lg border-border bg-popover p-2.5"
	>
		<Popover.Header class="px-1 pb-2 text-left">
			<Popover.Title class="text-[13px] font-semibold">Room effects</Popover.Title>
		</Popover.Header>

		<div class="grid grid-cols-2 gap-1.5" aria-label="Room effects">
			{#if selectedRoomEffect}
				<Button
					type="button"
					variant="outline"
					class="min-h-11 min-w-0 justify-start gap-2 rounded-md border-border bg-background/40 p-2 text-rose-400 hover:border-rose-400/30 hover:bg-rose-500/10 hover:text-rose-400"
					aria-label="Turn off room effect"
					onclick={turnOffEffect}
				>
					<span
						class="flex size-7 shrink-0 items-center justify-center rounded-md bg-rose-500/10"
						aria-hidden="true"
					>
						<Power size={18} />
					</span>
					<span class="truncate text-sm font-medium">Turn off</span>
				</Button>
			{/if}

			{#each roomEffects as effect (effect.type)}
				<RoomEffectCard
					{effect}
					active={selectedRoomEffect === effect.type}
					onselect={selectEffect}
				/>
			{/each}
		</div>
	</Popover.Content>
</Popover.Root>
