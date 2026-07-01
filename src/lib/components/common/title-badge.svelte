<script lang="ts">
	import { animationClassMap } from '$lib/constants/animations';
	import type { UserInfo } from '$lib/types/message';

	let { user } = $props<{
		user: Partial<UserInfo> & { title?: string; titleStyle?: any };
		textSize?: string;
	}>();

	const textShadowMap: Record<string, string> = {
		none: 'none',
		'neon-glow': '0 0 4px currentColor, 0 0 10px currentColor',
		'retro-glitch': '1.5px 1.5px 0px #ff0000, -1.5px -1.5px 0px #0000ff',
		'deep-shadow': '1px 1px 0px #000, 2px 2px 0px #000'
	};
</script>

<span
	class={`relative inline-block overflow-hidden font-bold text-[12px] px-1.5  rounded uppercase tracking-wide transition-all ${
		animationClassMap[user.titleStyle?.animationVibe || 'none']
	}`}
	style:color={user.titleStyle?.textColor || '#7e22ce'}
	style:background-color={
		user.titleStyle?.animationVibe === 'aurora' ||
		user.titleStyle?.animationVibe === 'holo'
			? undefined
			: user.titleStyle?.backgroundColor || '#f3e8ff'
	}
	style:border-radius={user.titleStyle?.borderRadius || '4px'}
	style:border={
		!user.titleStyle?.borderStyle || user.titleStyle.borderStyle === 'none'
			? 'none'
			: `${user.titleStyle.borderStyle} ${user.titleStyle.borderColor || 'transparent'}`
	}
	style:text-shadow={textShadowMap[user.titleStyle?.textEffect || 'none']}
>
	{user.title}
</span>