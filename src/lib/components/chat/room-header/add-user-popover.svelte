<script lang="ts">
	import { roomMemberService } from '$lib/api/room-member';
	import { userService } from '$lib/api/user';
	import UserAvatar from '$lib/components/common/user-avatar.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import type { UserInfo } from '$lib/types/user';
	import { PlusIcon } from '@lucide/svelte';
	let { roomId, onAddMember } = $props();
	let query = $state('');
	let users = $state<UserInfo[]>([]);
	let loading = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout>;

	async function searchUsers(displayName: string) {
		if (!displayName.trim()) {
			users = [];
			return;
		}
		loading = true;
		try {
			users = await userService.search(displayName);
		} finally {
			loading = false;
		}
	}
	$effect(() => {
		clearTimeout(debounceTimer);

		if (!query.trim()) {
			users = [];
			return;
		}

		debounceTimer = setTimeout(() => {
			searchUsers(query);
		}, 300);

		return () => clearTimeout(debounceTimer);
	});
	const handleAddUser = async (user: UserInfo) => {
		try {
			const newMember = await roomMemberService.addMember(roomId, user.username);
			onAddMember(newMember);
			alert(`User ${user.displayName} added to the room successfully.`);
		} catch (error) {
			console.error('Error adding user to room:', error);
		}
	};
</script>

<Popover.Root>
	<Popover.Trigger>
		<Button variant="ghost" size="sm">
			<PlusIcon />
			Add User
		</Button>
	</Popover.Trigger>

	<Popover.Content class="w-80">
		<div class="space-y-3">
			<span class="font-medium">Add user</span>

			<Input bind:value={query} placeholder="Enter display name..." />

			<div class="max-h-64 overflow-y-auto">
				{#if loading}
					<div class="text-sm text-muted-foreground p-2">Searching...</div>
				{:else if users.length === 0 && query}
					<div class="text-sm text-muted-foreground p-2">No users found.</div>
				{:else}
					{#each users as user (user.username)}
						<button
							onclick={() => handleAddUser(user)}
							class="flex w-full items-center gap-2 rounded p-2 hover:bg-secondary"
						>
							<UserAvatar {user} />
							<div class="flex flex-col items-start">
								<span>{user.displayName}</span>
								<span class="text-xs text-muted-foreground">
									@{user.username}
								</span>
							</div>
						</button>
					{/each}
				{/if}
			</div>
		</div>
	</Popover.Content>
</Popover.Root>
