<script lang="ts">
	import { storageService } from '$lib/api/storage';
	import { userService } from '$lib/api/user';
	import TitleBadge from '$lib/components/common/title-badge.svelte';
	import UserBadge from '$lib/components/common/user-badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { BADGE_ANIMATIONS } from '$lib/constants/animations';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let profile = $state(data.profile);

	const DEFAULT_STYLE = {
		textColor: '#7e22ce',
		backgroundColor: '#f3e8ff',
		borderRadius: '4px',
		borderStyle: 'none',
		borderColor: 'transparent',
		textEffect: 'none',
		animationVibe: 'none'
	};

	// Single unified source of truth for the profile editing state
	let badgeForm = $state({
		displayName: profile.displayName,
		title: profile.title || '',
		...DEFAULT_STYLE,
		...profile.titleStyle
	});

	let livePreviewUser = $derived({
		displayName: badgeForm.displayName,
		title: badgeForm.title,
		titleStyle: {
			textColor: badgeForm.textColor,
			backgroundColor: badgeForm.backgroundColor,
			borderRadius: badgeForm.borderRadius,
			borderStyle: badgeForm.borderStyle,
			borderColor: badgeForm.borderColor,
			textEffect: badgeForm.textEffect,
			animationVibe: badgeForm.animationVibe
		}
	});
	let imageFailed = $state(false);
	let avatarUrl = $state(profile.avatarUrl || '');
	let selectedAvatarFile = $state<File | null>(null);

	let isSaving = $state(false);
	let isUploading = $state(false);
	let feedbackMessage = $state({ text: '', type: '' });

	async function handleAvatarUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		if (!input.files?.length) return;
		const file = input.files[0];
		selectedAvatarFile = file;
		if (avatarUrl.startsWith('blob:')) {
			URL.revokeObjectURL(avatarUrl);
		}
		avatarUrl = URL.createObjectURL(file);
		imageFailed = false;
	}

	async function uploadAvatar(file: File): Promise<string> {
		const { uploadUrl, downloadUrl } = await storageService.getPresignedUrl(file.name);
		await storageService.uploadFileToMinio(uploadUrl, file);
		return downloadUrl;
	}

	async function handleProfileUpdate(event: SubmitEvent) {
		event.preventDefault();
		isSaving = true;
		try {
			let finalAvatarUrl = profile.avatarUrl;
			if (selectedAvatarFile) {
				isUploading = true;
				finalAvatarUrl = await uploadAvatar(selectedAvatarFile);
				isUploading = false;
			}

			// Clean payload built straight out of our reactive form object values
			const updated = await userService.updateUserProfile(profile.username, {
				displayName: badgeForm.displayName,
				title: badgeForm.title,
				avatarUrl: finalAvatarUrl,
				titleStyle: {
					textColor: badgeForm.textColor,
					backgroundColor: badgeForm.backgroundColor,
					borderRadius: badgeForm.borderRadius,
					borderStyle: badgeForm.borderStyle,
					borderColor: badgeForm.borderColor,
					textEffect: badgeForm.textEffect,
					animationVibe: badgeForm.animationVibe
				}
			});

			profile = updated;
			avatarUrl = updated.avatarUrl;
			selectedAvatarFile = null;
			feedbackMessage = { text: 'Profile updated successfully!', type: 'success' };
		} catch (err: any) {
			feedbackMessage = { text: err.message, type: 'error' };
		} finally {
			isSaving = false;
			isUploading = false;
		}
	}
</script>

<div class="min-h-screen bg-slate-800 py-10 px-4">
	<div
		class="max-w-2xl mx-auto bg-slate-50 rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
	>
		<div class="h-32 bg-linear-to-r from-slate-500 to-slate-800 relative"></div>

		<div class="px-8 pb-8 relative">
			<form onsubmit={handleProfileUpdate} class="space-y-6">
				<!-- Avatar and Title Badge Area -->
				<div class="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 mb-4">
					<div class="relative size-14">
						<div class="size-14 rounded-full overflow-hidden">
							<img src={avatarUrl} alt="Profile avatar" class="w-full h-full object-cover" />
						</div>
						<label
							class="absolute -right-0.5 -bottom-0.5 flex-center rounded-full bg-white p-2 size-5 cursor-pointer"
						>
							<input type="file" accept="image/*" onchange={handleAvatarUpload} class="hidden" />
							📷
						</label>
					</div>

					<div class="mb-2">
						<div class="flex items-center gap-2">
							<h3 class="text-3xl font-bold text-white flex items-center gap-2">
								{badgeForm.displayName}
							</h3>

							<TitleBadge user={livePreviewUser} />
						</div>
						<p class="text-sm text-slate-400">@{profile.username}</p>
					</div>
				</div>

				<hr class="border-slate-100" />

				<!-- Profile Info Grid -->
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
							bind:value={badgeForm.displayName}
							required
							class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
						/>
					</div>

					<div class="flex flex-col gap-1.5">
						<label for="title" class="text-xs font-bold text-slate-600 uppercase tracking-wide"
							>Custom Title Badge</label
						>
						<input
							type="text"
							id="title"
							bind:value={badgeForm.title}
							placeholder="e.g. DEVELOPER"
							class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
						/>
					</div>
				</div>

				<!-- CUSTOM BADGE CONFIGURATION STYLING CONTROLS -->
				<div class="bg-slate-100 p-4 rounded-xl space-y-4">
					<h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider">
						Badge Customization
					</h4>

					<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div class="flex flex-col gap-1.5">
							<label class="text-[11px] font-medium text-slate-500">Text Color</label>
							<div class="flex items-center gap-2">
								<input
									type="color"
									bind:value={badgeForm.textColor}
									class="size-8 rounded cursor-pointer p-0 border-0"
								/>
								<input
									type="text"
									bind:value={badgeForm.textColor}
									class="w-full text-xs px-2 py-1.5 border border-slate-200 rounded bg-white font-mono"
								/>
							</div>
						</div>

						<div class="flex flex-col gap-1.5">
							<label class="text-[11px] font-medium text-slate-500">Background Color</label>
							<div class="flex items-center gap-2">
								<input
									type="color"
									bind:value={badgeForm.backgroundColor}
									class="size-8 rounded cursor-pointer p-0 border-0"
								/>
								<input
									type="text"
									bind:value={badgeForm.backgroundColor}
									class="w-full text-xs px-2 py-1.5 border border-slate-200 rounded bg-white font-mono"
								/>
							</div>
						</div>

						<div class="flex flex-col gap-1.5">
							<label for="radius" class="text-[11px] font-medium text-slate-500"
								>Corner Radius</label
							>
							<select
								id="radius"
								bind:value={badgeForm.borderRadius}
								class="w-full text-xs px-2 py-1.5 border border-slate-200 rounded bg-white h-[34px]"
							>
								<option value="0px">Sharp (0px)</option>
								<option value="4px">Slightly Rounded (4px)</option>
								<option value="8px">Medium Rounded (8px)</option>
								<option value="9999px">Pill (Capsule)</option>
							</select>
						</div>
					</div>

					<div
						class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-200/60"
					>
						<div class="flex flex-col gap-1.5">
							<label for="borderStyle" class="text-[11px] font-medium text-slate-500"
								>Border Type</label
							>
							<select
								id="borderStyle"
								bind:value={badgeForm.borderStyle}
								class="w-full text-xs px-2 py-1.5 border border-slate-200 rounded bg-white h-[34px]"
							>
								<option value="none">No Border</option>
								<option value="1px solid">Solid Fine</option>
								<option value="2px dashed">Dashed Retro</option>
								<option value="2px double">Double Royal</option>
							</select>
						</div>

						<div class="flex flex-col gap-1.5">
							<label class="text-[11px] font-medium text-slate-500">Border Color</label>
							<div class="flex items-center gap-2">
								<input
									type="color"
									bind:value={badgeForm.borderColor}
									disabled={badgeForm.borderStyle === 'none'}
									class="size-8 rounded cursor-pointer p-0 border-0 disabled:opacity-40"
								/>
								<input
									type="text"
									bind:value={badgeForm.borderColor}
									disabled={badgeForm.borderStyle === 'none'}
									class="w-full text-xs px-2 py-1.5 border border-slate-200 rounded bg-white font-mono disabled:bg-slate-50"
								/>
							</div>
						</div>

						<div class="flex flex-col gap-1.5">
							<label for="textEffect" class="text-[11px] font-medium text-slate-500">Text FX</label>
							<select
								id="textEffect"
								bind:value={badgeForm.textEffect}
								class="w-full text-xs px-2 py-1.5 border border-slate-200 rounded bg-white h-[34px]"
							>
								<option value="none">Flat Text</option>
								<option value="neon-glow">Neon Aura Glow</option>
								<option value="retro-glitch">3D Cyber Glitch</option>
								<option value="deep-shadow">High Contrast Shadow</option>
							</select>
						</div>

						<div class="flex flex-col gap-1.5">
							<label for="vibe" class="text-[11px] font-medium text-slate-500"
								>Badge Animation</label
							>
							<select
								id="vibe"
								bind:value={badgeForm.animationVibe}
								class="w-full text-xs px-2 py-1.5 border border-slate-200 rounded bg-white h-[34px]"
							>
								{#each BADGE_ANIMATIONS as animation (animation.value)}
									<option value={animation.value}>{animation.label}</option>
								{/each}
							</select>
						</div>
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

				{#if imageFailed}
					<div>Fail to upload avatar.</div>
				{/if}
				<div class="flex justify-between pt-2">
					<Button size="sm" variant="ghost" onclick={() => history.back()}>Go back</Button>
					<Button type="submit" disabled={isSaving || isUploading || !badgeForm.displayName.trim()}>
						{isSaving ? 'Saving Adjustments...' : 'Save Changes'}
					</Button>
				</div>
			</form>
		</div>
	</div>
</div>
