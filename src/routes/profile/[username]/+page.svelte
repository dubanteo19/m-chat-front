<script lang="ts">
	import UserAvatar from '$lib/components/common/user-avatar.svelte';
	import type { PageData } from './$types';

	// Svelte 5 reads data loaded from +page.ts via the data prop
	let { data }: { data: PageData } = $props();

	// Establish reactive local state initialized by fetched data
	let profile = $state(data.profile);
	let displayName = $state(profile.displayName);
	let title = $state(profile.title || '');
	let imageFailed = $state(false);
	let avatarUrl = $state(profile.avatarUrl || '');

	let isSaving = $state(false);
	let isUploading = $state(false);
	let feedbackMessage = $state({ text: '', type: '' });
	async function handleAvatarUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		if (!target.files?.length) return;

		const file = target.files[0];
		isUploading = true;
		feedbackMessage = { text: 'Uploading avatar to cloud storage...', type: 'info' };

		try {
			// 1. Get presigned ticket url
			const tokenRes = await fetch(
				`/api/storage/presigned-url?filename=${encodeURIComponent(file.name)}`
			);
			if (!tokenRes.ok) throw new Error('Could not authorize cloud storage upload.');
			const { uploadUrl, downloadUrl } = await tokenRes.json();

			// 2. Direct upload file binary block
			const cloudRes = await fetch(uploadUrl, {
				method: 'PUT',
				body: file,
				headers: { 'Content-Type': file.type }
			});
			if (!cloudRes.ok) throw new Error('File transfer to bucket rejected.');

			avatarUrl = downloadUrl;
			imageFailed = false;
			feedbackMessage = { text: 'Avatar uploaded! Save changes to finalize.', type: 'success' };
		} catch (err: any) {
			feedbackMessage = { text: err.message, type: 'error' };
		} finally {
			isUploading = false;
		}
	}

	async function handleProfileUpdate(event: SubmitEvent) {
		event.preventDefault();
		isSaving = true;
		feedbackMessage = { text: 'Saving structural changes...', type: 'info' };

		try {
			const res = await fetch(`/api/users/${profile.username}/profile`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ displayName, title, avatarUrl })
			});

			if (!res.ok) throw new Error('Database updates rejected.');

			const updatedRecord = await res.json();
			profile = updatedRecord; // Sync back current active object
			feedbackMessage = { text: 'Profile successfully updated!', type: 'success' };
		} catch (err: any) {
			feedbackMessage = { text: err.message, type: 'error' };
		} finally {
			isSaving = false;
		}
	}
</script>

<div class="min-h-screen bg-slate-50 py-10 px-4">
	<div
		class="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
	>
		<div class="h-32 bg-gradient-to-r from-purple-500 to-indigo-600 relative"></div>

		<div class="px-8 pb-8 relative">
			<form onsubmit={handleProfileUpdate} class="space-y-6">
				<div class="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 mb-4">
					<div
						class="w-28 h-28 rounded-2xl overflow-hidden bg-slate-300 border-4 border-white shadow-md relative shrink-0"
					>
						<UserAvatar user={profile} />
						{#if isUploading}
							<div
								class="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-semibold animate-pulse"
							>
								Uploading...
							</div>
						{/if}
					</div>

					<div class="mb-2">
						<h1 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
							{profile.displayName}
							{#if profile.title}
								<span
									class="bg-purple-100 text-purple-700 font-bold text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider"
								>
									{profile.title}
								</span>
							{/if}
						</h1>
						<p class="text-sm text-slate-400">@{profile.username}</p>
					</div>
				</div>

				<hr class="border-slate-100" />

				<div class="flex flex-col gap-1.5">
					<span class="text-xs font-bold text-slate-500 uppercase tracking-wider"
						>Change Profile Image</span
					>
					<input
						type="file"
						accept="image/*"
						onchange={handleAvatarUpload}
						disabled={isSaving || isUploading}
						class="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer disabled:opacity-50"
					/>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="flex flex-col gap-1.5">
						<label
							for="displayName"
							class="text-xs font-bold text-slate-600 uppercase tracking-wide"
							>Public Display Name</label
						>
						<input
							type="text"
							id="displayName"
							bind:value={displayName}
							required
							disabled={isSaving}
							class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 disabled:bg-slate-50"
						/>
					</div>

					<div class="flex flex-col gap-1.5">
						<label for="title" class="text-xs font-bold text-slate-600 uppercase tracking-wide"
							>Custom Title Badge</label
						>
						<input
							type="text"
							id="title"
							bind:value={title}
							placeholder="e.g. DEVELOPER, ADMIN"
							disabled={isSaving}
							class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 disabled:bg-slate-50"
						/>
					</div>
				</div>

				{#if feedbackMessage.text}
					<div
						class="text-xs p-3.5 rounded-lg font-medium transition-all
						{feedbackMessage.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : ''}
						{feedbackMessage.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : ''}
						{feedbackMessage.type === 'info' ? 'bg-blue-50 text-blue-600 border border-blue-100' : ''}"
					>
						{feedbackMessage.text}
					</div>
				{/if}

				<div class="flex justify-end pt-2">
					<button
						type="submit"
						disabled={isSaving || isUploading || !displayName.trim()}
						class="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-sm rounded-lg transition-colors shadow-sm cursor-pointer"
					>
						{isSaving ? 'Saving Adjustments...' : 'Save Changes'}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
