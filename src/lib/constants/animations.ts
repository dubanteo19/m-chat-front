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
    }
];

// Automatically generate a runtime lookup map
export const animationClassMap = BADGE_ANIMATIONS.reduce<Record<string, string>>((map, item) => {
    map[item.value] = item.className;
    return map;
}, {});