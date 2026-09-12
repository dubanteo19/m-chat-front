<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Search, Sparkles } from '@lucide/svelte';
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
	let search = $state('');
	let effectList: HTMLDivElement | null = $state(null);
	let selectedCategory = $state<'all' | RoomEffectCategory>('all');
	let hoveredEffect = $state<RoomEffectDefinition | null>(null);
	let focusedEffect = $state<RoomEffectDefinition | null>(null);

	let activeEffect = $derived(getRoomEffectDefinition(selectedRoomEffect));
	const detailEffect = $derived(hoveredEffect ?? focusedEffect ?? activeEffect);
	let filteredEffects = $derived(
		roomEffects.filter(
			(effect) =>
				(selectedCategory === 'all' || effect.category === selectedCategory) &&
				`${effect.label} ${effect.description}`.toLowerCase().includes(search.trim().toLowerCase())
		)
	);

	$effect(() => {
		// Start each filtered result set at the top of the list.
		void filteredEffects;
		hoveredEffect = null;
		focusedEffect = null;
		if (effectList) effectList.scrollTop = 0;
	});

	function selectEffect(effect: RoomEffectDefinition) {
		if (effect.type !== selectedRoomEffect) onselect(effect.type);
		open = false;
	}
</script>

<Popover.Root
	bind:open
	onOpenChange={(value) => {
		if (!value) {
			search = '';
			selectedCategory = 'all';
			hoveredEffect = null;
			focusedEffect = null;
		}
	}}
>
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
		class="max-h-[min(85dvh,var(--bits-popover-content-available-height,85dvh))] w-[min(92vw,32rem)] gap-3 overflow-hidden rounded-3xl p-3 sm:p-4"
	>
		<Popover.Header class="shrink-0 gap-1 px-1">
			<Popover.Title class="flex items-center gap-2 text-base">
				<span
					class="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary"
				>
					<Sparkles size={15} />
				</span>
				Room effects
				<span
					class="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground"
					>{roomEffects.length}</span
				>
			</Popover.Title>
			<Popover.Description>Choose an atmosphere for everyone in this room.</Popover.Description>
		</Popover.Header>

		<div class="relative shrink-0">
			<Search
				class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
			/>
			<Input
				bind:value={search}
				type="search"
				placeholder="Find an effect…"
				aria-label="Search room effects"
				class="pl-9"
			/>
		</div>
		<div class="flex shrink-0 flex-wrap gap-1" role="group" aria-label="Effect categories">
			{#each roomEffectCategories as category (category.value)}
				<Button
					type="button"
					size="sm"
					variant={selectedCategory === category.value ? 'secondary' : 'ghost'}
					class="min-h-10 shrink-0 px-3"
					aria-pressed={selectedCategory === category.value}
					onclick={() => (selectedCategory = category.value)}
				>
					{category.label}
				</Button>
			{/each}
		</div>

		<div
			bind:this={effectList}
			class="effect-list min-h-0 flex-1 overflow-y-auto overscroll-contain p-1"
			role="region"
			aria-label="Room effects"
		>
			{#if filteredEffects.length === 0}
				<div class="space-y-2 py-8 text-center" role="status">
					<p class="text-sm font-medium">No matching effects</p>
					<p class="text-xs text-muted-foreground">Try another name or category.</p>
					<Button
						variant="outline"
						size="sm"
						onclick={() => {
							search = '';
							selectedCategory = 'all';
						}}>Clear filters</Button
					>
				</div>
			{:else}
				<div class="grid grid-cols-1 gap-2 min-[480px]:grid-cols-2">
					{#each filteredEffects as effect (effect.type)}
						<RoomEffectCard
							{effect}
							active={selectedRoomEffect === effect.type}
							onselect={selectEffect}
							onhover={(effect) => (hoveredEffect = effect)}
							onfocuschange={(effect) => (focusedEffect = effect)}
						/>
					{/each}
				</div>
			{/if}
		</div>
		<div
			class="flex min-h-20 shrink-0 items-center gap-3 border-t border-border px-1 pt-3 text-xs text-muted-foreground"
		>
			{#if detailEffect}
				<span
					class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-xl"
					aria-hidden="true">{detailEffect.icon}</span
				>
				<div class="min-w-0 flex-1 space-y-1">
					<div class="flex items-center gap-2">
						<p class="font-medium break-words text-foreground">{detailEffect.label}</p>
						{#if detailEffect.type === selectedRoomEffect}<span
								class="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary"
								>Active</span
							>{/if}
					</div>
					<p class="leading-4">{detailEffect.description}</p>
				</div>
			{:else}
				<Sparkles size={15} />
				<p>Select an effect to activate it for everyone.</p>
			{/if}
		</div>
	</Popover.Content>
</Popover.Root>

<style>
	.effect-list {
		scrollbar-gutter: stable;
		scrollbar-width: thin;
		scrollbar-color: color-mix(in oklab, var(--muted-foreground) 45%, var(--popover)) var(--popover);
		border-radius: 0.75rem;
	}

	@supports selector(::-webkit-scrollbar) {
		.effect-list {
			scrollbar-width: auto;
			scrollbar-color: auto;
		}
		.effect-list::-webkit-scrollbar {
			width: 6px;
		}
		.effect-list::-webkit-scrollbar-track {
			background: var(--popover);
		}
		.effect-list::-webkit-scrollbar-thumb {
			border: 1px solid var(--popover);
			border-radius: 999px;
			background: color-mix(in oklab, var(--muted-foreground) 45%, var(--popover));
		}
		.effect-list::-webkit-scrollbar-thumb:hover {
			background: var(--muted-foreground);
		}
		.effect-list::-webkit-scrollbar-button {
			display: none;
			width: 0;
			height: 0;
		}
	}
</style>
