<script lang="ts">
	import { storageService } from '$lib/api/storage';
	import { userService } from '$lib/api/user';
	import TitleBadge from '$lib/components/common/title-badge.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Field from '$lib/components/ui/field/index';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select/index';
	import * as Tabs from '$lib/components/ui/tabs/index';
	import { BADGE_ANIMATIONS, BADGE_PRESETS } from '$lib/constants/animations';
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

	type BadgeMode = 'presets' | 'custom';

	const BORDER_STYLE_OPTIONS = [
		{ value: 'none', label: 'No Border' },
		{ value: '1px solid', label: 'Solid Fine' },
		{ value: '2px dashed', label: 'Dashed Retro' },
		{ value: '2px double', label: 'Double Royal' }
	];
	const TEXT_EFFECT_OPTIONS = [
		{ value: 'none', label: 'Flat Text' },
		{ value: 'neon-glow', label: 'Neon Aura Glow' },
		{ value: 'retro-glitch', label: '3D Cyber Glitch' },
		{ value: 'deep-shadow', label: 'High Contrast Shadow' }
	];

	// Single unified source of truth for the profile editing state
	const initialBadgeForm = {
		displayName: profile.displayName,
		title: profile.title || '',
		...DEFAULT_STYLE,
		...profile.titleStyle
	};
	let customBadgeForm = $state({ ...initialBadgeForm });
	let presetBadgeForm = $state({ ...initialBadgeForm });
	let badgeMode = $state<BadgeMode>('presets');
	let badgeForm = $derived(badgeMode === 'presets' ? presetBadgeForm : customBadgeForm);

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
	let isBackgroundControlled = $derived(true);

	function applyBadgePreset(preset: (typeof BADGE_PRESETS)[number]) {
		Object.assign(presetBadgeForm, {
			displayName: badgeForm.displayName,
			title: badgeForm.title,
			...preset.style
		});
		badgeMode = 'presets';
	}

	function useCustomMode() {
		customBadgeForm.displayName = badgeForm.displayName;
		customBadgeForm.animationVibe = 'none';
		badgeMode = 'custom';
	}

	function isPresetSelected(preset: (typeof BADGE_PRESETS)[number]) {
		return badgeMode === 'presets' && badgeForm.animationVibe === preset.style.animationVibe;
	}

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

	function handleTabChange(value: string) {
		const newMode = value as BadgeMode;
		if (newMode === 'presets') {
			presetBadgeForm.displayName = badgeForm.displayName;
		} else if (newMode === 'custom') {
			customBadgeForm.displayName = badgeForm.displayName;
			customBadgeForm.animationVibe = 'none';
		}
		badgeMode = newMode;
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
								<Input id="displayName" bind:value={badgeForm.displayName} required />
							</Field.Field>

							<Field.Field>
								<Field.Label for="title">Custom Title Badge</Field.Label>
								<Input id="title" bind:value={badgeForm.title} placeholder="e.g. DEVELOPER" />
							</Field.Field>
						</div>
					</Field.Group>

					<!-- Badge design controls -->
					<div class="rounded-xl border border-slate-100/10 bg-white/5 p-4 space-y-4">
						<Tabs.Root value={badgeMode} onValueChange={handleTabChange} class="w-full space-y-4">
							<div class="flex gap-3 items-center justify-between">
								<h4 class="text-xs font-bold uppercase tracking-wider">Badge Design</h4>
								<Tabs.List>
									<Tabs.Trigger value="presets">Presets</Tabs.Trigger>
									<Tabs.Trigger value="custom">Custom</Tabs.Trigger>
								</Tabs.List>
							</div>

							<Tabs.Content value="presets" class="space-y-3 mt-0 focus-visible:outline-none">
								<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
									{#each BADGE_PRESETS as preset (preset.id)}
										<Button
											type="button"
											class="flex min-h-20 flex-col items-start justify-between gap-3 rounded-lg border p-3 text-left  {isPresetSelected(
												preset
											)
												? 'border-white bg-primary/15 shadow-sm'
												: 'border-slate-100/10 bg-slate-900/20 hover:border-slate-300/60 hover:bg-white/10'}"
											onclick={() => applyBadgePreset(preset)}
										>
											<span class="text-[11px] font-bold uppercase tracking-wide text-slate-300">
												{preset.name}
											</span>
											<TitleBadge
												user={{
													displayName: badgeForm.displayName,
													title: preset.title,
													titleStyle: preset.style
												}}
											/>
										</Button>
									{/each}
								</div>
								<div class="flex justify-end">
									<Button
										type="button"
										size="sm"
										variant="ghost"
										class="text-slate-200 hover:text-slate-950"
										onclick={useCustomMode}
									>
										Customize selected style
									</Button>
								</div>
							</Tabs.Content>
							<Tabs.Content value="custom" class="space-y-4 mt-0 focus-visible:outline-none">
								<Field.Group class="grid grid-cols-1 sm:grid-cols-3 gap-4">
									<Field.Field>
										<Field.Label for="textColor" class="text-slate-200">Text Color</Field.Label>
										<div class="flex items-center gap-2">
											<Input
												id="textColor"
												type="color"
												bind:value={badgeForm.textColor}
												class="size-8 p-0 bg-transparent"
											/>
											<Input bind:value={badgeForm.textColor} />
										</div>
									</Field.Field>

									<Field.Field>
										<Field.Label for="backgroundColor">Background Color</Field.Label>
										<div class="flex items-center gap-2">
											<Input
												id="backgroundColor"
												type="color"
												bind:value={badgeForm.backgroundColor}
												disabled={isBackgroundControlled}
												class="size-8 p-0  bg-transparent"
											/>
											<Input
												bind:value={badgeForm.backgroundColor}
												disabled={isBackgroundControlled}
												placeholder={isBackgroundControlled ? 'Controlled by animation' : '#f3e8ff'}
											/>
										</div>
										{#if isBackgroundControlled}
											<p class="text-[10px] font-medium text-red-300">
												This animation uses its own background.
											</p>
										{/if}
									</Field.Field>

									<Field.Field>
										<Field.Label for="radius" class="text-slate-200">Corner Radius</Field.Label>
										<Select.Root type="single" bind:value={badgeForm.borderRadius}>
											<Select.Trigger id="radius" class="w-full">
												<span>{badgeForm.borderRadius || 'Select Corner Radius'}</span>
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
									class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-100/10"
								>
									<Field.Field>
										<Field.Label for="borderStyle">Border Type</Field.Label>
										<Select.Root type="single" bind:value={badgeForm.borderStyle}>
											<Select.Trigger id="borderStyle">
												{badgeForm.borderStyle}
											</Select.Trigger>
											<Select.Content>
												{#each BORDER_STYLE_OPTIONS as option (option.value)}
													<Select.Item value={option.value}>{option.label}</Select.Item>
												{/each}
											</Select.Content>
										</Select.Root>
									</Field.Field>

									<Field.Field>
										<Field.Label for="borderColor">Border Color</Field.Label>
										<div class="flex items-center gap-2">
											<Input
												id="borderColor"
												type="color"
												bind:value={badgeForm.borderColor}
												disabled={badgeForm.borderStyle === 'none'}
												class="size-8 p-0 bg-transparent"
											/>
											<Input
												bind:value={badgeForm.borderColor}
												disabled={badgeForm.borderStyle === 'none'}
											/>
										</div>
									</Field.Field>

									<Field.Field>
										<Field.Label for="textEffect">Text FX</Field.Label>
										<Select.Root type="single" bind:value={badgeForm.textEffect}>
											<Select.Trigger id="textEffect" class="w-full ">
												{badgeForm.textEffect}
											</Select.Trigger>
											<Select.Content>
												{#each TEXT_EFFECT_OPTIONS as option (option.value)}
													<Select.Item value={option.value}>{option.label}</Select.Item>
												{/each}
											</Select.Content>
										</Select.Root>
									</Field.Field>

									<Field.Field>
										<Field.Label for="vibe">Badge Animation</Field.Label>
										<Select.Root type="single" bind:value={badgeForm.animationVibe}>
											<Select.Trigger id="vibe" class="w-full ">
												{badgeForm.animationVibe}
											</Select.Trigger>
											<Select.Content>
												{#each BADGE_ANIMATIONS as animation (animation.value)}
													<Select.Item value={animation.value}>{animation.label}</Select.Item>
												{/each}
											</Select.Content>
										</Select.Root>
									</Field.Field>
								</Field.Group>
							</Tabs.Content>
						</Tabs.Root>
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
