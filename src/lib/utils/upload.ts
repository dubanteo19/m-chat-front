import imageCompression from 'browser-image-compression';
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

export function validateAndExtractMediaFile(file: File): 'IMAGE' | 'VIDEO' | null {
	const isImage = file.type.startsWith('image/');
	const isVideo = file.type.startsWith('video/');

	if (!isImage && !isVideo) {
		return null;
	}
	return isVideo ? 'VIDEO' : 'IMAGE';
}
export function compressImage(file: File): Promise<File> {
	return imageCompression(file, {
		maxSizeMB: 2,
		maxWidthOrHeight: 1920,
		useWebWorker: true,
		initialQuality: 0.8
	});
}
