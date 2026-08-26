<script lang="ts">
	let { onSelectGif }: { onSelectGif: (url: string) => void } = $props();

	let query = $state('');
	let gifs = $state<any[]>([]);
	let loading = $state(false);

	$effect(() => {
		const currentQuery = query;
		loading = true;

		const timer = setTimeout(async () => {
			const endpoint = currentQuery
				? `/api/giphy?q=${encodeURIComponent(currentQuery)}`
				: `/api/giphy`;

			try {
				const res = await fetch(endpoint);
				const result = await res.json();
				gifs = result.data || [];
			} catch (err) {
				console.error('Failed to load GIFs:', err);
			} finally {
				loading = false;
			}
		}, 500);

		return () => clearTimeout(timer);
	});
</script>

<div
	class="flex h-[580px] w-[520px] flex-col gap-2.5 rounded-xl bg-[#1e1e1e] p-2.5 text-white shadow-lg"
>
	<input
		type="text"
		placeholder="Search GIFs on Giphy..."
		bind:value={query}
		class="w-full rounded-md border border-[#333] bg-[#2a2a2a] px-3 py-2 text-sm text-white placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
	/>

	{#if loading}
		<div class="flex flex-1 items-center justify-center text-sm text-gray-400">Loading...</div>
	{:else if gifs.length === 0}
		<div class="flex flex-1 items-center justify-center text-sm text-gray-400">No GIFs found</div>
	{:else}
		<div class="grid flex-1 grid-cols-2 gap-2 overflow-y-auto pr-1">
			{#each gifs as gif (gif.id)}
				<button
					type="button"
					class="group relative overflow-hidden rounded-md border-0 bg-transparent p-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
					onclick={() => onSelectGif(gif.images.original.url)}
				>
					<img
						src={gif.images.fixed_height_small.url}
						alt={gif.title}
						loading="lazy"
						class="h-[100px] w-full object-cover transition-opacity duration-200 group-hover:opacity-80"
					/>
				</button>
			{/each}
		</div>
	{/if}

</div>
