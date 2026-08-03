<script lang="ts">
	import type { UserInfo } from '$lib/types/user';
	import TitleBadge from './title-badge.svelte';

	let { user, class: className = '' } = $props<{
		user: Partial<UserInfo> & { displayName: string; title?: string; titleStyle?: any };
		class?: string;
		textSize?: string;
	}>();
</script>

<div class="text-[11px] flex items-baseline gap-1.5 px-1 {className}">
	<span class="font-bold">{user.displayName}</span>
	{#if user.title}
		<TitleBadge {user} textSize="text-[9px]" />
	{/if}
</div>
