<script lang="ts">
	import { storageService } from '$lib/api/storage';
	import { userService } from '$lib/api/user';
	import TitleBadge from '$lib/components/common/title-badge.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Field from '$lib/components/ui/field/index.js';
	import { BADGE_ANIMATIONS } from '$lib/constants/animations';
	import type { PageData } from './$types';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select/index';

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
	<div class="max-w-2xl mx-auto rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
		<div class="h-32 bg-linear-to-r from-slate-500 to-slate-800 relative"></div>

		<div class="px-8 pb-8 relative">
			<form onsubmit={handleProfileUpdate} class="space-y-6">
				<Field.Set>
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
					<Field.Group>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Field.Field>
								<Field.Label for="displayName">Public Display Name</Field.Label>
								<Input
									id="displayName"
									bind:value={badgeForm.displayName}
									required
									placeholder="Enter your display name"
								/>
							</Field.Field>

							<Field.Field>
								<Field.Label for="title">Custom Title Badge</Field.Label>
								<Input id="title" bind:value={badgeForm.title} placeholder="e.g. DEVELOPER" />
							</Field.Field>
						</div>
					</Field.Group>
					<!-- CUSTOM BADGE CONFIGURATION STYLING CONTROLS -->
					<div class=" p-4 rounded-xl space-y-4 border border-secondary bg-slate-50/5">
						<h4 class="text-xs font-bold uppercase tracking-wider">Badge Customization</h4>
						<Field.Group class="grid grid-cols-1 sm:grid-cols-3 gap-4">
							<Field.Field>
								<Field.Label for="title">Text Color</Field.Label>
								<div class="flex items-center gap-2">
									<Input
										class="size-8 p-0 border-0 bg-transparent"
										id="textColor"
										type="color"
										bind:value={badgeForm.textColor}
									/>
									<Input
										id="textColor"
										bind:value={badgeForm.textColor}
										placeholder="e.g. #FFFFFF"
									/>
								</div>
							</Field.Field>
							<Field.Field>
								<Field.Label for="title">Background Color</Field.Label>
								<div class="flex items-center gap-2">
									<Input
										class="size-8 p-0 border-0 bg-transparent"
										id="backgroundColor"
										type="color"
										bind:value={badgeForm.backgroundColor}
									/>
									<Input
										id="backgroundColor"
										bind:value={badgeForm.backgroundColor}
										placeholder="e.g. #FFFFFF"
									/>
								</div>
							</Field.Field>
							<Field.Field>
								<Field.Label for="title">Corner Radius</Field.Label>
								<Select.Root type="single" bind:value={badgeForm.borderRadius}>
									<Select.Trigger id="checkout-7j9-exp-month-ts6">
										<span>
											{badgeForm.borderRadius || 'Select Corner Radius'}
										</span>
									</Select.Trigger>
									<Select.Content>
										<Select.Item value="0px">Sharp (0px)</Select.Item>
										<Select.Item value="4px">Slightly Rounded (4px)</Select.Item>
										<Select.Item value="8px">Medium Rounded (8px)</Select.Item>
										<Select.Item value="9999px">Pill (Capsule)</Select.Item>
									</Select.Content>
								</Select.Root>
							</Field.Field>
						</Field.Group>

						<Field.Group
							class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-200/60"
						>
							<Field.Field>
								<Field.Label for="borderStyle">Border Type</Field.Label>
								<Select.Root type="single" bind:value={badgeForm.borderStyle}>
									<Select.Trigger id="borderStyle">
										<span>{badgeForm.borderStyle || 'Select Border Type'}</span>
									</Select.Trigger>
									<Select.Content>
										<Select.Item value="none">No Border</Select.Item>
										<Select.Item value="1px solid">Solid Fine</Select.Item>
										<Select.Item value="2px dashed">Dashed Retro</Select.Item>
										<Select.Item value="2px double">Double Royal</Select.Item>
									</Select.Content>
								</Select.Root>
							</Field.Field>
							<Field.Field>
								<Field.Label for="textEffect">Text FX</Field.Label>
								<Select.Root type="single" bind:value={badgeForm.textEffect}>
									<Select.Trigger id="textEffect">
										<span>{badgeForm.textEffect || 'Select Text FX'}</span>
									</Select.Trigger>
									<Select.Content>
										<Select.Item value="none">Flat Text</Select.Item>
										<Select.Item value="neon-glow">Neon Aura Glow</Select.Item>
										<Select.Item value="retro-glitch">3D Cyber Glitch</Select.Item>
										<Select.Item value="deep-shadow">High Contrast Shadow</Select.Item>
									</Select.Content>
								</Select.Root>
							</Field.Field>
							<Field.Field>
								<Field.Label for="vibe">Badge Animation</Field.Label>
								<Select.Root type="single" bind:value={badgeForm.animationVibe}>
									<Select.Trigger id="vibe">
										<span>{badgeForm.animationVibe || 'Select Badge Animation'}</span>
									</Select.Trigger>
									<Select.Content>
										{#each BADGE_ANIMATIONS as animation (animation.value)}
											<Select.Item value={animation.value}>{animation.label}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							</Field.Field>
						</Field.Group>
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
						<Button size="sm" variant="outline" onclick={() => history.back()}>Go back</Button>
						<Button
							type="submit"
							disabled={isSaving || isUploading || !badgeForm.displayName.trim()}
						>
							{isSaving ? 'Saving Adjustments...' : 'Save Changes'}
						</Button>
					</div>
				</Field.Set>
			</form>
		</div>
	</div>
</div>
