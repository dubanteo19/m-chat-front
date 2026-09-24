<script lang="ts">
	import StickerPackageCard from '$lib/components/sticker/sticker-package-card.svelte';
	import StickerPackageEditor from '$lib/components/sticker/sticker-package-editor.svelte';
	import { Button } from '$lib/components/ui/button';

	import * as Dialog from '$lib/components/ui/dialog';
	import { MOCK_STICKER_PACKAGES, type StickerPackage } from '$lib/types/sticker';
	import { Plus } from '@lucide/svelte';

	let packages = $state<StickerPackage[]>([...MOCK_STICKER_PACKAGES]);

	let editingPackage = $state<StickerPackage | null>(null);
	let isCreating = $state(false);

	function createPackage() {
		isCreating = true;
		editingPackage = null;
	}

	function editPackage(pkg: StickerPackage) {
		editingPackage = pkg;
		isCreating = false;
	}

	function closeEditor() {
		editingPackage = null;
		isCreating = false;
	}

	function savePackage(pkg: StickerPackage) {
		const index = packages.findIndex((item) => item.id === pkg.id);

		if (index === -1) {
			packages.push(pkg);
		} else {
			packages[index] = pkg;
		}

		closeEditor();
	}

	function deletePackage(id: string) {
		packages = packages.filter((pkg) => pkg.id !== id);
	}
</script>

<div class="mx-auto w-full max-w-4xl space-y-6 p-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div class="space-y-1">
			<h1>My Stickers</h1>
			<p class="text-sm">Create and manage your sticker packages.</p>
		</div>
		<Dialog.Root>
			<Dialog.Trigger>
				<Button onclick={createPackage}>
					<Plus class="mr-2 size-4" />
					New Package
				</Button>
			</Dialog.Trigger>
			<Dialog.Content class="sm:max-w-4xl">
				<StickerPackageEditor package={null} onSave={savePackage} onCancel={closeEditor} />
			</Dialog.Content>
		</Dialog.Root>
	</div>

	<!-- Packages -->
	<div class="grid gap-4 sm:grid-cols-2">
		{#each packages as pkg (pkg.id)}
			<StickerPackageCard
				{pkg}
				onEdit={() => editPackage(pkg)}
				onDelete={() => deletePackage(pkg.id)}
			/>
		{/each}
	</div>

	{#if packages.length === 0}
		<div class="flex-center min-h-60 flex-col rounded-lg border border-dashed">
			<p class="text-sm text-muted-foreground">You don't have any sticker packages yet.</p>

			<Button class="mt-4" variant="outline" onclick={createPackage}>
				<Plus class="mr-2 size-4" />
				Create your first package
			</Button>
		</div>
	{/if}
</div>
