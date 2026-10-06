<script lang="ts">
	import { roomMemberService } from '$lib/api/room-member';
	import UserAvatar from '$lib/components/common/user-avatar.svelte';
	import { useRoom } from '$lib/components/room/room-state.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { useUser } from '$lib/stores/auth.svelte';
	import type { RoomMemberInfo } from '$lib/types/room';
	import type { UserInfo } from '$lib/types/user';
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { Crown, LoaderCircle, UserMinus, Users, X } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import AddUserPopover from './add-user-popover.svelte';

	let { roomId, onlineUsers }: { roomId: string; onlineUsers: UserInfo[] } = $props();
	const roomState = useRoom();
	const { currentUser } = $derived(useUser());
	let open = $state(false);
	let trigger: HTMLButtonElement | null = $state(null);
	let memberToRemove = $state<UserInfo | null>(null);
	let isRemoving = $state(false);
	const isRoomMaster = $derived(
		roomState.members.some(
			(member) => member.user.username === currentUser.username && member.role === 'MASTER'
		)
	);
	const onlineNames = $derived(new Set(onlineUsers.map((user) => user.username)));
	const onlineMembers = $derived(
		roomState.members.filter((member) => onlineNames.has(member.user.username))
	);
	const offlineMembers = $derived(
		roomState.members.filter((member) => !onlineNames.has(member.user.username))
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

<DialogPrimitive.Root bind:open>
	<DialogPrimitive.Trigger>
		{#snippet child({ props })}
			<Button
				{...props}
				bind:ref={trigger}
				variant={open ? 'secondary' : 'outline'}
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
	</DialogPrimitive.Trigger>

	<DialogPrimitive.Portal>
		<DialogPrimitive.Overlay
			class="data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 fixed inset-0 z-40 bg-black/10 duration-200 md:bg-transparent"
		/>
		<DialogPrimitive.Content
			onCloseAutoFocus={(event) => {
				if (memberToRemove) event.preventDefault();
			}}
			class="data-open:animate-in data-closed:animate-out data-closed:slide-out-to-right data-open:slide-in-from-right fixed inset-y-0 right-0 z-50 flex w-[min(88vw,19rem)] flex-col border-l border-border bg-[#111318] text-popover-foreground shadow-[-12px_0_32px_rgba(0,0,0,0.28)] outline-none duration-200 md:top-14"
		>
			<header class="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
				<DialogPrimitive.Title class="text-[13px] font-semibold">Members</DialogPrimitive.Title>
				<span
					class="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground"
					>{roomState.members.length}</span
				>
				<DialogPrimitive.Close class="ml-auto">
					{#snippet child({ props })}
						<Button {...props} variant="ghost" size="icon-sm" aria-label="Close members panel">
							<X size={18} />
						</Button>
					{/snippet}
				</DialogPrimitive.Close>
			</header>

			{#if isRoomMaster}
				<div class="shrink-0 border-b border-border p-2.5">
					<AddUserPopover
						handleInviteUser={inviteUser}
						memberUsernames={roomState.members.map((member) => member.user.username)}
					/>
				</div>
			{/if}

			<div
				class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2"
				aria-busy={roomState.membersQuery.isLoading}
			>
				{#if roomState.membersQuery.isLoading}
					<p role="status" class="py-8 text-center text-sm text-muted-foreground">
						Loading members…
					</p>
				{:else if roomState.membersQuery.isError}
					<div role="alert" class="space-y-2 py-6 text-center">
						<p class="text-sm text-muted-foreground">Could not load members.</p>
						<Button variant="outline" size="sm" onclick={() => roomState.membersQuery.refetch()}
							>Try again</Button
						>
					</div>
				{:else if roomState.members.length === 0}
					<p role="status" class="py-8 text-center text-sm font-medium">No members yet</p>
				{:else}
					<section aria-labelledby="online-members-heading">
						<h3
							id="online-members-heading"
							class="px-2 pb-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
						>
							Online — {onlineMembers.length}
						</h3>
						{#if onlineMembers.length > 0}
							<ul class="space-y-0.5">
								{#each onlineMembers as member (member.user.username)}
									{@render memberItem(member, true)}
								{/each}
							</ul>
						{:else}
							<p class="px-2 py-3 text-xs text-muted-foreground">No one is online.</p>
						{/if}
					</section>

					{#if offlineMembers.length > 0}
						<section class="mt-3 border-t pt-3" aria-labelledby="offline-members-heading">
							<h3
								id="offline-members-heading"
								class="px-2 pb-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
							>
								Offline — {offlineMembers.length}
							</h3>
							<ul class="space-y-0.5">
								{#each offlineMembers as member (member.user.username)}
									{@render memberItem(member, false)}
								{/each}
							</ul>
						</section>
					{/if}
				{/if}
			</div>
		</DialogPrimitive.Content>
	</DialogPrimitive.Portal>
</DialogPrimitive.Root>

{#snippet memberItem(member: RoomMemberInfo, isOnline: boolean)}
	<li
		class="group flex min-h-11 items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/60"
	>
		<div class="relative shrink-0">
			<UserAvatar user={member.user} />
			<span
				class="absolute right-0 bottom-0 size-2.5 rounded-full ring-2 ring-popover {isOnline
					? 'bg-emerald-500'
					: 'bg-muted-foreground/40'}"
				title={isOnline ? 'Online' : 'Offline'}
			>
				<span class="sr-only">{isOnline ? 'Online' : 'Offline'}</span>
			</span>
		</div>
		<div class="min-w-0 flex-1">
			<div class="flex items-center gap-1.5">
				<span class="truncate text-sm font-medium" title={member.user.displayName}>
					{member.user.displayName}
				</span>
				{#if member.user.username === currentUser.username}
					<span class="shrink-0 text-xs text-muted-foreground">You</span>
				{/if}
			</div>
			<p class="flex items-center gap-1 truncate text-xs text-muted-foreground">
				{#if member.role === 'MASTER'}<Crown size={11} />Owner{:else}Member{/if}
			</p>
		</div>
		{#if isRoomMaster && member.user.username !== currentUser.username}
			<Button
				variant="ghost"
				size="icon-sm"
				class="text-muted-foreground opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
				title={`Remove ${member.user.displayName}`}
				aria-label={`Remove ${member.user.displayName} from the room`}
				onclick={() => {
					open = false;
					memberToRemove = member.user;
				}}
			>
				<UserMinus size={16} />
			</Button>
		{/if}
	</li>
{/snippet}

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
		class="gap-4 rounded-lg border-border bg-popover p-4 sm:max-w-sm"
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
				><span class="font-medium break-words text-foreground">{memberToRemove?.displayName}</span>
				will lose access to this room. You can add them again later.</Dialog.Description
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
