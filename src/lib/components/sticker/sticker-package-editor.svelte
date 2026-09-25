<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { Sticker, StickerPackage, StickerVisibility } from '$lib/types/sticker';
	import { Globe, Lock, Trash2, Upload } from '@lucide/svelte';
	let {
		package: initialPackage,
		onSave,
		onCancel
	}: {
		package: StickerPackage | null;
		onSave: (pkg: StickerPackage) => void;
		onCancel: () => void;
	} = $props();

	const isEditing = initialPackage !== null;

	let name = $state(initialPackage?.name ?? '');
	let description = $state(initialPackage?.description ?? '');
	let visibility = $state<StickerVisibility>(initialPackage?.visibility ?? 'PRIVATE');

	let stickers = $state<Sticker[]>(initialPackage ? [...initialPackage.stickers] : []);
	function removeSticker(id: string) {
		stickers = stickers.filter((sticker) => sticker.id !== id);
	}

	function handleFiles(files: FileList | null) {
		if (!files) return;

		for (const file of Array.from(files)) {
			if (!file.type.startsWith('image/')) continue;

			const sticker: Sticker = {
				id: crypto.randomUUID(),
				url: URL.createObjectURL(file),
				name: file.name
			};

			stickers.push(sticker);
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		handleFiles(event.dataTransfer?.files ?? null);
	}

	function save() {
		if (!name.trim()) return;

		const now = new Date().toISOString();

		const pkg: StickerPackage = {
			id: initialPackage?.id ?? crypto.randomUUID(),
			name: name.trim(),
			description: description.trim(),
			visibility,
			stickers,
			createdAt: initialPackage?.createdAt ?? now,
			updatedAt: now
		};

		onSave(pkg);
	}
</script>

<div class="mx-auto w-full max-w-5xl space-y-4 p-6">
	<!-- Header -->
	<div class="flex items-center gap-3">
		<div>
			<h1 class="text-2xl font-semibold">
				{isEditing ? 'Edit Sticker Package' : 'Create Sticker Package'}
			</h1>

			<p class="text-sm text-muted-foreground">
				{isEditing
					? 'Manage your stickers and package information.'
					: 'Give your sticker package some basic information.'}
			</p>
		</div>
	</div>

	<!-- Basic information -->
	<div class="rounded-xl border p-6">
		<div class="space-y-5">
			<div class="space-y-2">
				<Label for="name">Name</Label>
				<Input id="name" bind:value={name} placeholder="e.g. Cute Cats" />
			</div>

			<div class="space-y-2">
				<Label for="description">Description</Label>
				<Textarea
					id="description"
					bind:value={description}
					placeholder="Tell people what this package is about..."
					rows={3}
				/>
			</div>

			<div class=" flex items-baseline gap-2">
				<Label>Visibility:</Label>
				<Select.Root type="single" bind:value={visibility}>
					<Select.Trigger class="w-[180px]">
						<Select.Value>
							{#snippet children({ selection })}
								<div class="flex items-center">
									{#if visibility === 'PUBLIC'}
										<Globe class="mr-2 size-4" />
									{:else if visibility === 'PRIVATE'}
										<Lock class="mr-2 size-4" />
									{/if}
									{selection.selected?.label}
								</div>
							{/snippet}
						</Select.Value>
					</Select.Trigger>

					<Select.Content>
						<Select.Item value="PUBLIC">
							<div class="flex items-center">
								<Globe class="mr-2 size-4" />
								Public
							</div>
						</Select.Item>

						<Select.Item value="PRIVATE">
							<div class="flex items-center">
								<Lock class="mr-2 size-4" />
								Private
							</div>
						</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
		</div>
	</div>

	<!-- Stickers -->
	<div class="rounded-xl border p-6">
		<div class="mb-4">
			<h2 class="font-medium">Stickers</h2>

			<p class="text-sm text-muted-foreground">
				Add stickers and arrange them in the order you want.
			</p>
		</div>

		<div class="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
			{#each stickers as sticker (sticker.id)}
				<div class="group relative aspect-square rounded-lg border bg-muted p-2">
					<img src={sticker.url} alt={sticker.name ?? 'Sticker'} class="size-full object-contain" />

					<Button
						class="absolute flex-center right-0 top-0 hidden rounded-full  group-hover:block"
						onclick={() => removeSticker(sticker.id)}
						size="icon-sm"
						variant="destructive"
					>
						<Trash2 />
					</Button>
				</div>
			{/each}

			<!-- Upload -->
			<label
				class="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed text-center transition hover:bg-muted"
				ondragover={(event) => event.preventDefault()}
				ondrop={handleDrop}
			>
				<Upload class="mb-2 size-5 text-muted-foreground" />

				<span class="text-xs font-medium"> Add stickers </span>

				<span class="mt-1 px-2 text-[10px] text-muted-foreground"> Drop or click </span>

				<input
					type="file"
					accept="image/*"
					multiple
					class="hidden"
					onchange={(event) => handleFiles(event.currentTarget.files)}
				/>
			</label>
		</div>
	</div>

	<!-- Actions -->
	<div class="flex justify-end gap-2">
		<Button variant="destructive" onclick={onCancel}>Cancel</Button>

		<Button disabled={!name.trim()} onclick={save}>
			{isEditing ? 'Save Changes' : 'Create Package'}
		</Button>
	</div>
</div>
