<script lang="ts">
	import type { UserInfo } from '$lib/types/message';

	let { user } = $props<{
		user: UserInfo;
	}>();
</script>

<div class="text-[11px] text-slate-400 flex items-baseline gap-1.5 px-1">
	<span class="font-bold text-slate-600">{user.displayName}</span>
	{#if user.title}
		<span
			class="bg-slate-200 text-purple-500 font-bold text-[9px] px-1 rounded uppercase tracking-wide"
		>
			{user.title}
		</span>
	{/if}
</div>
