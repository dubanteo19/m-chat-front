<script lang="ts">
	import type { UserInfo } from '$lib/types/user';
	import TitleBadge from './title-badge.svelte';

	let {
		user,
		class: className = '',
		variant = 'compact',
		animationMode = 'none'
	} = $props<{
		user: Partial<UserInfo> & { displayName: string; title?: string; titleStyle?: any };
		class?: string;
		textSize?: string;
		variant?: 'default' | 'compact';
		animationMode?: 'always' | 'interaction' | 'none';
	}>();
</script>

<div class="text-[11px] flex min-w-0 max-w-full flex-wrap items-baseline gap-1.5 px-1 {className}">
	<span class="min-w-0 font-bold wrap-anywhere">{user.displayName}</span>
	{#if user.title}
		<TitleBadge {user} {variant} {animationMode} />
	{/if}
</div>
