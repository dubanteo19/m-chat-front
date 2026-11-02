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
	const { query, upsertStickerPackage, deletePackage } = useUserStickersQuery();
	const { data: packs = [], isLoading } = $derived(query);
	let editingPackage = $state<StickerPackage | null>(null);
	let packToDelete = $state<number | null>(null);
	let isEditing = $derived(editingPackage !== null);
	function createPackage() {
		editingPackage = null;
	}

	function editPackage(pkg: StickerPackage) {
		editingPackage = pkg;
	}
	async function handleDownload(pack: StickerPackage) {
		try {
			const { downloadUrl } = await stickerService.download(pack.id);
			window.open(downloadUrl, '_blank');
		} catch (error) {
			console.error('Error saving sticker package:', error);
		}
	}
	async function savePackage(request: CreateStickerPackageRequest) {
		try {
			if (editingPackage) return;
			const response = await upsertStickerPackage(request);
			if (response.id) {
				editingPackage = response;
			}
		} catch (error) {
			console.error('Error saving sticker package:', error);
		}
	}

	async function handleDelete(id: number) {
		try {
			await deletePackage(id);
			packToDelete = null;
		} catch (error) {
			console.error('Error deleting sticker package:', error);
		}
	}
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
					stickerPackage={editingPackage}
					onSave={savePackage}
					onCancel={() => (editingPackage = null)}
				/>
			</Dialog.Content>
		</Dialog.Root>
	</div>
	{#if isLoading}
		<div class="flex-center min-h-60">
			<Spinner />
		</div>
	{/if}
	{#if packs.length > 0}
		<div class="grid gap-4 sm:grid-cols-2">
			{#each packs as pkg (pkg.id)}
				<StickerPackageCard
					{pkg}
					onEdit={() => editPackage(pkg)}
					onDownload={() => handleDownload(pkg)}
					onDelete={() => {
						packToDelete = pkg.id;
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

<Dialog.Root
	open={packToDelete !== null}
	onOpenChange={(value) => {
		if (!value) packToDelete = null;
	}}
>
	<Dialog.Content onCloseAutoFocus={(event) => event.preventDefault()} class="rounded-3xl">
		<Dialog.Header>
			<Dialog.Title>Delete Pack?</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete this sticker package? This action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (packToDelete = null)}>Cancel</Button>
			<Button
				variant="destructive"
				onclick={() => {
					if (packToDelete !== null) handleDelete(packToDelete);
				}}>Delete Pack</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
