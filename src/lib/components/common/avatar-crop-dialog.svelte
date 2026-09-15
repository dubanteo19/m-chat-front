<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { onDestroy, untrack } from 'svelte';

	let {
		file,
		onapply,
		oncancel
	}: {
		file: File;
		onapply: (file: File) => void;
		oncancel: () => void;
	} = $props();
	const source = untrack(() => URL.createObjectURL(file));
	let image: HTMLImageElement;
	let canvas: HTMLCanvasElement;
	let loaded = $state(false);
	let zoom = $state(1);
	let horizontal = $state(50);
	let vertical = $state(50);
	let error = $state('');
	let applying = $state(false);
	let active = true;

	onDestroy(() => {
		active = false;
		URL.revokeObjectURL(source);
	});
	$effect(() => {
		if (!loaded || !canvas) return;
		const size = Math.min(image.naturalWidth, image.naturalHeight) / zoom;
		const x = ((image.naturalWidth - size) * horizontal) / 100;
		const y = ((image.naturalHeight - size) * vertical) / 100;
		const context = canvas.getContext('2d');
		context?.clearRect(0, 0, 512, 512);
		context?.drawImage(image, x, y, size, size, 0, 0, 512, 512);
	});

	function apply() {
		if (!loaded || applying) return;
		applying = true;
		canvas.toBlob((blob) => {
			if (!active) return;
			applying = false;
			if (!blob) {
				error = 'Could not prepare this photo. Please choose another image.';
				return;
			}
			onapply(new File([blob], 'avatar.png', { type: 'image/png' }));
		}, 'image/png');
	}
</script>

<Dialog.Root
	open
	onOpenChange={(open) => {
		if (!open) oncancel();
	}}
>
	<Dialog.Content
		class="max-h-[90dvh] overflow-y-auto border border-slate-700 bg-slate-950 text-slate-100"
	>
		<Dialog.Header>
			<Dialog.Title>Adjust photo</Dialog.Title>
			<Dialog.Description class="text-slate-400"
				>Choose the area to keep. Your avatar will appear as a circle.</Dialog.Description
			>
		</Dialog.Header>
		<img
			bind:this={image}
			src={source}
			alt=""
			hidden
			onload={() => (loaded = true)}
			onerror={() => (error = 'This image could not be opened. Please choose another image.')}
		/>
		<div class="crop-preview">
			<canvas bind:this={canvas} width="512" height="512" aria-label="Cropped avatar preview"
			></canvas>
		</div>
		{#if error}<p role="alert" class="text-sm text-red-300">{error}</p>{/if}
		<fieldset disabled={!loaded || applying} class="grid gap-4">
			<label>Zoom <input type="range" min="1" max="3" step="0.01" bind:value={zoom} /></label>
			<label
				>Horizontal position <input type="range" min="0" max="100" bind:value={horizontal} /></label
			>
			<label>Vertical position <input type="range" min="0" max="100" bind:value={vertical} /></label
			>
		</fieldset>
		<Dialog.Footer>
			<Button variant="ghost" onclick={oncancel}>Cancel</Button>
			<Button disabled={!loaded || applying || !!error} onclick={apply}>Use photo</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<style>
	.crop-preview {
		width: min(100%, 240px);
		margin: auto;
		aspect-ratio: 1;
		overflow: hidden;
		border-radius: 50%;
		background: #1e293b;
	}
	canvas {
		width: 100%;
		height: 100%;
	}
	label {
		display: grid;
		gap: 4px;
		font-size: 14px;
	}
	input {
		width: 100%;
		min-height: 32px;
		accent-color: #38bdf8;
	}
</style>
