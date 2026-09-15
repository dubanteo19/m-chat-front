<script lang="ts">
	import type { TitleStyle, UserInfo } from '$lib/types/user';
	import { animationClassMap } from '$lib/constants/animations';
	import { FRAMED_BADGE_STYLES } from '$lib/constants/animations';

	let { user } = $props<{
		user: Partial<UserInfo> & { title?: string; titleStyle?: TitleStyle };
		textSize?: string;
	}>();
	const isFramed = $derived(FRAMED_BADGE_STYLES.has(user.titleStyle?.animationVibe || 'none'));

	const textShadowMap: Record<string, string> = {
		none: 'none',
		'neon-glow': '0 0 4px currentColor, 0 0 10px currentColor',
		'retro-glitch': '1.5px 1.5px 0px #ff0000, -1.5px -1.5px 0px #0000ff',
		'deep-shadow': '1px 1px 0px #000, 2px 2px 0px #000'
	};

	const backgroundControlledAnimations = new Set([
		'aurora',
		'holo',
		'f1-racing',
		'vung-tau-breeze',
		'ruby-crown',
		'obsidian'
	]);
</script>

{#if user.title && isFramed}
	<span
		class="framed-badge"
		title={user.title}
		class:obsidian={user.titleStyle?.animationVibe === 'obsidian'}
		class:pleiku={user.titleStyle?.animationVibe === 'pleiku-rain'}
		style:color={user.titleStyle?.textColor || '#fff7ed'}
		style:--frame-accent={user.titleStyle?.borderColor &&
		user.titleStyle.borderColor !== 'transparent'
			? user.titleStyle.borderColor
			: undefined}
	>
		<span class="frame-face" aria-hidden="true"></span>
		{#if user.titleStyle?.animationVibe === 'pleiku-rain'}
			<svg class="frame-mountains" viewBox="0 0 40 14" aria-hidden="true" focusable="false">
				<path class="mountain-fill" d="M1 13 10 4 15 8 22 1 30 8 34 5 39 13Z" />
				<path class="mountain-ridge" d="m1 13 9-9 5 4 7-7 8 7 4-3 5 8M10 4l4 9M22 1l-3 9 5-3 6 6" />
			</svg>
		{/if}
		<span class="frame-content">
			<span class="frame-title">{user.title}</span>
		</span>
	</span>
{:else if user.title}
	<span
		class={`relative inline-block overflow-hidden font-bold text-[12px] px-1.5  rounded uppercase tracking-wide transition-all ${
			animationClassMap[user.titleStyle?.animationVibe || 'none']
		}`}
		style:color={user.titleStyle?.textColor || '#7e22ce'}
		style:background-color={backgroundControlledAnimations.has(
			user.titleStyle?.animationVibe || 'none'
		)
			? undefined
			: user.titleStyle?.backgroundColor || '#f3e8ff'}
		style:border-radius={user.titleStyle?.borderRadius || '4px'}
		style:border={!user.titleStyle?.borderStyle || user.titleStyle.borderStyle === 'none'
			? 'none'
			: `${user.titleStyle.borderStyle} ${user.titleStyle.borderColor || 'transparent'}`}
		style:text-shadow={textShadowMap[user.titleStyle?.textEffect || 'none']}
	>
		{user.title}
	</span>
{/if}
