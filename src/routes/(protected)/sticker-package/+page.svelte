<script lang="ts">
	import { stickerService, type CreateStickerPackageRequest } from '$lib/api/sticker-service';
	import StickerPackageCard from '$lib/components/sticker/sticker-package-card.svelte';
	import StickerPackageEditor from '$lib/components/sticker/sticker-package-editor.svelte';
	import { Button } from '$lib/components/ui/button';

	import * as Dialog from '$lib/components/ui/dialog';
	import { Spinner } from '$lib/components/ui/spinner';
	import { useUserStickersQuery } from '$lib/queries/use-user-sticker';
	import { type StickerPackage } from '$lib/types/sticker';
	import { Plus } from '@lucide/svelte';
	const { query } = useUserStickersQuery();
	const { data: packages = [], isLoading } = $derived(query);
	let editingPackage = $state<StickerPackage | null>(null);
	let isEditing = $derived(editingPackage !== null);
	function createPackage() {
		editingPackage = null;
	}

	function editPackage(pkg: StickerPackage) {
		editingPackage = pkg;
	}

	function closeEditor() {
		editingPackage = null;
	}

	async function savePackage(request: CreateStickerPackageRequest) {
		try {
			const response = await stickerService.save(request);
			if (response.id) {
				editingPackage = response;
			}
		} catch (error) {
			console.error('Error saving sticker package:', error);
		}
	}

	// function deletePackage(id: number) {
	// 	packages = packages.filter((pkg) => pkg.id !== id);
	// }
</script>

<div class="mx-auto w-full max-w-4xl space-y-6 p-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div class="space-y-1">
			<h1>My Stickers</h1>
			<p class="text-sm">Create and manage your sticker packages.</p>
		</div>
		<Dialog.Root bind:open={isEditing}>
			<Dialog.Trigger>
				<Button onclick={createPackage}>
					<Plus class="mr-2 size-4" />
					New Package
				</Button>
			</Dialog.Trigger>
			<Dialog.Content class="sm:max-w-4xl">
				<StickerPackageEditor
					package={editingPackage}
					onSave={savePackage}
					onCancel={closeEditor}
				/>
			</Dialog.Content>
		</Dialog.Root>
	</div>
	{#if isLoading}
		<div class="flex-center min-h-60">
			<Spinner />
		</div>
	{/if}
	{#if packages.length > 0}
		<div class="grid gap-4 sm:grid-cols-2">
			{#each packages as pkg (pkg.id)}
				<StickerPackageCard
					{pkg}
					onEdit={() => editPackage(pkg)}
					onDelete={() => {
						// deletePackage(pkg.id);
					}}
				/>
			{/each}
		</div>
	{:else}
		<div class="flex-center min-h-60 flex-col rounded-lg border border-dashed">
			<p class="text-sm text-muted-foreground">You don't have any sticker packages yet.</p>

			<Button class="mt-4" variant="outline" onclick={createPackage}>
				<Plus class="mr-2 size-4" />
				Create your first package
			</Button>
		</div>
	{/if}
</div>
