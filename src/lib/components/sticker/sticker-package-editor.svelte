<script lang="ts">
	import { type CreateStickerPackageRequest } from '$lib/api/sticker-service';
	import { storageService } from '$lib/api/storage';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { Textarea } from '$lib/components/ui/textarea';
	import {
		StickerStatus,
		type StickerInfo,
		type StickerPackage,
		type StickerVisibility
	} from '$lib/types/sticker';
	import { Globe, Lock, Trash2 } from '@lucide/svelte';
	import FileUploader from '../common/file-uploader.svelte';
	import { useUserStickersQuery } from '$lib/queries/use-user-sticker';
	import { userEventService } from '$lib/services/user-event.svelte';
	import { onDestroy, onMount } from 'svelte';
	let {
		stickerPackage: initialPackage,
		onSave,
		onCancel
	}: {
		stickerPackage: StickerPackage | null;
		onSave: (pkg: CreateStickerPackageRequest) => void;
		onCancel: () => void;
	} = $props();

	const isEditing = $derived(initialPackage !== null);
	const { removeSticker, addStickerToPackage } = useUserStickersQuery();
	let name = $state(initialPackage?.name ?? '');
	let description = $state(initialPackage?.description ?? '');
	let visibility = $state<StickerVisibility>(initialPackage?.visibility ?? 'PRIVATE');
	let stickers = $state<StickerInfo[]>(initialPackage?.stickers || []);

	let optimisticIdCounter = 0;
	onMount(() => {
		userEventService.connect({
			onStickerStatusChanged: (event) => {
				stickers = stickers.map((sticker) =>
					sticker.id === event.stickerId ? { ...sticker, status: event.status } : sticker
				);
			}
		});
		return () => {
			userEventService.disconnect();
		};
	});
	async function handleFiles(files: FileList | null) {
		if (!initialPackage) return;
		if (!files) return;
		if (files.length > 30) return alert('You can only upload up to 80 stickers at a time.');
		const validFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
		const MAX_STICKERS = 50;
		const remaining = MAX_STICKERS - initialPackage.stickers.length;
		if (validFiles.length > remaining)
			return alert(`You can only add up to ${remaining} more stickers to this package.`);
		const concurrentUploads = 5;
		for (let i = 0; i < validFiles.length; i += concurrentUploads) {
			const chunk = validFiles.slice(i, i + concurrentUploads);
			await Promise.allSettled(chunk.map(processSticker));
		}
	}
	function generateOptimisticId() {
		return -++optimisticIdCounter;
	}
	async function processSticker(file: File) {
		const blob = URL.createObjectURL(file);
		const optimisticId = generateOptimisticId();
		const optimisticSticker: StickerInfo = {
			id: optimisticId,
			url: blob,
			status: StickerStatus.UPLOADING
		};
		stickers = [...stickers, { ...optimisticSticker }];
		try {
			if (!initialPackage) return;
			if (initialPackage.stickers.length >= 50)
				return alert('You can only add up to 50 stickers per package.');
			const { uploadUrl, objectKey } = await storageService.getPresignedUrl(file.name, 'STICKER');
			await storageService.uploadFile(uploadUrl, file);
			const stickerId = await addStickerToPackage(initialPackage.id, { objectKey });
			if (stickerId) {
				stickers = stickers.map((s) => (s.id === optimisticId ? { ...s, id: stickerId } : s));
			}
		} catch (error) {
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
	const onRemoveSticker = async (packageId: number, stickerId: number) => {
		try {
			stickers = stickers.filter((sticker) => sticker.id !== stickerId);
			await removeSticker(packageId, stickerId);
		} catch (error) {
			console.error('Error removing sticker:', error);
		}
	};
	onDestroy(() => {
		stickers.forEach((sticker) => {
			if (sticker.url.startsWith('blob:')) {
				URL.revokeObjectURL(sticker.url);
			}
		});
	});
</script>

<div
	class="mx-auto w-full md:max-h-[500px] 2xl:max-h-[800px] max-w-5xl space-y-4 p-6 overflow-y-auto"
>
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
				{#if initialPackage && stickers.length > 0}
					{#each stickers as sticker (sticker.id)}
						<div class="group relative aspect-square rounded-lg border bg-muted p-2">
							<img src={sticker.url} alt={'Sticker'} class="size-full object-contain" />
							{@render stickerStatus(sticker.status)}
							<Button
								class="absolute flex-center right-0 top-0 hidden rounded-full  group-hover:block"
								onclick={() => onRemoveSticker(initialPackage.id, sticker.id)}
								size="icon-sm"
								variant="destructive"
							>
								<Trash2 />
							</Button>
						</div>
					{/each}
				{/if}
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

{#snippet stickerStatus(status: StickerStatus)}
	<div
		class="absolute bottom-1 right-1 rounded-lg bg-black/70 p-1 text-[10px] text-white"
		class:bg-green-700={status === StickerStatus.READY}
		class:bg-blue-500={status === StickerStatus.UPLOADING}
		class:bg-yellow-500={status === StickerStatus.PROCESSING}
		class:bg-red-500={status === StickerStatus.FAILED}
		class:bg-orange-500={status === StickerStatus.QUEUED}
	>
		{status}
	</div>
{/snippet}
