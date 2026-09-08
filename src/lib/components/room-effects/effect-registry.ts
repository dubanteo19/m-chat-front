import { roomEffectsLabels, type RoomEffect } from './effects/particles';

export type RoomEffectCategory = 'nature' | 'celebration' | 'dreamscape' | 'journey';

export type RoomEffectDefinition = {
    type: RoomEffect;
    icon: string;
    label: string;
    description: string;
    category: RoomEffectCategory;
    previewBackground: string;
};

export const roomEffectCategories: ReadonlyArray<{
    value: 'all' | RoomEffectCategory;
    label: string;
}> = [
        { value: 'all', label: 'All' },
        { value: 'nature', label: 'Nature' },
        { value: 'celebration', label: 'Celebration' },
        { value: 'dreamscape', label: 'Dreamscape' },
        { value: 'journey', label: 'Journey' }
    ];

const effectPresentation = {
    snow: {
        description: 'A calm fall of winter snow.',
        category: 'nature',
        previewBackground: 'linear-gradient(145deg, #e2e8f0 0%, #93c5fd 48%, #334155 100%)'
    },
    sakura: {
        description: 'Soft petals drifting through the room.',
        category: 'nature',
        previewBackground: 'linear-gradient(145deg, #fdf2f8 0%, #f9a8d4 52%, #be185d 100%)'
    },
    aurora: {
        description: 'Northern lights across a midnight sky.',
        category: 'nature',
        previewBackground: 'linear-gradient(135deg, #020617 0%, #312e81 38%, #14b8a6 72%, #67e8f9 100%)'
    },
    thunderstorm: {
        description: 'Electric clouds and rolling lightning.',
        category: 'nature',
        previewBackground: 'linear-gradient(145deg, #020617 0%, #1e293b 55%, #7c3aed 82%, #f8fafc 100%)'
    },
    'radiance-of-amitabha': {
        description: 'Warm, peaceful rays of golden light.',
        category: 'dreamscape',
        previewBackground: 'radial-gradient(circle at 50% 35%, #fef3c7 0%, #f59e0b 34%, #7c2d12 100%)'
    },
    'disco-fever': {
        description: 'Colorful lights for a lively room.',
        category: 'celebration',
        previewBackground: 'linear-gradient(135deg, #111827 0%, #db2777 32%, #7c3aed 64%, #06b6d4 100%)'
    },
    'paper-butterfly-dream': {
        description: 'Paper butterflies in a gentle dream.',
        category: 'dreamscape',
        previewBackground: 'linear-gradient(145deg, #f5f3ff 0%, #c4b5fd 42%, #f0abfc 72%, #4c1d95 100%)'
    },
    'bioluminescent-tide': {
        description: 'Glowing waves from a moonlit sea.',
        category: 'nature',
        previewBackground: 'linear-gradient(160deg, #020617 0%, #164e63 45%, #0891b2 72%, #67e8f9 100%)'
    },
    'sticker-road-trip': {
        description: 'A playful ride full of travel stickers.',
        category: 'journey',
        previewBackground: 'linear-gradient(145deg, #fef3c7 0%, #fb923c 45%, #0ea5e9 100%)'
    },
    'vietnamese-mid-autumn': {
        description: 'Lantern light under a full autumn moon.',
        category: 'celebration',
        previewBackground:
            'radial-gradient(circle at 68% 30%, #fef9c3 0 12%, #f97316 13% 36%, #7c2d12 72%, #1e1b4b 100%)'
    }
} as const satisfies Record<
    RoomEffect,
    {
        description: string;
        category: RoomEffectCategory;
        previewBackground: string;
    }
>;

export const roomEffects: RoomEffectDefinition[] = roomEffectsLabels.map((effect) => ({
    ...effect,
    ...effectPresentation[effect.type]
}));

export function getRoomEffectDefinition(effect: RoomEffect | null | undefined) {
    return roomEffects.find((item) => item.type === effect);
}
