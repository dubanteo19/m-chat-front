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

	type BadgeStyle = typeof DEFAULT_STYLE;
	type BadgeMode = 'presets' | 'custom';

	const BACKGROUND_CONTROLLED_ANIMATIONS = new Set([
		'aurora',
		'holo',
		'f1-racing',
		'vung-tau-breeze',
		'pleiku-rain',
		'ruby-crown',
		'obsidian'
	]);

	const BADGE_PRESETS: Array<{ id: string; name: string; title: string; style: BadgeStyle }> = [
		{
			id: 'f1-racing',
			name: 'F1 Racing',
			title: 'POLE POSITION',
			style: {
				textColor: '#ffffff',
				backgroundColor: '#dc2626',
				borderRadius: '4px',
				borderStyle: '1px solid',
				borderColor: '#f8fafc',
				textEffect: 'deep-shadow',
				animationVibe: 'f1-racing'
			}
		},
		{
			id: 'vung-tau-breeze',
			name: 'Vung Tau Breeze',
			title: 'VUNG TAU',
			style: {
				textColor: '#ffffff',
				backgroundColor: '#38bdf8',
				borderRadius: '9999px',
				borderStyle: '1px solid',
				borderColor: '#fff7ad',
				textEffect: 'deep-shadow',
				animationVibe: 'vung-tau-breeze'
			}
		},
		{
			id: 'royal-gold',
			name: 'Royal Gold',
			title: 'ROYAL',
			style: {
				textColor: '#fef3c7',
				backgroundColor: '#4c1d95',
				borderRadius: '9999px',
				borderStyle: '2px double',
				borderColor: '#facc15',
				textEffect: 'deep-shadow',
				animationVibe: 'legendary'
			}
		},
		{
			id: 'pleiku-rain',
			name: 'Pleiku Sleepwell',
			title: 'PLEIKU',
			style: {
				textColor: '#e0e7ff',
				backgroundColor: '#1e1b4b',
				borderRadius: '9999px',
				borderStyle: '1px solid',
				borderColor: '#c4b5fd',
				textEffect: 'deep-shadow',
				animationVibe: 'pleiku-rain'
			}
		},
		{
			id: 'cyber-neon',
			name: 'Cyber Neon',
			title: 'CYBER',
			style: {
				textColor: '#67e8f9',
				backgroundColor: '#111827',
				borderRadius: '4px',
				borderStyle: '1px solid',
				borderColor: '#f472b6',
				textEffect: 'retro-glitch',
				animationVibe: 'flicker'
			}
		},
		{
			id: 'aurora-mythic',
			name: 'Aurora Mythic',
			title: 'MYTHIC',
			style: {
				textColor: '#0f172a',
				backgroundColor: '#e0f2fe',
				borderRadius: '8px',
				borderStyle: '1px solid',
				borderColor: '#ffffff',
				textEffect: 'none',
				animationVibe: 'aurora'
			}
		},
		{
			id: 'holographic',
			name: 'Holographic',
			title: 'HOLO',
			style: {
				textColor: '#ffffff',
				backgroundColor: '#60a5fa',
				borderRadius: '9999px',
				borderStyle: '1px solid',
				borderColor: '#a5f3fc',
				textEffect: 'neon-glow',
				animationVibe: 'holo'
			}
		},
		{
			id: 'ruby-crown',
			name: 'Ruby Crown',
			title: 'RUBY CROWN',
			style: {
				textColor: '#fff7ed',
				backgroundColor: '#7f1d1d',
				borderRadius: '9999px',
				borderStyle: '1px solid',
				borderColor: '#fbbf24',
				textEffect: 'deep-shadow',
				animationVibe: 'ruby-crown'
			}
		},
		{
			id: 'obsidian',
			name: 'Obsidian',
			title: 'OBSIDIAN',
			style: {
				textColor: '#fde68a',
				backgroundColor: '#111827',
				borderRadius: '9999px',
				borderStyle: '1px solid',
				borderColor: '#f59e0b',
				textEffect: 'neon-glow',
				animationVibe: 'obsidian'
			}
		}
	];

	const PRESET_ANIMATION_VALUES = new Set(
		BADGE_PRESETS.map((preset) => preset.style.animationVibe).filter((value) => value !== 'none')
	);
	const CUSTOM_BADGE_ANIMATIONS = BADGE_ANIMATIONS.filter(
		(animation) => !PRESET_ANIMATION_VALUES.has(animation.value)
	);
	const ANIMATION_LABEL_BY_VALUE = new Map(
		BADGE_ANIMATIONS.map((animation) => [animation.value, animation.label])
	);
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
	const BORDER_STYLE_LABEL_BY_VALUE = new Map(
		BORDER_STYLE_OPTIONS.map((option) => [option.value, option.label])
	);
	const TEXT_EFFECT_LABEL_BY_VALUE = new Map(
		TEXT_EFFECT_OPTIONS.map((option) => [option.value, option.label])
	);

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
	let isBackgroundControlled = $derived(
		BACKGROUND_CONTROLLED_ANIMATIONS.has(badgeForm.animationVibe || 'none')
	);

	function applyBadgePreset(preset: (typeof BADGE_PRESETS)[number]) {
		Object.assign(presetBadgeForm, {
			displayName: badgeForm.displayName,
			title: badgeForm.title,
			...preset.style
		});
		badgeMode = 'presets';
	}

	function usePresetMode() {
		presetBadgeForm.displayName = badgeForm.displayName;
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

	function getAnimationLabel(value: string) {
		return ANIMATION_LABEL_BY_VALUE.get(value) || 'Select Badge Animation';
	}

	function getBorderStyleLabel(value: string) {
		return BORDER_STYLE_LABEL_BY_VALUE.get(value) || 'Select Border Type';
	}

	function getTextEffectLabel(value: string) {
		return TEXT_EFFECT_LABEL_BY_VALUE.get(value) || 'Select Text FX';
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
						<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<h4 class="text-xs font-bold text-slate-200 uppercase tracking-wider">
								Badge Design
							</h4>
							<div class="inline-flex rounded-lg border border-slate-100/10 bg-slate-900/40 p-0.5">
								<button
									type="button"
									class="px-3 py-1.5 text-xs font-semibold rounded-md transition-colors {badgeMode ===
									'presets'
										? 'bg-white text-slate-900'
										: 'text-slate-300 hover:text-white'}"
									onclick={usePresetMode}
								>
									Presets
								</button>
								<button
									type="button"
									class="px-3 py-1.5 text-xs font-semibold rounded-md transition-colors {badgeMode ===
									'custom'
										? 'bg-white text-slate-900'
										: 'text-slate-300 hover:text-white'}"
									onclick={useCustomMode}
								>
									Custom
								</button>
							</div>
						</div>

						{#if badgeMode === 'presets'}
							<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
								{#each BADGE_PRESETS as preset (preset.id)}
									<button
										type="button"
										class="flex min-h-20 flex-col items-start justify-between gap-3 rounded-lg border p-3 text-left transition {isPresetSelected(
											preset
										)
											? 'border-white bg-white/15 shadow-sm'
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
									</button>
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
						{:else}
							<Field.Group class="grid grid-cols-1 sm:grid-cols-3 gap-4">
								<Field.Field>
									<Field.Label for="textColor" class="text-slate-200">Text Color</Field.Label>
									<div class="flex items-center gap-2">
										<Input
											id="textColor"
											type="color"
											bind:value={badgeForm.textColor}
											class="size-8 p-0 border border-slate-100/10 bg-transparent"
										/>
										<Input
											bind:value={badgeForm.textColor}
											class="bg-slate-900/40 text-slate-100"
										/>
									</div>
								</Field.Field>

								<Field.Field>
									<Field.Label for="backgroundColor" class="text-slate-200">
										Background Color
									</Field.Label>
									<div class="flex items-center gap-2">
										<Input
											id="backgroundColor"
											type="color"
											bind:value={badgeForm.backgroundColor}
											disabled={isBackgroundControlled}
											class="size-8 p-0 border border-slate-100/10 bg-transparent"
										/>
										<Input
											bind:value={badgeForm.backgroundColor}
											disabled={isBackgroundControlled}
											placeholder={isBackgroundControlled ? 'Controlled by animation' : '#f3e8ff'}
											class="bg-slate-900/40 text-slate-100"
										/>
									</div>
									{#if isBackgroundControlled}
										<p class="text-[10px] font-medium text-slate-300">
											This animation uses its own background.
										</p>
									{/if}
								</Field.Field>

								<Field.Field>
									<Field.Label for="radius" class="text-slate-200">Corner Radius</Field.Label>
									<Select.Root type="single" bind:value={badgeForm.borderRadius}>
										<Select.Trigger id="radius" class="w-full bg-slate-900/40 text-slate-100">
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
									<Field.Label for="borderStyle" class="text-slate-200">Border Type</Field.Label>
									<Select.Root type="single" bind:value={badgeForm.borderStyle}>
										<Select.Trigger id="borderStyle" class="w-full bg-slate-900/40 text-slate-100">
											<span>{getBorderStyleLabel(badgeForm.borderStyle)}</span>
										</Select.Trigger>
										<Select.Content>
											{#each BORDER_STYLE_OPTIONS as option (option.value)}
												<Select.Item value={option.value}>{option.label}</Select.Item>
											{/each}
										</Select.Content>
									</Select.Root>
								</Field.Field>

								<Field.Field>
									<Field.Label for="borderColor" class="text-slate-200">Border Color</Field.Label>
									<div class="flex items-center gap-2">
										<Input
											id="borderColor"
											type="color"
											bind:value={badgeForm.borderColor}
											disabled={badgeForm.borderStyle === 'none'}
											class="size-8 p-0 border border-slate-100/10 bg-transparent"
										/>
										<Input
											bind:value={badgeForm.borderColor}
											disabled={badgeForm.borderStyle === 'none'}
											class="bg-slate-900/40 text-slate-100"
										/>
									</div>
								</Field.Field>

								<Field.Field>
									<Field.Label for="textEffect" class="text-slate-200">Text FX</Field.Label>
									<Select.Root type="single" bind:value={badgeForm.textEffect}>
										<Select.Trigger id="textEffect" class="w-full bg-slate-900/40 text-slate-100">
											<span>{getTextEffectLabel(badgeForm.textEffect)}</span>
										</Select.Trigger>
										<Select.Content>
											{#each TEXT_EFFECT_OPTIONS as option (option.value)}
												<Select.Item value={option.value}>{option.label}</Select.Item>
											{/each}
										</Select.Content>
									</Select.Root>
								</Field.Field>

								<Field.Field>
									<Field.Label for="vibe" class="text-slate-200">Badge Animation</Field.Label>
									<Select.Root type="single" bind:value={badgeForm.animationVibe}>
										<Select.Trigger id="vibe" class="w-full bg-slate-900/40 text-slate-100">
											<span>{getAnimationLabel(badgeForm.animationVibe)}</span>
										</Select.Trigger>
										<Select.Content>
											{#each CUSTOM_BADGE_ANIMATIONS as animation (animation.value)}
												<Select.Item value={animation.value}>{animation.label}</Select.Item>
											{/each}
										</Select.Content>
									</Select.Root>
								</Field.Field>
							</Field.Group>
						{/if}
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
