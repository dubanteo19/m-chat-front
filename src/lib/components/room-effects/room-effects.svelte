<script lang="ts">
	import Snow from "./effects/snow.svelte";


    import { RoomEffectType } from "./types";

    const effect = RoomEffectType.SNOW;
</script>

<div class="absolute inset-0 pointer-events-none overflow-hidden z-0">
    {#if effect === RoomEffectType.SNOW}
        <Snow />
    {:else if effect === RoomEffectType.SAKURA}
    <div></div>
    {/if}
</div>