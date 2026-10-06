<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import type { CreateRoomRequest } from '$lib/api/room';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';

	let { open = $bindable(false), onsubmit } = $props<{
		open: boolean;
		onsubmit: (data: CreateRoomRequest) => Promise<void> | void;
	}>();

	let name = $state('');
	let description = $state('');
	let isSubmitting = $state(false);

	$effect(() => {
		if (open) {
			name = '';
			description = '';
		}
	});

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!onsubmit) return;

		try {
			isSubmitting = true;
			await onsubmit({ name, description });
			open = false;
		} catch (error) {
			console.error('Failed to save room:', error);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="gap-4 rounded-lg border-border bg-popover p-4 sm:max-w-[400px]">
		<Dialog.Header class="gap-1 border-b border-border pb-3">
			<Dialog.Title class="text-[14px] font-semibold">New room</Dialog.Title>
			<Dialog.Description class="text-xs">
				Create a workspace for a focused conversation.
			</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={handleSubmit} class="grid gap-3">
			<div class="w-full max-w-md">
				<Field.Set>
					<Field.Group>
						<Field.Field>
							<Field.Label for="name" class="text-xs">Room name</Field.Label>
							<Input
								required
								bind:value={name}
								id="name"
								type="text"
								placeholder="e.g. product-updates"
								disabled={isSubmitting}
								class="h-8 rounded-md border-border bg-background/70 text-xs"
							/>
						</Field.Field>
					</Field.Group>
				</Field.Set>
			</div>
			<Dialog.Footer class="mt-1 gap-2 border-t border-border pt-3">
				<Dialog.Close>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						class="h-8 rounded-md"
						disabled={isSubmitting}>Cancel</Button
					>
				</Dialog.Close>
				<Button type="submit" size="sm" class="h-8 rounded-md" disabled={isSubmitting}>
					{isSubmitting ? 'Saving...' : 'Save Room'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
