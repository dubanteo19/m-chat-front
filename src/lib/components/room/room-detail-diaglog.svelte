<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	let { open = $bindable(false) } = $props<{
		open: boolean;
	}>();
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Add New Room</Dialog.Title>
			<Dialog.Description>
				Enter the details for the new room here. Click save when you're done.
			</Dialog.Description>
		</Dialog.Header>

		<div>
			This is the room detail dialog. You can add more details about the room here, such as its
			description, rules, or any other relevant information that users might need to know before
			joining the room.
		</div>
	</Dialog.Content>
</Dialog.Root>
