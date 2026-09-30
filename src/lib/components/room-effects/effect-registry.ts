import { roomEffectsLabels, type RoomEffect } from './effects/particles';

export enum RoomEffectCategory {
    ALL = 'all',
    NATURE = 'nature',
    DREAMSCAPE = 'dreamscape',
    EVENT = 'event',
    WORLDS = 'worlds'
}

type EffectCategory = Exclude<RoomEffectCategory, RoomEffectCategory.ALL>;

export type RoomEffectDefinition = {
    type: RoomEffect;
    icon: string;
    label: string;
    description: string;
    category: EffectCategory;
    previewBackground: string;
};

export const roomEffectCategories: ReadonlyArray<{
    value: RoomEffectCategory;
    label: string;
}> = [
        { value: RoomEffectCategory.ALL, label: 'All' },
        { value: RoomEffectCategory.NATURE, label: 'Nature' },
        { value: RoomEffectCategory.DREAMSCAPE, label: 'Dreamscape' },
        { value: RoomEffectCategory.EVENT, label: 'Event' },
        { value: RoomEffectCategory.WORLDS, label: 'Worlds' }
    ];

const effectPresentation = {
    'halloween-night': {
        description: 'A deserted corridor where the silence occasionally looks back.',
        category: RoomEffectCategory.EVENT,
        previewBackground:
            'linear-gradient(145deg, #111b1d 0%, #172628 38%, #080f11 72%, #020506 100%)'
    },
    'dewdrop-worlds': {
        description: 'Tiny worlds gather in the morning dew.',
        category: RoomEffectCategory.WORLDS,
        previewBackground: 'radial-gradient(circle at 32% 28%, #e5faf2 0%, #8fc9b5 32%, #386f67 68%, #143b3b 100%)'
    },
    snow: {
        description: 'A calm fall of winter snow.',
        category: RoomEffectCategory.NATURE,
        previewBackground: 'linear-gradient(145deg, #e2e8f0 0%, #93c5fd 48%, #334155 100%)'
    },
    sakura: {
        description: 'Soft petals drifting through the room.',
        category: RoomEffectCategory.NATURE,
        previewBackground: 'linear-gradient(145deg, #fdf2f8 0%, #f9a8d4 52%, #be185d 100%)'
    },
    aurora: {
        description: 'Northern lights across a midnight sky.',
        category: RoomEffectCategory.NATURE,
        previewBackground: 'linear-gradient(135deg, #020617 0%, #312e81 38%, #14b8a6 72%, #67e8f9 100%)'
    },
    thunderstorm: {
        description: 'Electric clouds and rolling lightning.',
        category: RoomEffectCategory.NATURE,
        previewBackground: 'linear-gradient(145deg, #020617 0%, #1e293b 55%, #7c3aed 82%, #f8fafc 100%)'
    },
    'radiance-of-amitabha': {
        description: 'Warm, peaceful rays of golden light.',
        category: RoomEffectCategory.DREAMSCAPE,
        previewBackground: 'radial-gradient(circle at 50% 35%, #fef3c7 0%, #f59e0b 34%, #7c2d12 100%)'
    },
    'disco-fever': {
        description: 'Colorful lights for a lively room.',
        category: RoomEffectCategory.DREAMSCAPE,
        previewBackground: 'linear-gradient(135deg, #111827 0%, #db2777 32%, #7c3aed 64%, #06b6d4 100%)'
    },
    'paper-butterfly-dream': {
        description: 'Paper butterflies in a gentle dream.',
        category: RoomEffectCategory.WORLDS,
        previewBackground: 'linear-gradient(145deg, #f5f3ff 0%, #c4b5fd 42%, #f0abfc 72%, #4c1d95 100%)'
    },
    'bioluminescent-tide': {
        description: 'Glowing waves from a moonlit sea.',
        category: RoomEffectCategory.WORLDS,
        previewBackground: 'linear-gradient(160deg, #020617 0%, #164e63 45%, #0891b2 72%, #67e8f9 100%)'
    },
    'sticker-road-trip': {
        description: 'A playful ride full of travel stickers.',
        category: RoomEffectCategory.WORLDS,
        previewBackground: 'linear-gradient(145deg, #fef3c7 0%, #fb923c 45%, #0ea5e9 100%)'
    },
    'vietnamese-mid-autumn': {
        description: 'Lantern light under a full autumn moon.',
        category: RoomEffectCategory.EVENT,
        previewBackground:
            'radial-gradient(circle at 68% 30%, #fef9c3 0 12%, #f97316 13% 36%, #7c2d12 72%, #1e1b4b 100%)'
    }
} as const satisfies Record<
    RoomEffect,
    {
        description: string;
        category: EffectCategory;
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
