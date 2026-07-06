// static/sw.js
self.addEventListener('push', (event) => {
    
    if (!event.data) {
        return;
    }

    try {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/favicon.png',
            badge: '/favicon.png',
            tag: 'mchat-notification',
            renotify: true
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    } catch (e) {
        console.error('Failed to parse push data payload', e);
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow('/');
        })
    );
});