class FaviconNotificationService {
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private link: HTMLLinkElement | null = null;
    private originalHref = '';

    private interval: ReturnType<typeof setInterval> | null = null;
    private emojis = ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣'];
    private colors = [
        '#ef4444', // Red
        '#f97316', // Orange
        '#eab308', // Yellow
        '#22c55e', // Green
        '#3b82f6', // Blue
        '#a855f7', // Purple
    ];

    constructor() {
        if (typeof document === 'undefined') return;

        this.canvas = document.createElement('canvas');
        this.canvas.width = 32;
        this.canvas.height = 32;

        this.ctx = this.canvas.getContext('2d');

        this.link = document.querySelector('link[rel="icon"]');

        if (this.link) {
            this.originalHref = this.link.href;
        }

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.stop();
            }
        });
    }

    start() {
        if (
            typeof document === 'undefined' ||
            !this.link ||
            this.interval
        ) return;

        let frame = 0;

        this.interval = setInterval(() => {
            const emoji = this.emojis[frame % this.emojis.length];

            this.link!.href = this.createEmojiFavicon(emoji);

            frame++;
        }, 300);
    }


    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }

        if (typeof document !== 'undefined' && this.link) {
            this.link.href = this.originalHref;
        }
    }
    private createEmojiFavicon(emoji: string): string {
        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
            <text x="50%" y="50%"
                font-size="54"
                text-anchor="middle"
                dominant-baseline="central">${emoji}</text>
        </svg>
    `;

        return `data:image/svg+xml,${encodeURIComponent(svg)}`;
    }
}

export const faviconNotification = new FaviconNotificationService();