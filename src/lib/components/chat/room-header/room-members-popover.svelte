<script lang="ts">
	import { roomMemberService } from '$lib/api/room-member';
	import UserAvatar from '$lib/components/common/user-avatar.svelte';
	import { useRoom } from '$lib/components/room/room-state.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Popover from '$lib/components/ui/popover';
	import { useUser } from '$lib/stores/auth.svelte';
	import type { UserInfo } from '$lib/types/user';
	import { Crown, LoaderCircle, LogOut, Search, UserMinus, Users } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import AddUserPopover from './add-user-popover.svelte';

	let { roomId, onlineUsers }: { roomId: string; onlineUsers: UserInfo[] } = $props();
	const roomState = useRoom();
	const { currentUser } = $derived(useUser());
	let open = $state(false);
	let trigger: HTMLButtonElement | null = $state(null);
	let search = $state('');
	let memberToRemove = $state<UserInfo | null>(null);
	let isRemoving = $state(false);
	const isRoomMaster = $derived(
		roomState.members.some(
			(member) => member.user.username === currentUser.username && member.role === 'MASTER'
		)
	);
	const onlineNames = $derived(new Set(onlineUsers.map((user) => user.username)));
	const onlineCount = $derived(
		roomState.members.filter((member) => onlineNames.has(member.user.username)).length
	);
	const filteredMembers = $derived(
		roomState.members.filter(({ user }) =>
			`${user.displayName} ${user.username}`.toLowerCase().includes(search.trim().toLowerCase())
		)
	);

	async function removeMember() {
		if (!memberToRemove || isRemoving) return;
		const target = memberToRemove;
		isRemoving = true;
		try {
			await roomMemberService.kickMember(roomId, target.username);
			roomState.removeMember(target.username);
			toast.success(`${target.displayName} was removed from the room.`);
			memberToRemove = null;
		} catch {
			toast.error('Could not remove this member. Please try again.');
		} finally {
			isRemoving = false;
		}
	}

	async function inviteUser(user: UserInfo) {
		const member = await roomMemberService.addMember(roomId, user.username);
		roomState.addMember(member);
		toast.success(`${user.displayName} was added to the room.`);
	}
</script>

<Popover.Root
	bind:open
	onOpenChange={(value) => {
		if (!value) search = '';
	}}
>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button
				{...props}
				bind:ref={trigger}
				variant="outline"
				size="sm"
				class="gap-1.5 px-2.5"
				aria-label={`Room members: ${roomState.members.length}`}
				title="Room members"
			>
				<Users size={16} />
				<span class="hidden lg:inline">Members</span>
				<span class="tabular-nums">{roomState.members.length}</span>
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content
		onCloseAutoFocus={(event) => {
			if (memberToRemove) event.preventDefault();
		}}
		align="end"
		side="bottom"
		sideOffset={8}
		class="w-[min(92vw,24rem)] gap-3 rounded-3xl p-3 sm:p-4"
	>
		<Popover.Header class="gap-1 px-1">
			<Popover.Title class="flex items-center gap-2 text-base">
				<span
					class="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary"
					><Users size={15} /></span
				>
				Room members
				<span
					class="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground"
					>{roomState.members.length}</span
				>
			</Popover.Title>
			<Popover.Description>{onlineCount} online · See who's in this room.</Popover.Description>
		</Popover.Header>
		<div class="relative">
			<Search
				class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
			/>
			<Input
				bind:value={search}
				type="search"
				placeholder="Find a member…"
				aria-label="Search room members by name or username"
				class="pl-9"
			/>
		</div>
		<div
			class="max-h-[min(48dvh,22rem)] overflow-y-auto overscroll-contain p-1"
			aria-busy={roomState.membersQuery.isLoading}
		>
			{#if roomState.membersQuery.isLoading}
				<p role="status" class="py-8 text-center text-sm text-muted-foreground">Loading members…</p>
			{:else if roomState.membersQuery.isError}
				<div role="alert" class="space-y-2 py-6 text-center">
					<p class="text-sm text-muted-foreground">Could not load members.</p>
					<Button variant="outline" size="sm" onclick={() => roomState.membersQuery.refetch()}
						>Try again</Button
					>
				</div>
			{:else if filteredMembers.length === 0}
				<div role="status" class="space-y-1 py-8 text-center">
					<p class="text-sm font-medium">
						{search.trim() ? 'No matching members' : 'No members yet'}
					</p>
					{#if search.trim()}<p class="text-xs text-muted-foreground">
							Try another name or username.
						</p>{/if}
				</div>
			{:else}
				<ul class="space-y-1">
					{#each filteredMembers as member (member.user.username)}
						<li class="flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-muted/60">
							<div class="relative shrink-0">
								<UserAvatar user={member.user} />
								{#if onlineNames.has(member.user.username)}<span
										class="absolute right-0 bottom-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-popover"
										title="Online"><span class="sr-only">Online</span></span
									>{/if}
							</div>
							<div class="min-w-0 flex-1">
								<div class="flex items-center gap-1.5">
									<span class="truncate text-sm font-medium" title={member.user.displayName}
										>{member.user.displayName}</span
									>
									{#if member.user.username === currentUser.username}<span
											class="shrink-0 text-xs text-muted-foreground">You</span
										>{/if}
								</div>
								<p
									class="truncate text-xs text-muted-foreground"
									title={`@${member.user.username}`}
								>
									@{member.user.username}
								</p>
								{#if member.role === 'MASTER'}<span
										class="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
										><Crown size={12} />Owner</span
									>{/if}
							</div>
							{#if isRoomMaster && member.user.username !== currentUser.username}
								<Button
									variant="ghost"
									size="icon"
									class="size-11 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
									title={`Remove ${member.user.displayName}`}
									aria-label={`Remove ${member.user.displayName} from the room`}
									onclick={() => {
										open = false;
										memberToRemove = member.user;
									}}><UserMinus size={16} /></Button
								>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		</div>
		<div class="flex flex-col gap-2 border-t border-border pt-3">
			{#if isRoomMaster}
				<AddUserPopover
					handleInviteUser={inviteUser}
					memberUsernames={roomState.members.map((member) => member.user.username)}
				/>
			{/if}
			<Button variant="ghost" class="w-full text-muted-foreground">
				<LogOut size={16} />
				Leave Room
			</Button>
		</div>
	</Popover.Content>
</Popover.Root>

<Dialog.Root
	open={memberToRemove !== null}
	onOpenChange={(value) => {
		if (!value && !isRemoving) memberToRemove = null;
	}}
>
	<Dialog.Content
		onCloseAutoFocus={(event) => {
			event.preventDefault();
			trigger?.focus();
		}}
		class="rounded-3xl"
		showCloseButton={!isRemoving}
		onEscapeKeydown={(event) => {
			if (isRemoving) event.preventDefault();
		}}
		onInteractOutside={(event) => {
			if (isRemoving) event.preventDefault();
		}}
	>
		<Dialog.Header>
			<Dialog.Title>Remove member?</Dialog.Title>
			<Dialog.Description
				><span class="font-medium break-words text-foreground">{memberToRemove?.displayName}</span> will
				lose access to this room. You can add them again later.</Dialog.Description
			>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" disabled={isRemoving} onclick={() => (memberToRemove = null)}
				>Cancel</Button
			>
			<Button variant="destructive" disabled={isRemoving} onclick={removeMember}
				>{#if isRemoving}<LoaderCircle class="animate-spin" />{/if}{isRemoving
					? 'Removing…'
					: 'Remove member'}</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
