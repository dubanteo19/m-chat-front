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
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Add New Room</Dialog.Title>
			<Dialog.Description>
				Enter the details for the new room here. Click save when you're done.
			</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={handleSubmit} class="grid gap-4 py-4">
			<div class="w-full max-w-md">
				<Field.Set>
					<Field.Group>
						<Field.Field>
							<Field.Label for="name">Name</Field.Label>
							<Input
								required
								bind:value={name}
								id="name"
								type="text"
								placeholder="Room Name"
								disabled={isSubmitting}
							/>
						</Field.Field>
					</Field.Group>
				</Field.Set>
			</div>
			<Dialog.Footer class="mt-4">
				<Dialog.Close>
					<Button type="button" variant="destructive" disabled={isSubmitting}>Cancel</Button>
				</Dialog.Close>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? 'Saving...' : 'Save Room'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
