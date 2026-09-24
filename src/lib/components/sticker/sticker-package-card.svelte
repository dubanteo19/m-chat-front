<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import type { StickerPackage } from '$lib/types/sticker';
	import { Globe, Lock } from '@lucide/svelte';

	let {
		pkg,
		onEdit,
		onDelete
	}: {
		pkg: StickerPackage;
		onEdit: () => void;
		onDelete: () => void;
	} = $props();

	const previewStickers = $derived(pkg.stickers.slice(0, 4));
</script>

<div class="group relative rounded-xl border bg-card/30 p-4">
	<div class="flex gap-4">
		<!-- Sticker preview -->
		<div class="grid size-24 shrink-0 grid-cols-2 gap-1 rounded-lg bg-muted p-2">
			{#each previewStickers as sticker (sticker.id)}
				<div class="flex items-center justify-center overflow-hidden rounded-md">
					<img src={sticker.url} alt={sticker.name ?? 'Sticker'} class="size-full object-contain" />
				</div>
			{/each}
		</div>

		<!-- Information -->
		<div class="min-w-0 flex-1">
			<div class="flex items-start justify-between gap-2">
				<div class="min-w-0">
					<h3 class="truncate font-medium">
						{pkg.name}
					</h3>

					<p class="mt-1 line-clamp-2 text-sm">
						{pkg.description}
					</p>
				</div>

				<!-- <DropdownMenu.Root>
					<DropdownMenu.Trigger>
						<Button variant="ghost" size="icon">
							<MoreHorizontal class="size-4" />
						</Button>
					</DropdownMenu.Trigger>

					<DropdownMenu.Content align="end">
						<DropdownMenu.Item onclick={onEdit}>
							<Pencil class="mr-2 size-4" />
							Edit
						</DropdownMenu.Item>

						<DropdownMenu.Item class="text-destructive" onclick={onDelete}>
							<Trash2 class="mr-2 size-4" />
							Delete
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root> -->
			</div>

			<div class="mt-3 flex items-center gap-2">
				<Badge variant="secondary">
					{#if pkg.visibility === 'PUBLIC'}
						<Globe class="mr-1 size-3" />
						Public
					{:else}
						<Lock class="mr-1 size-3" />
						Private
					{/if}
				</Badge>

				<span class="text-xs">
					{pkg.stickers.length} stickers
				</span>
			</div>
		</div>
	</div>
</div>
