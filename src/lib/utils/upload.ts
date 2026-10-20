import imageCompression from 'browser-image-compression';

const MAX_MEDIA_SIZE = 200 * 1024 * 1024; // 200MB
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export function extractImageFromPaste(event: ClipboardEvent): File | null {
	const items = event.clipboardData?.items;
	if (!items) return null;

	for (const item of items) {
		if (item.type.startsWith('image/')) {
			return item.getAsFile();
		}
	}
	return null;
}

export function extractImageUrlFromPaste(
	event: ClipboardEvent
): string | null {
	const html = event.clipboardData?.getData('text/html');
	if (!html) return null;

	const doc = new DOMParser().parseFromString(html, 'text/html');
	const img = doc.querySelector('img');

	return img?.src ?? null;
}
export async function fetchFile(url: string): Promise<File> {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
	const blob = await response.blob();
	const filename = url.split('/').pop()?.split('?')[0] || 'image.gif';
	return new File([blob], filename, { type: blob.type });
}
export function extractFileFromDrop(event: DragEvent): File | null {
	event.preventDefault();
	const files = event.dataTransfer?.files;
	return files && files.length > 0 ? files[0] : null;
}

export function validateAndExtractMediaFile(file: File): 'IMAGE' | 'VIDEO' | 'FILE' | null {
	const fileName = file.name.toLowerCase();
	if (fileName.endsWith('.exe')) {
		// Reject executable files
		return null;
	}
	const isImage = file.type.startsWith('image/');
	const isVideo = file.type.startsWith('video/');
	if (isImage) return 'IMAGE';
	if (isVideo) return 'VIDEO';
	return 'FILE';
}
export function validateFileSize(
	file: File,
	fileType: 'IMAGE' | 'VIDEO' | 'FILE',
): boolean {
	if (fileType === 'IMAGE' || fileType === 'VIDEO') {
		return file.size <= MAX_MEDIA_SIZE;
	}
	return file.size <= MAX_FILE_SIZE;
}

export function compressImage(file: File): Promise<File> {
	return imageCompression(file, {
		maxSizeMB: 2,
		maxWidthOrHeight: 1920,
		useWebWorker: true,
		initialQuality: 0.8
	});
}
