export interface TextToken {
    type: 'text';
    value: string;
}
export interface LinkToken {
    type: 'link';
    url: string;
}
export interface MentionToken {
    type: 'mention';
    userId: string;
    raw: string;
}

export type MessageToken = TextToken | MentionToken | LinkToken;

// Global regex targeting markup tags like <@userId>
const MARKUP_REGEX =
    /<@([a-zA-Z0-9_-]+)>|\b(https?:\/\/[^\s<]+|www\.[^\s<]+)\b/gi;


export function parseMessage(text: string): MessageToken[] {
    if (!text) return [];

    const tokens: MessageToken[] = [];
    let lastIndex = 0;

    for (const match of text.matchAll(MARKUP_REGEX)) {
        const index = match.index ?? 0;

        // Plain text before this token
        if (index > lastIndex) {
            tokens.push({
                type: 'text',
                value: text.slice(lastIndex, index)
            });
        }

        // Mention
        if (match[1]) {
            tokens.push({
                type: 'mention',
                userId: match[1],
                raw: match[0]
            });
        }
        // Link
        else if (match[2]) {
            tokens.push({
                type: 'link',
                url: match[2]
            });
        }

        lastIndex = index + match[0].length;
    }

    // Remaining text
    if (lastIndex < text.length) {
        tokens.push({
            type: 'text',
            value: text.slice(lastIndex)
        });
    }

    return tokens;
}