<script lang="ts">
	import { Upload } from '@lucide/svelte';
	let {
		label,
		onFilesChanged,
		multiple = true

	}: {
		label: string;
		onFilesChanged: (files: FileList | null) => void;
		multiple?: boolean;
	} = $props();

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		onFilesChanged(event.dataTransfer?.files ?? null);
	}
</script>

<label
	class="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed text-center transition hover:bg-muted"
	ondragover={(event) => event.preventDefault()}
	ondrop={handleDrop}
>
	<Upload class="mb-2 size-5 text-muted-foreground" />
	<span class="text-xs font-medium"> {label} </span>
	<span class="mt-1 px-2 text-[10px] text-muted-foreground"> Drop or click </span>
	<input
		type="file"
		accept="image/*"
		multiple={multiple}
		class="hidden"
		onchange={(event) => onFilesChanged(event.currentTarget.files)}
	/>
</label>
