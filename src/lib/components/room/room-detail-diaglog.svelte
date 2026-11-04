<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { RoomType, type RoomInfo } from '$lib/types/room';
	import { toast } from 'svelte-sonner';
	import Button from '../ui/button/button.svelte';
	import { useUserRoomsQuery } from '$lib/queries/use-user-room';

	type Props = {
		open: boolean;
		onOpenChange: (value: boolean) => void;
		room: RoomInfo;
	};
	let { open = $bindable(false), room, onOpenChange }: Props = $props();
	const { deleteRoom } = useUserRoomsQuery();
	let showDeleteDialog = $state(false);
	async function handleDeleteRoom() {
		try {
			await deleteRoom(room.id);
			toast.success('Room deleted successfully!');
			showDeleteDialog = false;
			onOpenChange(false);
		} catch (error) {
			console.error('Error deleting room:', error);
		}
	}
</script>

<Dialog.Root bind:open {onOpenChange}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>
				<div class="flex justify-between mr-8 gap-2">
					#{room.name}
					{#if room.type === RoomType.DM}
						<span class="text-sm">(Direct Message)</span>
					{/if}
				</div>
			</Dialog.Title>
			<Dialog.Description>
				{room.description || 'No description available'}
			</Dialog.Description>
		</Dialog.Header>

		<div class="flex flex-col gap-2">
			<div>Created At: Member:</div>
			<div class="flex flex-col gap-1">
				<Button variant="destructive" onclick={() => (showDeleteDialog = true)}>Delete room</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root
	open={showDeleteDialog}
	onOpenChange={(value) => {
		if (!value) showDeleteDialog = false;
	}}
>
	<Dialog.Content onCloseAutoFocus={(event) => event.preventDefault()} class="rounded-3xl">
		<Dialog.Header>
			<Dialog.Title>Delete room?</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete this room? This action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="secondary" onclick={() => (showDeleteDialog = false)}>Cancel</Button>
			<Button variant="destructive" onclick={handleDeleteRoom}>Delete Room</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
