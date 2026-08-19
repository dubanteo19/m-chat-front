<script lang="ts">
	import UserAvatar from '$lib/components/common/user-avatar.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { useUsersQuery } from '$lib/queries/use-user-query';
	import type { UserInfo } from '$lib/types/user';
	import { PlusIcon } from '@lucide/svelte';
	let { handleInviteUser }: { handleInviteUser: (user: UserInfo) => void } = $props();
	let query = $state('');
	let debouncedQuery = $state('');
	let debounceTimer: ReturnType<typeof setTimeout>;

	// Debounce user input updates
	function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
		query = e.currentTarget.value;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			debouncedQuery = query;
		}, 300);
	}

	const userQuery = useUsersQuery(() => debouncedQuery);
</script>

<Popover.Root>
	<Popover.Trigger>
		<Button variant="ghost" size="sm" class="w-full justify-start ">
			<PlusIcon />
			<span> Add User </span>
		</Button>
	</Popover.Trigger>

	<Popover.Content class="w-80">
		<div class="space-y-3">
			<span class="font-medium">Add user</span>

			<Input bind:value={query} placeholder="Enter display name..." oninput={handleInput} />

			<div class="max-h-64 overflow-y-auto">
				{#if userQuery.isLoading}
					<div class="text-sm text-muted-foreground p-2">Searching...</div>
				{:else if userQuery.data?.length === 0 && query}
					<div class="text-sm text-muted-foreground p-2">No users found.</div>
				{:else}
					{#each userQuery.data as user (user.id)}
						<button
							onclick={() => handleInviteUser(user)}
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
