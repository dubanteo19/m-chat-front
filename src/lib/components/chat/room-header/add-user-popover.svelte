<script lang="ts">
	import UserAvatar from '$lib/components/common/user-avatar.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Popover from '$lib/components/ui/popover';
	import { useUsersQuery } from '$lib/queries/use-user-query';
	import type { UserInfo } from '$lib/types/user';
	import { LoaderCircle, UserPlus } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	let {
		handleInviteUser,
		memberUsernames = []
	}: {
		handleInviteUser: (user: UserInfo) => Promise<void>;
		memberUsernames?: string[];
	} = $props();
	let open = $state(false);
	let query = $state('');
	let debouncedQuery = $state('');
	let addingUsername = $state<string | null>(null);
	$effect(() => {
		const value = query.trim();
		const timer = setTimeout(() => {
			debouncedQuery = value;
		}, 300);
		return () => clearTimeout(timer);
	});
	const userQuery = useUsersQuery(() => (open ? debouncedQuery : ''));
	async function addUser(user: UserInfo) {
		if (addingUsername || memberUsernames.includes(user.username)) return;
		addingUsername = user.username;
		try {
			await handleInviteUser(user);
		} catch {
			toast.error('Could not add this member. Please try again.');
		} finally {
			addingUsername = null;
		}
	}
</script>

<Popover.Root
	bind:open
	onOpenChange={(value) => {
		if (!value) {
			query = '';
			debouncedQuery = '';
		}
	}}
>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="secondary" size="sm" class="h-8 w-full rounded-md"
				><UserPlus size={16} />Invite member</Button
			>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content
		align="end"
		sideOffset={8}
		class="w-[min(92vw,22rem)] gap-2 rounded-lg border-border bg-popover p-2.5"
	>
		<Popover.Header class="gap-1 px-1">
			<Popover.Title class="flex items-center gap-2 text-[13px]"
				><span class="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary"
					><UserPlus size={15} /></span
				>Add members</Popover.Title
			>
			<Popover.Description>Find someone to join the conversation.</Popover.Description>
		</Popover.Header>
		<Input
			bind:value={query}
			type="search"
			placeholder="Search by display name…"
			aria-label="Search people by display name"
			class="h-8 rounded-md border-border bg-background/70 text-xs"
		/>
		<div class="max-h-[min(45dvh,20rem)] overflow-y-auto overscroll-contain p-1">
			{#if !query.trim()}
				<p class="py-6 text-center text-sm text-muted-foreground">Enter a name to find people.</p>
			{:else if query.trim() !== debouncedQuery || userQuery.isLoading}
				<p role="status" class="py-6 text-center text-sm text-muted-foreground">Searching…</p>
			{:else if userQuery.isError}
				<div role="alert" class="space-y-2 py-6 text-center">
					<p class="text-sm text-muted-foreground">Could not load results.</p>
					<Button variant="outline" size="sm" onclick={() => userQuery.refetch()}>Try again</Button>
				</div>
			{:else if !userQuery.data?.length}
				<p role="status" class="py-6 text-center text-sm text-muted-foreground">
					No people found. Try another name.
				</p>
			{:else}
				<ul class="space-y-1">
					{#each userQuery.data ?? [] as user (user.username)}
						<li class="flex min-h-11 items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/60">
							<UserAvatar {user} />
							<div class="min-w-0 flex-1">
								<p class="truncate text-sm font-medium" title={user.displayName}>
									{user.displayName}
								</p>
								<p class="truncate text-xs text-muted-foreground">@{user.username}</p>
							</div>
							{#if memberUsernames.includes(user.username)}
								<span class="text-xs text-muted-foreground">Joined</span>
							{:else}
								<Button
									variant="default"
									class="h-7 min-h-0 rounded-md px-2 text-xs"
									disabled={addingUsername !== null}
									aria-label={'Add ' + user.displayName + ' to the room'}
									onclick={() => addUser(user)}
									>{#if addingUsername === user.username}<LoaderCircle
											class="animate-spin"
										/>Adding…{:else}Add{/if}</Button
								>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</Popover.Content>
</Popover.Root>
