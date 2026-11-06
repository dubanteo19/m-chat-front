class TitleNotificationService {
    private originalTitle = 'Chat-DBT-Awesome';
    private interval: ReturnType<typeof setInterval> | null = null;
    private unreadCount = 0;

    constructor() {
        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') {
                    this.clear();
                }
            });
        }
    }

    notify() {
        if (typeof document === 'undefined') return;

        this.unreadCount++;

        if (document.visibilityState === 'visible') return;

        this.start();
    }

    private start() {
        if (this.interval) return;

        const message = () =>
            `💬 ${this.unreadCount} MESSAGES — CHECK IT OUT!`;

        const separator = '     ✦     ';
        let position = 0;

        this.interval = setInterval(() => {
            const text = message() + separator;
            const scrollingText =
                text.slice(position) + text.slice(0, position);

            document.title = scrollingText;

            position = (position + 1) % text.length;
        }, 250);
    }

    clear() {
        this.unreadCount = 0;
        this.stop();
    }

    private stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }

        if (typeof document !== 'undefined') {
            document.title = this.originalTitle;
        }
    }
}

export const titleNotification = new TitleNotificationService();