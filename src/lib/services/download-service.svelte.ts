function createDownloadService() {
    const parseFileName = (url: string): string => {
        const fileName = url.split('/').pop();
        return fileName || new Date().toISOString() + '.mp4';
    }
    const downloadVideo = async (src: string) => {
        const fileName = parseFileName(src);
        const API = `http://192.168.1.81:5000`;
        const url = `${API}/download-video/general/${encodeURIComponent(fileName)}`;

        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('Download request rejected by server.');
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `${fileName}`;
            document.body.appendChild(link);
            link.click();

            link.remove();
            URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error('Trim extraction download sequence aborted:', err);
        }
    };
    return {
        parseFileName,
        downloadVideo
    }
}

export const downloadService = createDownloadService();