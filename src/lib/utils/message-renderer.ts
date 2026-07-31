import { truncateText } from "./text";

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