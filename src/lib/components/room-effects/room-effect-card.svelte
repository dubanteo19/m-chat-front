<script lang="ts">
	import { Check } from '@lucide/svelte';
	import type { RoomEffectDefinition } from './effect-registry';

	let {
		effect,
		active = false,
		onselect
	}: {
		effect: RoomEffectDefinition;
		active?: boolean;
		onselect: (effect: RoomEffectDefinition) => void;
	} = $props();
</script>

<button
	type="button"
	class="group relative min-w-0 overflow-hidden rounded-2xl border text-left transition-all duration-200 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none {active
		? 'border-primary bg-primary/10 shadow-sm'
		: 'border-border/70 bg-background/70 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-muted/60 hover:shadow-sm'}"
	aria-pressed={active}
	aria-label={`${effect.label}${active ? ', active' : ''}`}
	onclick={() => onselect(effect)}
>
	<div
		class="relative flex h-16 items-center justify-center overflow-hidden border-b border-white/10"
		style:background={effect.previewBackground}
		aria-hidden="true"
	>
		<div class="absolute inset-0 bg-linear-to-t from-black/20 to-white/10"></div>
		<span
			class="relative text-2xl drop-shadow-md transition-transform duration-200 group-hover:scale-110"
		>
			{effect.icon}
		</span>
		{#if active}
			<span
				class="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm"
			>
				<Check size={12} strokeWidth={3} />
			</span>
		{/if}
	</div>

	<div class="space-y-0.5 p-2.5">
		<div class="flex min-w-0 items-center gap-1.5">
			<span class="truncate text-xs font-semibold">{effect.label}</span>
			{#if active}
				<span class="ml-auto text-[10px] font-medium text-primary">Active</span>
			{/if}
		</div>
		<p class="line-clamp-2 text-[10px] leading-4 text-muted-foreground">{effect.description}</p>
	</div>
</button>
