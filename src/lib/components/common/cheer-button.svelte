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
	variant="outline"
	size="icon-sm"
	class="group absolute right-3 bottom-[4.75rem] z-30 size-8 rounded-md border-border bg-[#15171c]/95 p-0 shadow-lg backdrop-blur-sm transition-transform duration-300 hover:scale-110 hover:border-[#6257a8] hover:bg-[#24213a] active:scale-95"
	title="Send cheer"
	aria-label="Send cheer"
>
	<img
		src={CHEER_URL}
		alt="cheer"
		class="floating size-5 object-contain opacity-80 drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)] transition-all duration-300 group-hover:rotate-6 group-hover:opacity-100 group-hover:drop-shadow-[0_6px_14px_rgba(0,0,0,0.35)]"
	/>
</Button>

<style>
	.floating {
		animation: float 3s ease-in-out infinite;
	}
</style>
