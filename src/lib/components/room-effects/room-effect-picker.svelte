<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button';
	import { Sparkles } from '@lucide/svelte';
	import type { RoomEffect } from './effects/particles';
	import {
		getRoomEffectDefinition,
		roomEffectCategories,
		roomEffects,
		type RoomEffectCategory,
		type RoomEffectDefinition
	} from './effect-registry';
	import RoomEffectCard from './room-effect-card.svelte';

	let {
		selectedRoomEffect,
		onselect
	}: {
		selectedRoomEffect: RoomEffect | null;
		onselect: (effect: RoomEffect) => void;
	} = $props();

	let open = $state(false);
	let selectedCategory = $state<'all' | RoomEffectCategory>('all');

	let activeEffect = $derived(getRoomEffectDefinition(selectedRoomEffect));
	let filteredEffects = $derived(
		selectedCategory === 'all'
			? roomEffects
			: roomEffects.filter((effect) => effect.category === selectedCategory)
	);

	function selectEffect(effect: RoomEffectDefinition) {
		if (effect.type !== selectedRoomEffect) onselect(effect.type);
		open = false;
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		<Button
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
	</Popover.Trigger>

	<Popover.Content
		align="end"
		side="bottom"
		sideOffset={8}
		class="w-[min(92vw,30rem)] gap-3 rounded-3xl p-3 sm:p-4"
	>
		<Popover.Header class="gap-1 px-1">
			<Popover.Title class="flex items-center gap-2 text-base">
				<span
					class="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary"
				>
					<Sparkles size={15} />
				</span>
				Room effects
			</Popover.Title>
			<Popover.Description>Choose an atmosphere for everyone in this room.</Popover.Description>
		</Popover.Header>

		<div
			class="flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
		>
			{#each roomEffectCategories as category (category.value)}
				<Button
					type="button"
					size="xs"
					variant={selectedCategory === category.value ? 'secondary' : 'ghost'}
					class="shrink-0"
					onclick={() => (selectedCategory = category.value)}
				>
					{category.label}
				</Button>
			{/each}
		</div>

		<div class="grid max-h-[min(58vh,29rem)] grid-cols-2 gap-2 overflow-y-auto p-1 sm:grid-cols-3">
			{#each filteredEffects as effect (effect.type)}
				<RoomEffectCard
					{effect}
					active={selectedRoomEffect === effect.type}
					onselect={selectEffect}
				/>
			{/each}
		</div>
	</Popover.Content>
</Popover.Root>
