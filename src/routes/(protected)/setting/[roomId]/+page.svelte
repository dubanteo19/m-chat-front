<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { storageService } from '$lib/api/storage';
	import FileUploader from '$lib/components/common/file-uploader.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { getCheerUrl } from '$lib/utils/cheer';
	import { compressImage } from '$lib/utils/upload';
	let roomId = $derived(page.params.roomId);
	let selectedFile = $state<File | null>(null);
	let isCompressing = $state<boolean>(false);
	let cherrUrl = $state<string>(getCheerUrl(roomId));
	const handleFiles = async (files: FileList | null) => {
		if (!files) return;
		for (const file of Array.from(files)) {
			isCompressing = true;
			const compressedFile = await compressImage(file);
			isCompressing = false;
			selectedFile = compressedFile;
			const blobUrl = URL.createObjectURL(compressedFile);
			cherrUrl = blobUrl;
		}
	};
	const handleSave = async () => {
		if (!selectedFile) return;
		try {
			const objectKey = `room/${roomId}/cheer.png`;
			const res = await storageService.getPresignedUrlByObjectKey(objectKey);
			await storageService.uploadFile(res.uploadUrl, selectedFile);
			alert('File uploaded successfully!');
		} catch (error) {
			console.error('Error uploading file:', error);
		}
	};
</script>

<div class="flex-center flex-col max-w-md mx-auto h-full gap-4">
	{#if isCompressing}
		<p>Compressing image...</p>
	{/if}
	<img
		src={cherrUrl}
		alt="cheer"
		class="h-12 w-12
							drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)]
							floating
							transition-all duration-300
							group-hover:rotate-6
							group-hover:drop-shadow-[0_6px_14px_rgba(0,0,0,0.35)]"
	/>
	<h2>Welcome to setting for {roomId}</h2>
	<FileUploader label="Upload File" onFilesChanged={handleFiles} multiple={false} />
	<div class="flex gap-4">
		<Button variant="outline">
			<a href={resolve(`/room/${roomId}`)}> Back </a>
		</Button>
		<Button onclick={handleSave} disabled={!selectedFile}>Save</Button>
	</div>
</div>
