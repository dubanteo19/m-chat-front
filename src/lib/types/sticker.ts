export type StickerVisibility = 'PUBLIC' | 'PRIVATE';

export interface Sticker {
    id: string;
    url: string;
    name?: string;
}

export interface StickerPackage {
    id: string;
    name: string;
    description: string;
    visibility: StickerVisibility;
    stickers: Sticker[];
    createdAt: string;
    updatedAt: string;
}

export const MOCK_STICKER_PACKAGES: StickerPackage[] = [
    {
        id: 'pack-001',
        name: 'Cute Cats',
        description: 'My collection of cute cat reactions.',
        visibility: 'PUBLIC',
        createdAt: '2026-09-01T10:00:00Z',
        updatedAt: '2026-09-20T12:00:00Z',
        stickers: [
            { id: 'sticker-001', url: 'https://minio.dbt19.site/mchat-public/nga/nga-1.webp', name: 'Love' },
            { id: 'sticker-002', url: 'https://minio.dbt19.site/mchat-public/nga/nga-2.webp', name: 'Happy' },
            { id: 'sticker-003', url: 'https://minio.dbt19.site/mchat-public/nga/nga-2.webp', name: 'Laugh' },
            { id: 'sticker-004', url: 'https://minio.dbt19.site/mchat-public/nga/nga-2.webp', name: 'Cry' },
            { id: 'sticker-005', url: 'https://minio.dbt19.site/mchat-public/nga/nga-2.webp', name: 'Angry' },
        ]
    },
    {
        id: 'pack-002',
        name: 'Work Reactions',
        description: 'Stickers for everyday work conversations.',
        visibility: 'PRIVATE',
        createdAt: '2026-09-05T10:00:00Z',
        updatedAt: '2026-09-18T12:00:00Z',
        stickers: [
            { id: 'sticker-101', url: 'https://minio.dbt19.site/mchat-public/nga/nga-2.webp', name: 'OK' },
            { id: 'sticker-102', url: 'https://minio.dbt19.site/mchat-public/nga/nga-2.webp', name: 'Thanks' },
            { id: 'sticker-103', url: 'https://minio.dbt19.site/mchat-public/nga/nga-2.webp', name: 'Confused' },
            { id: 'sticker-104', url: 'https://minio.dbt19.site/mchat-public/nga/nga-2.webp', name: 'Busy' }
        ]
    },
    {
        id: 'pack-003',
        name: 'Funny Animals',
        description: 'Random animals doing random things.',
        visibility: 'PUBLIC',
        createdAt: '2026-09-10T10:00:00Z',
        updatedAt: '2026-09-21T12:00:00Z',
        stickers: [
            { id: 'sticker-201', url: 'https://minio.dbt19.site/mchat-public/nga/nga-2.webp', name: 'Wow' },
            { id: 'sticker-202', url: 'https://minio.dbt19.site/mchat-public/nga/nga-2.webp', name: 'No' },
            { id: 'sticker-203', url: 'https://minio.dbt19.site/mchat-public/nga/nga-2.webp', name: 'Duck' },
            { id: 'sticker-204', url: 'https://minio.dbt19.site/mchat-public/nga/nga-2.webp', name: 'Frog' },
            { id: 'sticker-205', url: 'https://minio.dbt19.site/mchat-public/nga/nga-2.webp', name: 'Panda' }
        ]
    }
];