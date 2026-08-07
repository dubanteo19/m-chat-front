import { truncateText } from "./text";
const MENTION_REGEX = /@([a-zA-Z0-9_-]+)/g;

function renderMentions(text: string, members: Array<{ id: string; username: string }>): string {
    return text.replace(MENTION_REGEX, (match, username) => {
        // Optional: Check if the mentioned user actually exists in the room
        const matchedMember = members.find(
            (m) => m.username.toLowerCase() === username.toLowerCase()
        );

        if (!matchedMember) {
            return match; // If not a valid member, render raw text
        }

        return `<span
            class="mention-chip"
            data-user-id="${matchedMember.id}"
            style="
                background-color: #dbeafe;
                color: #1e40af;
                font-weight: 600;
                padding: 2px 6px;
                border-radius: 4px;
                cursor: pointer;
            "
        >@${matchedMember.username}</span>`;
    });
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

const URL_REGEX =
    /\b(https?:\/\/[^\s<]+|www\.[^\s<]+)\b/gi;

function renderLinks(text: string): string {
    return text.replace(URL_REGEX, (url) => {
        const href = url.startsWith("http")
            ? url
            : `https://${url}`;

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

export function renderMessage(text: string): string {
    let html = escapeHtml(text);

    html = renderLinks(html);

    return html;
}