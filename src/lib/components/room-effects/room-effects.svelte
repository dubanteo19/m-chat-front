<script lang="ts">
	import { untrack } from 'svelte';
	import { ParticleEngine, type RoomEffect } from './effects/particles';

	let {
		roomEffect,
		messageActivity = 0,
		reactionActivity = 0
	}: {
		roomEffect: RoomEffect | null;
		messageActivity?: number;
		reactionActivity?: number;
	} = $props();
	let canvas: HTMLCanvasElement;
	let currentEngine = $state<ParticleEngine | null>(null);

	$effect(() => {
		if (!canvas || !roomEffect) return;
		const engine = new ParticleEngine(canvas, roomEffect);
		currentEngine = engine;
		engine.start();

		return () => {
			engine.destroy();
			currentEngine = null;
		};
	});

	$effect(() => {
		void messageActivity;
		untrack(() => currentEngine?.activity('message'));
	});
	$effect(() => {
		void reactionActivity;
		untrack(() => currentEngine?.activity('reaction'));
	});
</script>

<div class="absolute inset-0 pointer-events-none overflow-hidden z-0">
	<canvas bind:this={canvas} class="absolute inset-0 h-full w-full pointer-events-none"></canvas>
</div>
