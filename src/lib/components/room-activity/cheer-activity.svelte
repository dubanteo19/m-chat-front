<script lang="ts">
	type cheerImage = {
		id: number;
		x: number;
		y: number;
		rotation: number;
		scale: number;
	};

	let cheerImages = $state<cheerImage[]>([]);

	const CHEER_URL =
		'https://minio.dbt19.site/mchat-public/images/fe7aceca-528b-4cd7-97f5-fdcefab21f34.png';

	function play() {
		const id = Date.now() + Math.random();
		const x = 50 + (Math.random() - 0.5) * 30;
		const y = 50 + (Math.random() - 0.5) * 25;
		const cheer: cheerImage = {
			id,
			x,
			y,
			rotation: (Math.random() - 0.5) * 30,
			scale: 0.8 + Math.random() * 0.4
		};
		cheerImages.push(cheer);
		setTimeout(() => {
			cheerImages = cheerImages.filter((c) => c.id !== id);
		}, 2200);
	}

	export { play };
</script>

<div class="pointer-events-none fixed inset-0 z-[9999]">
	{#each cheerImages as cheer (cheer.id)}
		<div
			class="cheer"
			style="
				left: {cheer.x}%;
				top: {cheer.y}%;
				--rotation: {cheer.rotation}deg;
				--scale: {cheer.scale};
			"
		>
			<img src={CHEER_URL} alt="" class="h-24 w-24 drop-shadow-[0_8px_16px_rgba(0,0,0,0.25)]" />
		</div>
	{/each}
</div>

<style>
	.cheer {
		position: absolute;
		transform: translate(-50%, -50%);
		animation: cheer-pop 2.2s ease-out forwards;
	}

</style>
