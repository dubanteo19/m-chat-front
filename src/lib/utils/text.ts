export function truncateText(text: string, maxLength: number = 30): string {
    if (!text) return '';

    // Normalize newlines to spaces so the preview stays single-line
    const sanitizedText = text.replace(/\s+/g, ' ');

    if (sanitizedText.length <= maxLength) return sanitizedText;
    return sanitizedText.slice(0, maxLength) + '...';
}