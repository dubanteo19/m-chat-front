<script lang="ts">
	import { storageService } from '$lib/api/storage';
	import FileExtensionIcon from '$lib/components/common/file-extension-icon.svelte';
	import { Button } from '$lib/components/ui/button';
	import { DownloadIcon } from '@lucide/svelte';

	let {
		content
	}: {
		content: string;
	} = $props();
	const FiLE_REGEX = /<file\|([^|]+)\|([^>]+)>/;
	const match = $derived(content.match(FiLE_REGEX));

	const fileName = $derived(match ? match[1] : 'Unknown File');
	const extension = $derived(fileName.split('.').pop()?.toLowerCase() ?? '');
	const handleDownload = async () => {
		try {
			if (!match) return;
			const [_, fileName, objectKey] = match;
			const downloadUrl = await storageService.getDownloadUrl(objectKey, fileName);
			if (downloadUrl) {
				window.open(downloadUrl, '_blank');
			}
		} catch (error) {
			console.error('Error downloading file:', error);
		}
	};
</script>

<div
	class="flex flex-col w-64 h-64 group rounded-xl border border-slate-200 shadow-sm bg-gray-200 overflow-hidden max-w-sm"
>
	<div class="flex gap-2 bg-white p-2 items-center">
		<div class="flex-1 flex gap-2 items-center overflow-hidden">
			<FileExtensionIcon {extension} />
			<span class="truncate text-black">{fileName}</span>
		</div>
		{#if match && match[2]}
			<Button onclick={() => handleDownload()} size="icon">
				<DownloadIcon />
			</Button>
		{/if}
	</div>
	<div class="flex-1 flex-center">
		<FileExtensionIcon {extension} size={52} />
	</div>
</div>
