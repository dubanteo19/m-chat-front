<script lang="ts">
	import type { CreateStickerPackageRequest } from '$lib/api/sticker';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { Sticker, StickerPackage, StickerVisibility } from '$lib/types/sticker';
	import { Globe, Lock, Trash2 } from '@lucide/svelte';
	import FileUploader from '../common/file-uploader.svelte';
	import { storageService } from '$lib/api/storage';
	import { stickerService } from '$lib/api/sticker-service';
	let {
		package: initialPackage,
		onSave,
		onCancel
	}: {
		package: StickerPackage | null;
		onSave: (pkg: CreateStickerPackageRequest) => void;
		onCancel: () => void;
	} = $props();

	const isEditing = $derived(initialPackage !== null);

	let name = $state(initialPackage?.name ?? '');
	let description = $state(initialPackage?.description ?? '');
	let visibility = $state<StickerVisibility>(initialPackage?.visibility ?? 'PRIVATE');

	let stickers = $derived(initialPackage?.stickers ?? []);

	async function handleFiles(files: FileList | null) {
		if (!files) return;
		for (const file of Array.from(files)) {
			if (!file.type.startsWith('image/')) continue;
			await processSticker(file);
		}
	}
	async function processSticker(file: File) {
		try {
			if (initialPackage?.id) {
				const { uploadUrl, downloadUrl } = await storageService.getPresignedUrl(
					file.name,
					'STICKER'
				);
				await storageService.uploadFile(uploadUrl, file);
				const createStickerRequest = {
					name: file.name,
					url: downloadUrl
				};
				const res = await stickerService.addStickerToPackage(
					initialPackage?.id,
					createStickerRequest
				);
				if (res) {
					stickers.push(res);
				}
			}
		} catch (error) {
			console.error('Error processing sticker:', error);
			throw error;
		}
	}
	function save() {
		const request: CreateStickerPackageRequest = {
			name: name.trim(),
			description: description.trim(),
			visibility
		};

		onSave(request);
	}
</script>

<div class="mx-auto w-full max-w-5xl space-y-4 p-6">
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
	{#if isEditing}
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
						<img
							src={sticker.url}
							alt={sticker.name ?? 'Sticker'}
							class="size-full object-contain"
						/>

						<Button
							class="absolute flex-center right-0 top-0 hidden rounded-full  group-hover:block"
							// onclick={() => removeSticker(sticker.id)}
							size="icon-sm"
							variant="destructive"
						>
							<Trash2 />
						</Button>
					</div>
				{/each}

				<FileUploader label="Add stickers" onFilesChanged={handleFiles} />
			</div>
		</div>
	{/if}
	<!-- Actions -->
	<div class="flex justify-end gap-2">
		<Button variant="destructive" onclick={onCancel}>Cancel</Button>

		<Button disabled={!name.trim()} onclick={save}>
			{isEditing ? 'Save Changes' : 'Create Package'}
		</Button>
	</div>
</div>
