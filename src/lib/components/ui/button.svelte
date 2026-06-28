<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		variant?: 'primary' | 'secondary' | 'ghost' | 'plain';
		size?: 'sm' | 'md' | 'lg' | 'none';
		children?: Snippet;
		class?: string;
	}

	let {
		type = 'button',
		variant = 'secondary',
		size = 'md',
		children,
		class: customClass = '',
		...restProps
	}: Props = $props();

	// Base layout configurations
	const baseStyles =
		'transition-all duration-200 flex items-center justify-center font-medium focus:outline-none';

	// Style variants mapped from your layout
	const variants = {
		primary: 'bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-lg',
		secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg',
		ghost:
			'bg-slate-700/40 hover:bg-slate-700 hover:scale-105 active:scale-95 text-white rounded-lg group',
		plain: 'text-slate-400 hover:text-white transition-colors'
	};

	// Size variants mapped from your layout
	const sizes = {
		none: '',
		sm: 'text-xs p-1',
		md: 'p-3 h-[46px] text-base', // Matches your asset/sticker tool sizing
		lg: 'w-full p-3' // Matches your sign-in layout
	};
</script>

<button {type} class="{baseStyles} {variants[variant]} {sizes[size]} {customClass}" {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</button>
