<script lang="ts">
	type Mooncake = {
		id: number;
		x: number;
		y: number;
		rotation: number;
		scale: number;
	};

	let mooncakes = $state<Mooncake[]>([]);

	const MOONCAKE_URL =
		'https://minio.dbt19.site/mchat-public/ca59e98f-b3c4-4ebf-ae81-da61e7efc660-image.png';

	function play() {
		const id = Date.now() + Math.random();
		const x = 50 + (Math.random() - 0.5) * 30;
		const y = 50 + (Math.random() - 0.5) * 25;
		const mooncake: Mooncake = {
			id,
			x,
			y,
			rotation: (Math.random() - 0.5) * 30,
			scale: 0.8 + Math.random() * 0.4
		};
		mooncakes.push(mooncake);
		setTimeout(() => {
			mooncakes = mooncakes.filter((cake) => cake.id !== id);
		}, 2200);
	}

	export { play };
</script>

<div class="pointer-events-none fixed inset-0 z-[9999]">
	{#each mooncakes as cake (cake.id)}
		<div
			class="mooncake"
			style="
				left: {cake.x}%;
				top: {cake.y}%;
				--rotation: {cake.rotation}deg;
				--scale: {cake.scale};
			"
		>
			<img src={MOONCAKE_URL} alt="" class="h-24 w-24 drop-shadow-[0_8px_16px_rgba(0,0,0,0.25)]" />
		</div>
	{/each}
</div>

<style>
	.mooncake {
		position: absolute;
		transform: translate(-50%, -50%);
		animation: mooncake-pop 2.2s ease-out forwards;
	}

	@keyframes mooncake-pop {
		0% {
			opacity: 0;
			transform: translate(-50%, -40%) scale(0.3) rotate(var(--rotation));
		}

		15% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(calc(var(--scale) * 1.15))
				rotate(calc(var(--rotation) * -0.5));
		}

		35% {
			transform: translate(-50%, -55%) scale(var(--scale)) rotate(var(--rotation));
		}

		70% {
			opacity: 0.9;
			transform: translate(-50%, -70px) scale(var(--scale)) rotate(calc(var(--rotation) * -1));
		}

		100% {
			opacity: 0;
			transform: translate(-50%, -140px) scale(calc(var(--scale) * 0.8)) rotate(var(--rotation));
		}
	}
</style>
