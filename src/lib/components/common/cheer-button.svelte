<script lang="ts">
	import Button from '../ui/button/button.svelte';
	const CHEER_URL =
		'https://minio.dbt19.site/mchat-public/images/fe7aceca-528b-4cd7-97f5-fdcefab21f34.png';
	interface CheerButtonProps {
		onclick: () => void;
	}
	let { onclick }: CheerButtonProps = $props();
</script>

<Button
	{onclick}
	variant="link"
	class="group absolute right-5 bottom-24 z-50
					flex rounded-full p-0
					transition-transform duration-300
					hover:scale-110
					active:scale-95"
>
	<img
		src={CHEER_URL}
		alt="cheer"
		class="h-12 w-12
							drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)]
							floating
							transition-all duration-300
							group-hover:rotate-6
							group-hover:drop-shadow-[0_6px_14px_rgba(0,0,0,0.35)]"
	/>
</Button>

<style>
	.floating {
		animation: float 3s ease-in-out infinite;
	}
</style>
