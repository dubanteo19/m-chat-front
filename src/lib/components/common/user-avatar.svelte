<script lang="ts">
	import type { UserInfo } from '$lib/types/message';

	let { user } = $props<{
		user: UserInfo;
	}>();

    let imageFailed = $state(false);

	const initials = $derived.by(() => {
		return user.displayName
			.trim()
			.split(/\s+/)
			.slice(0, 2)
			.map((part: string) => part[0])
			.join('')
			.toUpperCase();
	});
</script>

<div class="shrink-0 w-8 h-8 rounded-full overflow-hidden select-none">
	{#if user.avatarUrl && !imageFailed}
		<img
			src={user.avatarUrl}
			alt={user.displayName}
			class="w-full h-full object-cover"
			onerror={() => (imageFailed = true)}
		/>
	{:else}
		<div
	    		class="w-full h-full flex-center bg-slate-400 text-white text-xs font-semibold"
		>
			{initials}
		</div>
	{/if}
</div>
