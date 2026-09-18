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

export interface MergeRequestToken {
    type: 'merge_request';
    url: string;
    projectPath: string;
    mrId: string;
}
export interface BacklogToken {
    type: 'backlog';
    url: string;
    issueKey: string;
    commentId?: string;
}
export type MessageToken =
    | TextToken
    | MentionToken
    | LinkToken
    | MergeRequestToken
    | BacklogToken;

const GITLAB_MR_REGEX =
    /https?:\/\/gitlab\.shiftseven-dev\.com\/([^\s<]+)\/-\/merge_requests\/(\d+)/i;
const BACKLOG_REGEX =
    /https?:\/\/[a-zA-Z0-9_-]+\.backlog\.com\/view\/([a-zA-Z0-9_-]+)(?:#comment-(\d+))?/i;
// Global regex targeting markup tags like <@userId>
const MARKUP_REGEX =
    /<@([a-zA-Z0-9_-]+)>|(https?:\/\/gitlab\.shiftseven-dev\.com\/[^\s<]+\/-\/merge_requests\/\d+)|(https?:\/\/[a-zA-Z0-9_-]+\.backlog\.com\/view\/[a-zA-Z0-9_-]+(?:#comment-\d+)?)|\b(https?:\/\/[^\s<]+|www\.[^\s<]+)\b/gi;


export function parseMessage(text: string): MessageToken[] {
    if (!text) return [];

    const tokens: MessageToken[] = [];
    let lastIndex = 0;

    for (const match of text.matchAll(MARKUP_REGEX)) {
        const index = match.index ?? 0;

        // Plain text segment before match
        if (index > lastIndex) {
            tokens.push({
                type: 'text',
                value: text.slice(lastIndex, index)
            });
        }

        // 1. Mention: <@userId>
        if (match[1]) {
            tokens.push({
                type: 'mention',
                userId: match[1],
                raw: match[0]
            });
        }
        // 2. GitLab Merge Request
        else if (match[2]) {
            const mrMatch = match[2].match(GITLAB_MR_REGEX);
            if (mrMatch) {
                tokens.push({
                    type: 'merge_request',
                    url: match[2],
                    projectPath: mrMatch[1],
                    mrId: mrMatch[2]
                });
            } else {
                tokens.push({ type: 'link', url: match[2] });
            }
        }
        // 3. Backlog Issue / Comment
        else if (match[3]) {
            const backlogMatch = match[3].match(BACKLOG_REGEX);
            if (backlogMatch) {
                tokens.push({
                    type: 'backlog',
                    url: match[3],
                    issueKey: backlogMatch[1],
                    commentId: backlogMatch[2] // undefined if no comment hash
                });
            } else {
                tokens.push({ type: 'link', url: match[3] });
            }
        }
        // 4. Standard Fallback Link
        else if (match[4]) {
            tokens.push({
                type: 'link',
                url: match[4]
            });
        }

        lastIndex = index + match[0].length;
    }

    if (lastIndex < text.length) {
        tokens.push({
            type: 'text',
            value: text.slice(lastIndex)
        });
    }

    return tokens;
}