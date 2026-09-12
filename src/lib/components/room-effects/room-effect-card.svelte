<script lang="ts">
	import { Check } from '@lucide/svelte';
	import type { RoomEffectDefinition } from './effect-registry';

	let {
		effect,
		active = false,
		onselect,
		onhover,
		onfocuschange
	}: {
		effect: RoomEffectDefinition;
		active?: boolean;
		onselect: (effect: RoomEffectDefinition) => void;
		onhover?: (effect: RoomEffectDefinition | null) => void;
		onfocuschange?: (effect: RoomEffectDefinition | null) => void;
	} = $props();
</script>

<button
	type="button"
	class="flex min-h-20 w-full min-w-0 items-center gap-3 rounded-2xl border p-3 text-left transition-colors duration-150 motion-reduce:transition-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none {active
		? 'border-primary/50 bg-primary/10'
		: 'border-border/60 bg-background/40 hover:border-border hover:bg-muted/60'}"
	aria-pressed={active}
	aria-label={`${effect.label}${active ? ', active' : ''}`}
	title={`${effect.label} — ${effect.description}`}
	onclick={() => onselect(effect)}
	onpointerenter={(event) => {
		if (event.pointerType !== 'touch') onhover?.(effect);
	}}
	onpointerleave={() => onhover?.(null)}
	onfocus={() => onfocuschange?.(effect)}
	onblur={() => onfocuschange?.(null)}
>
	<div
		class="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl ring-1 ring-inset ring-foreground/5"
		style:background={effect.previewBackground}
		aria-hidden="true"
	>
		<div class="absolute inset-0 bg-linear-to-t from-black/20 to-white/10"></div>
		<span class="relative text-2xl leading-none drop-shadow-sm">
			{effect.icon}
		</span>
	</div>

	<span class="min-w-0 flex-1 text-[13px] leading-5 font-medium break-words">{effect.label}</span>
	<span class="flex size-4 shrink-0 items-center justify-center text-primary" aria-hidden="true">
		{#if active}<Check size={16} strokeWidth={2.5} />{/if}
	</span>
</button>
