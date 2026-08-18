import type { RoomMemberInfo } from "$lib/types/room";

export interface TextToken {
    type: 'text';
    value: string;
}

export interface MentionToken {
    type: 'mention';
    userId: string;
    raw: string;
}

export type MessageToken = TextToken | MentionToken;

// Global regex targeting markup tags like <@userId>
const MARKUP_REGEX = /<@([a-zA-Z0-9_\-]+)>/g;

export function parseMessage(text: string): MessageToken[] {
    if (!text) return [];

    const tokens: MessageToken[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = MARKUP_REGEX.exec(text)) !== null) {
        // Push plain text before the match
        if (match.index > lastIndex) {
            tokens.push({
                type: 'text',
                value: text.slice(lastIndex, match.index)
            });
        }

        // Push the mention token
        tokens.push({
            type: 'mention',
            userId: match[1],
            raw: match[0]
        });

        lastIndex = MARKUP_REGEX.lastIndex;
    }

    // Push trailing text
    if (lastIndex < text.length) {
        tokens.push({
            type: 'text',
            value: text.slice(lastIndex)
        });
    }

    return tokens;
}

/**
 * Replaces <@userId> tokens with @displayName for plain-text editing inside inputs
 */
export function formatRawToInput(text: string, members: RoomMemberInfo[] = []): string {
    return text.replace(MARKUP_REGEX, (match, userId) => {
        const member = members.find((m) => String(m.user.id) === userId);
        const displayName = member ? (member.user.displayName || member.user.username) : userId;
        return `@${displayName}`;
    });
}