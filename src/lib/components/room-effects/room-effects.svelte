<script lang="ts">
	import { ParticleEngine, type RoomEffect } from './effects/particles';

	let { roomEffect }: { roomEffect: RoomEffect | null } = $props();
	let canvas: HTMLCanvasElement;

	$effect(() => {
		if (!canvas || !roomEffect) return;
		const engine = new ParticleEngine(canvas, roomEffect);
		engine.start();

		return () => {
			engine.destroy();
		};
	});
</script>

<div class="absolute inset-0 pointer-events-none overflow-hidden z-0">
	<canvas bind:this={canvas} class="absolute inset-0 h-full w-full pointer-events-none"></canvas>
</div>
