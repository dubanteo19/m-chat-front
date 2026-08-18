import type { RoomMemberInfo } from "$lib/types/room";
import { parseMessage } from "./message-parser";
import { truncateText } from "./text";

const MENTION_REGEX = /@([a-zA-Z0-9_\-\s]+?)(?=\s|$)/g;
const URL_REGEX = /\b(https?:\/\/[^\s<]+|www\.[^\s<]+)\b/gi;


export function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Renders structured message content (<@userId> tags and URLs) to safe HTML.
 */
export function renderMessage(text: string, members: RoomMemberInfo[] = []): string {
    if (!text) return "";

    const tokens = parseMessage(text);

    return tokens
        .map((token) => {
            if (token.type === 'text') {
                const safeText = escapeHtml(token.value);
                return renderLinks(safeText);
            }

            if (token.type === 'mention') {
                const matchedMember = members.find( (m) => String(m.user.id) === token.userId);

                const displayName = matchedMember
                    ? matchedMember.user.displayName || matchedMember.user.username
                    : token.userId;

                const safeId = escapeHtml(token.userId);

                return `<span
                    class="mention-chip"
                    data-user-id="${safeId}"
                    style="
                        color: #60a5fa;
                        font-weight: 600;
                        padding: 1px 4px;
                        border-radius: 4px;
                        display: inline-block;
                    "
                >@${escapeHtml(displayName)}</span>`;
            }

            return '';
        })
        .join('');
}

function renderLinks(text: string): string {
    return text.replace(URL_REGEX, (url) => {
        const href = url.startsWith("http") ? url : `https://${url}`;

        return `<a
			href="${href}"
			target="_blank"
			rel="noopener noreferrer"
			style="
				color: #2563eb;
				text-decoration: underline;
				word-break: break-all;
			"
		>${truncateText(url)}</a>`;
    });
}
