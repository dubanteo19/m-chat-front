<script lang="ts">
	import {
		FileIcon,
		FileTextIcon,
		FileArchiveIcon,
		FileSpreadsheetIcon,
		FileCodeIcon,
		FileImageIcon,
		VideoIcon
	} from '@lucide/svelte';

	const FILE_ICONS = {
		pdf: FileTextIcon,
		doc: FileTextIcon,
		docx: FileTextIcon,
		txt: FileTextIcon,
		rtf: FileTextIcon,

		zip: FileArchiveIcon,
		rar: FileArchiveIcon,
		'7z': FileArchiveIcon,
		tar: FileArchiveIcon,
		gz: FileArchiveIcon,

		xls: FileSpreadsheetIcon,
		xlsx: FileSpreadsheetIcon,
		csv: FileSpreadsheetIcon,

		js: FileCodeIcon,
		ts: FileCodeIcon,
		json: FileCodeIcon,
		html: FileCodeIcon,
		css: FileCodeIcon,

		png: FileImageIcon,
		jpg: FileImageIcon,
		jpeg: FileImageIcon,
		webp: FileImageIcon,

		mp4: VideoIcon,
		mov: VideoIcon,
		webm: VideoIcon
	} as const;

	let { extension, size = 24 }: { extension: string; size?: number } = $props();

	const FileTypeIcon = $derived(FILE_ICONS[extension as keyof typeof FILE_ICONS] ?? FileIcon);
</script>

<FileTypeIcon {size} color="gray" />
