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
