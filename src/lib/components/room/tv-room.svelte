<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { SearchIcon, XIcon } from '@lucide/svelte';
	import YouTubePlayer from 'youtube-player';

	let container: HTMLDivElement | null = $state(null);
	let player: ReturnType<typeof YouTubePlayer>;

	let query = $state('');
	let videos = $state<any[]>([]);
	let loading = $state(false);
	let selectedVideo = $state<any | null>(null);

	$effect(() => {
		if (!container) return;
		player = YouTubePlayer(container, {
			width: '100%',
			height: '100%',
			playerVars: {
				autoplay: 0,
				controls: 1,
				rel: 0,
				origin: window.location.origin
			}
		});

		return () => {
			player.destroy();
		};
	});

	async function search() {
		if (!query.trim()) return;

		loading = true;

		try {
			const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`);

			if (!response.ok) {
				throw new Error('Failed to search YouTube');
			}

			const data = await response.json();
			videos = data.items ?? data;
		} finally {
			loading = false;
		}
	}

	function getThumbnail(video: any) {
		const thumbnails = video.thumbnail?.thumbnails ?? [];

		return thumbnails.at(-1)?.url ?? '';
	}

	async function playVideo(video: any) {
		if (!video) return;
		selectedVideo = video;

		const res = await player.loadVideoById(video.id);
		console.log('Video loaded:', res);
	}

	async function closePlayer() {
		selectedVideo = null;
		await player.stopVideo();
	}
</script>

<div class="flex h-full min-h-56 flex-col gap-4">
	<!-- Player -->
	<div class="relative shrink-0 overflow-hidden rounded-xl bg-black" hidden={!selectedVideo}>
		<div class="aspect-video w-full" bind:this={container}></div>
		<!-- Close button -->
		<button
			type="button"
			onclick={closePlayer}
			class="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black"
			aria-label="Close player"
		>
			<XIcon />
		</button>
	</div>

	{#if selectedVideo}
		<div class="shrink-0">
			<h2 class="line-clamp-2 font-semibold">
				{selectedVideo.title}
			</h2>

			<p class="mt-1 text-sm text-muted-foreground">
				{selectedVideo.channelTitle}
			</p>
		</div>
	{/if}
	<!-- Search -->
	<form
		class="flex shrink-0 gap-2"
		onsubmit={(event) => {
			event.preventDefault();
			search();
		}}
	>
		<div class="relative flex-1">
			<SearchIcon class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

			<input
				bind:value={query}
				placeholder="Search YouTube..."
				class="h-10 w-full rounded-lg border-primary border-white border-2 pl-10 pr-4 outline-none transition focus:ring-2"
			/>
		</div>

		<Button type="submit" disabled={loading || !query.trim()}>
			{loading ? 'Searching...' : 'Search'}
		</Button>
	</form>

	<!-- Results -->
	<div class="min-h-0 flex-1 overflow-y-auto">
		{#if loading}
			<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each Array(8) as _, index (index)}
					<div class="animate-pulse">
						<div class="aspect-video rounded-xl bg-muted"></div>
						<div class="mt-3 h-4 w-4/5 rounded bg-muted"></div>
						<div class="mt-2 h-3 w-2/5 rounded bg-muted"></div>
					</div>
				{/each}
			</div>
		{:else if videos.length === 0}
			<div class="flex h-full items-center justify-center">
				<div class="text-center text-muted-foreground">
					<div class="mb-2 text-4xl">📺</div>
					<p>Search for something to watch</p>
				</div>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each videos as video (video.id)}
					<button type="button" class="group min-w-0 text-left" onclick={() => playVideo(video)}>
						<!-- Thumbnail -->
						<div class="relative aspect-video overflow-hidden rounded-xl bg-muted">
							<img
								src={getThumbnail(video)}
								alt={video.title}
								class="h-full w-full object-cover transition duration-200 group-hover:scale-105"
								loading="lazy"
							/>

							<!-- Duration -->
							{#if video.length?.simpleText}
								<div
									class="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white"
								>
									{video.length.simpleText}
								</div>
							{/if}

							<!-- Live -->
							{#if video.isLive}
								<div
									class="absolute left-2 top-2 rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white"
								>
									LIVE
								</div>
							{/if}

							<!-- Play overlay -->
							<div
								class="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20"
							>
								<div
									class="flex h-12 w-12 scale-75 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:scale-100 group-hover:opacity-100"
								>
									<svg class="ml-0.5 h-5 w-5 fill-current" viewBox="0 0 24 24">
										<path d="M8 5v14l11-7z" />
									</svg>
								</div>
							</div>
						</div>

						<!-- Video info -->
						<div class="mt-3">
							<h3 class="line-clamp-2 text-sm font-semibold leading-5" title={video.title}>
								{video.title}
							</h3>

							<p class="mt-1 line-clamp-1 text-xs text-muted-foreground">
								{video.channelTitle}
							</p>
						</div>
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>
