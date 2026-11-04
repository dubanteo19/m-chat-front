<script lang="ts">
	import type { UserInfo } from '$lib/types/user';
	import TitleBadge from './title-badge.svelte';

	type Props = {
		user: Partial<UserInfo>;
		class?: string;
		textSize?: string;
	};
	let { user, class: className = '' }: Props = $props();
</script>

<div class="text-[11px] flex min-w-0 max-w-full flex-wrap items-baseline gap-1.5 px-1 {className}">
	<span class="min-w-0 font-bold wrap-anywhere">{user.displayName}</span>
	{#if user.title}
		<TitleBadge {user} />
	{/if}
</div>
