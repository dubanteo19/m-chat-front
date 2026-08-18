import type { TitleStyle } from "$lib/types/user";

export interface BadgeAnimation {
	value: string;
	label: string;
	className: string;
}

export const BADGE_ANIMATIONS: BadgeAnimation[] = [
	{
		value: 'none',
		label: 'Static',
		className: ''
	},
	{
		value: 'float',
		label: 'Floating Spirit',
		className: 'vibe-float'
	},
	{
		value: 'breathe',
		label: 'Breathing Glow',
		className: 'vibe-breathe'
	},
	{
		value: 'shake',
		label: 'Playful Wobble',
		className: 'vibe-shake'
	},
	{
		value: 'flicker',
		label: 'Cyber Flicker',
		className: 'vibe-flicker'
	},
	{
		value: 'shimmer',
		label: 'Velvet Shimmer',
		className: 'vibe-shimmer'
	},
	{
		value: 'border-glow',
		label: 'Neon Halo',
		className: 'vibe-border-glow'
	},
	{
		value: 'aurora',
		label: 'Aurora Flow',
		className: 'vibe-aurora'
	},
	{
		value: 'rainbow',
		label: 'Prismatic Shift',
		className: 'vibe-rainbow'
	},
	{
		value: 'holo',
		label: 'Holographic',
		className: 'vibe-holo'
	},
	{
		value: 'legendary',
		label: 'Legendary',
		className: 'vibe-legendary'
	},
	{
		value: 'f1-racing',
		label: 'F1 Racing',
		className: 'vibe-f1-racing'
	},
	{
		value: 'vung-tau-breeze',
		label: 'Vung Tau Breeze',
		className: 'vibe-vung-tau-breeze'
	},
	{
		value: 'pleiku-rain',
		label: 'Pleiku Rain',
		className: 'vibe-pleiku-rain'
	},
	{
		value: 'ruby-crown',
		label: 'Ruby Crown',
		className: 'vibe-ruby-crown'
	},
	{
		value: 'obsidian',
		label: 'Obsidian',
		className: 'vibe-obsidian'
	}
];

// Automatically generate a runtime lookup map
export const animationClassMap = BADGE_ANIMATIONS.reduce<Record<string, string>>((map, item) => {
	map[item.value] = item.className;
	return map;
}, {});

export const BACKGROUND_CONTROLLED_ANIMATIONS = new Set([
	'aurora',
	'holo',
	'f1-racing',
	'vung-tau-breeze',
	'pleiku-rain',
	'ruby-crown',
	'obsidian'
]);

export const BADGE_PRESETS: Array<{ id: string; name: string; title: string; style: TitleStyle }> = [
	{
		id: 'f1-racing',
		name: 'F1 Racing',
		title: 'POLE POSITION',
		style: {
			textColor: '#ffffff',
			backgroundColor: '#dc2626',
			borderRadius: '4px',
			borderStyle: '1px solid',
			borderColor: '#f8fafc',
			textEffect: 'deep-shadow',
			animationVibe: 'f1-racing'
		}
	},
	{
		id: 'vung-tau-breeze',
		name: 'Vung Tau Breeze',
		title: 'VUNG TAU',
		style: {
			textColor: '#ffffff',
			backgroundColor: '#38bdf8',
			borderRadius: '9999px',
			borderStyle: '1px solid',
			borderColor: '#fff7ad',
			textEffect: 'deep-shadow',
			animationVibe: 'vung-tau-breeze'
		}
	},
	{
		id: 'royal-gold',
		name: 'Royal Gold',
		title: 'ROYAL',
		style: {
			textColor: '#fef3c7',
			backgroundColor: '#4c1d95',
			borderRadius: '9999px',
			borderStyle: '2px double',
			borderColor: '#facc15',
			textEffect: 'deep-shadow',
			animationVibe: 'legendary'
		}
	},
	{
		id: 'pleiku-rain',
		name: 'Pleiku Sleepwell',
		title: 'PLEIKU',
		style: {
			textColor: '#e0e7ff',
			backgroundColor: '#1e1b4b',
			borderRadius: '9999px',
			borderStyle: '1px solid',
			borderColor: '#c4b5fd',
			textEffect: 'deep-shadow',
			animationVibe: 'pleiku-rain'
		}
	},
	{
		id: 'cyber-neon',
		name: 'Cyber Neon',
		title: 'CYBER',
		style: {
			textColor: '#67e8f9',
			backgroundColor: '#111827',
			borderRadius: '4px',
			borderStyle: '1px solid',
			borderColor: '#f472b6',
			textEffect: 'retro-glitch',
			animationVibe: 'flicker'
		}
	},
	{
		id: 'aurora-mythic',
		name: 'Aurora Mythic',
		title: 'MYTHIC',
		style: {
			textColor: '#0f172a',
			backgroundColor: '#e0f2fe',
			borderRadius: '8px',
			borderStyle: '1px solid',
			borderColor: '#ffffff',
			textEffect: 'none',
			animationVibe: 'aurora'
		}
	},
	{
		id: 'holographic',
		name: 'Holographic',
		title: 'HOLO',
		style: {
			textColor: '#ffffff',
			backgroundColor: '#60a5fa',
			borderRadius: '9999px',
			borderStyle: '1px solid',
			borderColor: '#a5f3fc',
			textEffect: 'neon-glow',
			animationVibe: 'holo'
		}
	},
	{
		id: 'ruby-crown',
		name: 'Ruby Crown',
		title: 'RUBY CROWN',
		style: {
			textColor: '#fff7ed',
			backgroundColor: '#7f1d1d',
			borderRadius: '9999px',
			borderStyle: '1px solid',
			borderColor: '#fbbf24',
			textEffect: 'deep-shadow',
			animationVibe: 'ruby-crown'
		}
	},
	{
		id: 'obsidian',
		name: 'Obsidian',
		title: 'OBSIDIAN',
		style: {
			textColor: '#fde68a',
			backgroundColor: '#111827',
			borderRadius: '9999px',
			borderStyle: '1px solid',
			borderColor: '#f59e0b',
			textEffect: 'neon-glow',
			animationVibe: 'obsidian'
		}
	}
];