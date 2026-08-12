import type { RoomMemberInfo } from "$lib/types/user";
import { truncateText } from "./text";

const MENTION_REGEX = /@([a-zA-Z0-9_-]+)/g;
const URL_REGEX = /\b(https?:\/\/[^\s<]+|www\.[^\s<]+)\b/gi;


function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function renderMentions(text: string, members: RoomMemberInfo[] = []): string {
    return text.replace(MENTION_REGEX, (match, username) => {
        const matchedMember = members.find(
            (m) => m.user.username.toLowerCase() === username.toLowerCase()
        );

        if (!matchedMember) {
            return match; // If not a valid room member, leave as plain text
        }

        // Escape values going into attributes and innerHTML
        const safeId = escapeHtml(String(matchedMember.user.username));
        const safeUsername = escapeHtml(matchedMember.user.username);

        return `<span
			class="mention-chip"
			data-user-id="${safeId}"
			style="
				background-color: #dbeafe;
				color: #1e40af;
				font-weight: 600;
				padding: 2px 6px;
				border-radius: 4px;
				cursor: pointer;
				display: inline-block;
			"
		>@${safeUsername}</span>`;
    });
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

/**
 * Renders raw text to safe HTML with mentions and auto-linked URLs.
 */
export function renderMessage(text: string, members: RoomMemberInfo[] = []): string {
    if (!text) return "";

    // 1. First escape raw user input to prevent XSS
    let html = escapeHtml(text);

    // 2. Transform URLs into <a> tags
    html = renderLinks(html);

    // 3. Transform @mentions into styled <span> tags
    html = renderMentions(html, members);

    return html;
}