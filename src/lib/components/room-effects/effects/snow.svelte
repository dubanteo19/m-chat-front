<script lang="ts">
    import { onMount } from "svelte";
    import { ParticleEngine } from "./particles";

    let canvas: HTMLCanvasElement;
    let engine: ParticleEngine;

    onMount(() => {
        engine = new ParticleEngine(canvas, "snow");

        engine.start();

        return () => {
            engine.destroy();
        };
    });
</script>

<canvas
    bind:this={canvas}
    class="absolute inset-0 h-full w-full pointer-events-none"
/>