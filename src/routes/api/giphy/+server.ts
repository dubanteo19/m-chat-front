import type { UserInfo } from '$lib/types/user';
import { json, type RequestHandler } from '@sveltejs/kit';

interface GiphyResponse {
    data: Array<{
        id: string;
        title: string;
        images: {
            original: { url: string };
            fixed_height_small: { url: string };
        };
    }>;
    pagination: {
        total_count: number;
        count: number;
        offset: number;
    };
    meta: {
        status: number;
        msg: string;
        response_id: string;
    };
}

// 1. In-memory data cache
const cache = new Map<string, { timestamp: number; data: GiphyResponse }>();
const CACHE_DURATION = 60 * 60 * 1000 * 10; // 10 hour
const LIMIT = 10;

// 2. In-memory rate limiter per User ID (number -> limit record)
const userRateLimits = new Map<number, { count: number; resetTime: number }>();
const MAX_REQUESTS_PER_HOUR = 10;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

export const GET: RequestHandler = async ({ url, locals, setHeaders }) => {
    // Safely extract authenticated user from locals
    const user = locals.user as UserInfo | undefined;

    if (!user) {
        return json(
            { error: 'Unauthorized. Please log in to search GIFs.' },
            { status: 401 }
        );
    }

    const userId = user.id;
    const now = Date.now();
    let userRecord = userRateLimits.get(userId);

    // Reset window if expired or non-existent
    if (!userRecord || now > userRecord.resetTime) {
        userRecord = { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
        userRateLimits.set(userId, userRecord);
    }

    const query = url.searchParams.get('q')?.trim() || '';
    const cacheKey = query ? `search:${query.toLowerCase()}` : 'trending';
    const cachedItem = cache.get(cacheKey);

    // If cache hit, return immediately WITHOUT counting against user's rate limit
    if (cachedItem && now - cachedItem.timestamp < CACHE_DURATION) {
        console.log(`[Cache Hit] Query: "${query}" | User ID: ${userId}`);
        setHeaders({ 'Cache-Control': 'public, max-age=36000' });
        return json(cachedItem.data);
    }

    // Check user rate limit before hitting external API
    if (userRecord.count >= MAX_REQUESTS_PER_HOUR) {
        const retryAfterSeconds = Math.ceil((userRecord.resetTime - now) / 1000);
        console.warn(`[Rate Limit Exceeded] User ID: ${userId}`);
        
        return json(
            { error: 'Rate limit exceeded. You can only make 10 new searches per hour.' },
            { 
                status: 429, 
                headers: { 'Retry-After': retryAfterSeconds.toString() } 
            }
        );
    }

    // Increment request count for external API call
    userRecord.count += 1;

    const apiKey = "Fth81qtFEPg2JqV989lrLFVixzS5AK20";
    const endpoint = query
        ? `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=${LIMIT}&rating=g`
        : `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=${LIMIT}&rating=g`;

    console.log(`[API Fetch] Query: "${query}" | User ID: ${userId} (${userRecord.count}/${MAX_REQUESTS_PER_HOUR})`);
    
    try {
        const res = await fetch(endpoint);
        const data: GiphyResponse = await res.json();

        // Only cache valid responses
        if (data?.data) {
            cache.set(cacheKey, { timestamp: now, data });
        }

        setHeaders({ 'Cache-Control': 'public, max-age=36000' });
        return json(data);
    } catch (err) {
        // Rollback request count on fetch failure
        userRecord.count = Math.max(0, userRecord.count - 1);
        return json({ error: 'Failed to fetch from Giphy' }, { status: 500 });
    }
};