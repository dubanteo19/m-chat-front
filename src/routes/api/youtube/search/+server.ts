import { json } from '@sveltejs/kit';
import youtubeSearchApi from 'youtube-search-api';

export async function GET({ url }) {
    const query = url.searchParams.get('q');

    if (!query?.trim()) {
        return json(
            { error: 'Query is required' },
            { status: 400 }
        );
    }

    try {
        const result = await youtubeSearchApi.GetListByKeyword(
            query,
            false,
            12,
            [{ type: 'video' }]
        );

        return json(result);
    } catch (error) {
        console.error('YouTube search failed:', error);

        return json(
            { error: 'YouTube search failed' },
            { status: 500 }
        );
    }
}