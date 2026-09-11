<script lang="ts">
	import { storageService } from '$lib/api/storage';
	import { userService } from '$lib/api/user';
	import TitleBadge from '$lib/components/common/title-badge.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Field from '$lib/components/ui/field/index';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select/index';
	import * as Tabs from '$lib/components/ui/tabs/index';
	import {
		BACKGROUND_CONTROLLED_ANIMATIONS,
		BADGE_ANIMATIONS,
		BADGE_PRESETS
	} from '$lib/constants/animations';
	import { useUser } from '$lib/stores/auth.svelte';
	import type { PageData } from './$types';
	import { Camera, LoaderCircle } from '@lucide/svelte';

	let { data }: { data: PageData } = $props();

	const { currentUser } = $derived(useUser());
	let profile = $state(data.profile);
	const isOwner = $derived(currentUser.username === profile.username);

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
	const avatarInitials = $derived(
		badgeForm.displayName
			.trim()
			.split(/\s+/)
			.slice(0, 2)
			.map((part) => part[0])
			.join('')
			.toUpperCase() || '?'
	);
	let imageFailed = $state(false);
	let avatarUrl = $state(profile.avatarUrl || '');
	let selectedAvatarFile = $state<File | null>(null);

	let isSaving = $state(false);
	let isUploading = $state(false);
	let feedbackMessage = $state({ text: '', type: '' });
	let isBackgroundControlled = $derived(
		BACKGROUND_CONTROLLED_ANIMATIONS.has(badgeForm.animationVibe)
	);

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
		feedbackMessage = { text: '', type: '' };
		if (!file.type.startsWith('image/')) {
			feedbackMessage = { text: 'Please choose an image file.', type: 'error' };
			input.value = '';
			return;
		}
		if (file.size > 5 * 1024 * 1024) {
			feedbackMessage = { text: 'Avatar must be smaller than 5 MB.', type: 'error' };
			input.value = '';
			return;
		}
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
			const updated = await userService.updateUserProfile({
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
			avatarUrl = updated.avatarUrl ?? '';
			selectedAvatarFile = null;
			feedbackMessage = { text: 'Profile updated successfully!', type: 'success' };
		} catch (error: unknown) {
			feedbackMessage = {
				text: error instanceof Error ? error.message : 'Could not update your profile.',
				type: 'error'
			};
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

<div class="min-h-screen bg-slate-800 px-4 py-6 text-slate-50 sm:py-10">
	<div class="mx-auto max-w-4xl">
		<Button
			type="button"
			variant="ghost"
			size="sm"
			class="mb-4 text-slate-200 hover:text-slate-950"
			onclick={() => history.back()}>← Back</Button
		>
		<section
			class="overflow-hidden rounded-3xl border border-slate-100/10 bg-slate-900/70 shadow-xl shadow-slate-950/20"
		>
			<div class="h-32 bg-linear-to-r from-slate-500 to-slate-800 sm:h-44"></div>
			<header
				class="relative flex flex-col gap-4 px-5 pb-6 sm:flex-row sm:items-end sm:px-8 sm:pb-8"
			>
				<div
					class="-mt-11 size-22 shrink-0 overflow-hidden rounded-full border-4 border-slate-900 bg-slate-600 shadow-lg sm:-mt-13 sm:size-26"
				>
					{#if avatarUrl && !imageFailed}
						<img
							src={avatarUrl}
							alt="Profile avatar"
							class="h-full w-full object-cover"
							onerror={() => (imageFailed = true)}
						/>
					{:else}
						<div
							class="flex h-full w-full items-center justify-center bg-slate-500 text-xl font-bold sm:text-2xl"
						>
							{avatarInitials}
						</div>
					{/if}
				</div>
				<div class="min-w-0 flex-1 sm:pb-1">
					<div class="flex flex-wrap items-center gap-x-3 gap-y-2">
						<h1 class="break-words text-2xl font-bold sm:text-3xl">
							{badgeForm.displayName || 'Unnamed user'}
						</h1>
						<TitleBadge user={livePreviewUser} />
					</div>
					<p class="mt-1 text-sm text-slate-400">@{profile.username}</p>
				</div>
			</header>

			{#if isOwner}
				<form onsubmit={handleProfileUpdate}>
					<div class="space-y-5 border-t border-slate-100/10 px-5 py-6 sm:px-8">
						<div>
							<p class="text-xs font-bold tracking-wider text-slate-400 uppercase">Edit profile</p>
							<h2 class="mt-1 text-xl font-semibold">Profile settings</h2>
							<p class="mt-1 text-sm text-slate-400">
								Changes appear instantly in your profile header.
							</p>
						</div>

						<section class="rounded-2xl border border-slate-100/10 bg-white/5 p-4 sm:p-5">
							<div class="mb-5 flex items-start justify-between gap-4">
								<div>
									<h3 class="font-semibold">Basic information</h3>
									<p class="mt-1 text-xs text-slate-400">Visible to everyone in your rooms.</p>
								</div>
								<span class="rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-400"
									>Public</span
								>
							</div>
							<div class="flex flex-wrap items-center gap-4">
								<div
									class="size-16 shrink-0 overflow-hidden rounded-full border-2 border-slate-500/50 bg-slate-600"
								>
									{#if avatarUrl && !imageFailed}<img
											src={avatarUrl}
											alt=""
											class="h-full w-full object-cover"
											onerror={() => (imageFailed = true)}
										/>{:else}<div class="flex h-full w-full items-center justify-center font-bold">
											{avatarInitials}
										</div>{/if}
								</div>
								<div>
									<label
										class="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-slate-500 px-4 text-sm font-medium hover:bg-white/10 focus-within:ring-2 focus-within:ring-white/60"
									>
										<Camera size={16} /> Change avatar
										<input
											type="file"
											accept="image/png,image/jpeg,image/webp"
											onchange={handleAvatarUpload}
											class="sr-only"
										/>
									</label>
									<p class="mt-2 text-xs text-slate-400">JPG, PNG or WebP · Max 5 MB</p>
								</div>
							</div>
							<Field.Group class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
								<Field.Field
									><Field.Label for="displayName">Display name</Field.Label><Input
										id="displayName"
										bind:value={badgeForm.displayName}
										maxlength={50}
										autocomplete="name"
										required
									/></Field.Field
								>
								<Field.Field
									><Field.Label for="title">Custom title</Field.Label><Input
										id="title"
										bind:value={badgeForm.title}
										maxlength={30}
										placeholder="e.g. DEVELOPER"
									/></Field.Field
								>
							</Field.Group>
						</section>

						<section class="rounded-2xl border border-slate-100/10 bg-white/5 p-4 sm:p-5">
							<Tabs.Root value={badgeMode} onValueChange={handleTabChange} class="w-full space-y-5">
								<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
									<div>
										<h3 class="font-semibold">Badge appearance</h3>
										<p class="mt-1 text-xs text-slate-400">
											Choose a preset or create your own style.
										</p>
									</div>
									<Tabs.List
										><Tabs.Trigger value="presets">Presets</Tabs.Trigger><Tabs.Trigger
											value="custom">Custom</Tabs.Trigger
										></Tabs.List
									>
								</div>
								<Tabs.Content value="presets" class="mt-0 space-y-4 focus-visible:outline-none">
									<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
										{#each BADGE_PRESETS as preset (preset.id)}
											<Button
												type="button"
												class="flex min-h-20 min-w-0 items-center justify-between gap-3 rounded-2xl border p-3 text-left {isPresetSelected(
													preset
												)
													? 'border-violet-400 bg-violet-500/15'
													: 'border-slate-100/10 bg-slate-900/20 hover:border-slate-300/50 hover:bg-white/10'}"
												aria-pressed={isPresetSelected(preset)}
												onclick={() => applyBadgePreset(preset)}
											>
												<span class="min-w-0 space-y-2"
													><span
														class="block truncate text-[11px] font-bold tracking-wide text-slate-300 uppercase"
														>{preset.name}</span
													><TitleBadge
														user={{
															displayName: badgeForm.displayName,
															title: preset.title,
															titleStyle: preset.style
														}}
													/></span
												>
												{#if isPresetSelected(preset)}<span
														class="shrink-0 text-violet-300"
														aria-hidden="true">✓</span
													>{/if}
											</Button>
										{/each}
									</div>
									<div class="flex justify-end">
										<Button
											type="button"
											size="sm"
											variant="ghost"
											class="text-slate-200 hover:text-slate-950"
											onclick={useCustomMode}>Customize selected style</Button
										>
									</div>
								</Tabs.Content>
								<Tabs.Content value="custom" class="mt-0 focus-visible:outline-none">
									<Field.Group class="grid grid-cols-1 gap-4 sm:grid-cols-2">
										<Field.Field
											><Field.Label for="textColor">Text color</Field.Label>
											<div class="flex gap-2">
												<Input
													id="textColor"
													type="color"
													bind:value={badgeForm.textColor}
													class="size-9 shrink-0 cursor-pointer bg-transparent p-0"
												/><Input
													bind:value={badgeForm.textColor}
													aria-label="Text color hex value"
												/>
											</div></Field.Field
										>
										<Field.Field
											><Field.Label for="backgroundColor">Background color</Field.Label>
											<div class="flex gap-2">
												<Input
													id="backgroundColor"
													type="color"
													bind:value={badgeForm.backgroundColor}
													disabled={isBackgroundControlled}
													class="size-9 shrink-0 cursor-pointer bg-transparent p-0"
												/><Input
													bind:value={badgeForm.backgroundColor}
													disabled={isBackgroundControlled}
													aria-label="Background color hex value"
												/>
											</div>
											{#if isBackgroundControlled}<p class="text-xs text-amber-200">
													This animation controls its background color.
												</p>{/if}</Field.Field
										>
										<Field.Field
											><Field.Label for="radius">Corner radius</Field.Label><Select.Root
												type="single"
												bind:value={badgeForm.borderRadius}
												><Select.Trigger id="radius" class="w-full"
													>{badgeForm.borderRadius || 'Select a radius'}</Select.Trigger
												><Select.Content
													><Select.Item value="0px">Sharp</Select.Item><Select.Item value="4px"
														>Slightly rounded</Select.Item
													><Select.Item value="8px">Rounded</Select.Item><Select.Item value="9999px"
														>Pill</Select.Item
													></Select.Content
												></Select.Root
											></Field.Field
										>
										<Field.Field
											><Field.Label for="borderStyle">Border type</Field.Label><Select.Root
												type="single"
												bind:value={badgeForm.borderStyle}
												><Select.Trigger id="borderStyle" class="w-full"
													>{BORDER_STYLE_OPTIONS.find(
														(option) => option.value === badgeForm.borderStyle
													)?.label ?? 'Choose a border'}</Select.Trigger
												><Select.Content
													>{#each BORDER_STYLE_OPTIONS as option (option.value)}<Select.Item
															value={option.value}>{option.label}</Select.Item
														>{/each}</Select.Content
												></Select.Root
											></Field.Field
										>
										<Field.Field
											><Field.Label for="borderColor">Border color</Field.Label>
											<div class="flex gap-2">
												<Input
													id="borderColor"
													type="color"
													bind:value={badgeForm.borderColor}
													disabled={badgeForm.borderStyle === 'none'}
													class="size-9 shrink-0 cursor-pointer bg-transparent p-0"
												/><Input
													bind:value={badgeForm.borderColor}
													disabled={badgeForm.borderStyle === 'none'}
													aria-label="Border color hex value"
												/>
											</div></Field.Field
										>
										<Field.Field
											><Field.Label for="textEffect">Text effect</Field.Label><Select.Root
												type="single"
												bind:value={badgeForm.textEffect}
												><Select.Trigger id="textEffect" class="w-full"
													>{TEXT_EFFECT_OPTIONS.find(
														(option) => option.value === badgeForm.textEffect
													)?.label ?? 'Choose a text effect'}</Select.Trigger
												><Select.Content
													>{#each TEXT_EFFECT_OPTIONS as option (option.value)}<Select.Item
															value={option.value}>{option.label}</Select.Item
														>{/each}</Select.Content
												></Select.Root
											></Field.Field
										>
										<Field.Field
											><Field.Label for="vibe">Badge animation</Field.Label><Select.Root
												type="single"
												bind:value={badgeForm.animationVibe}
												><Select.Trigger id="vibe" class="w-full"
													>{BADGE_ANIMATIONS.find(
														(animation) => animation.value === badgeForm.animationVibe
													)?.label ?? 'Choose an animation'}</Select.Trigger
												><Select.Content
													>{#each BADGE_ANIMATIONS as animation (animation.value)}<Select.Item
															value={animation.value}>{animation.label}</Select.Item
														>{/each}</Select.Content
												></Select.Root
											></Field.Field
										>
									</Field.Group>
								</Tabs.Content>
							</Tabs.Root>
						</section>
						{#if feedbackMessage.text}<div
								role={feedbackMessage.type === 'error' ? 'alert' : 'status'}
								class="rounded-xl border p-3.5 text-sm font-medium {feedbackMessage.type === 'error'
									? 'border-red-400/30 bg-red-500/10 text-red-200'
									: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'}"
							>
								{feedbackMessage.text}
							</div>{/if}
					</div>
					<footer
						class="sticky bottom-0 z-20 flex justify-end gap-3 border-t border-slate-100/10 bg-slate-900/95 px-5 py-4 backdrop-blur sm:px-8"
					>
						<Button
							type="button"
							variant="outline"
							disabled={isSaving}
							onclick={() => history.back()}>Cancel</Button
						>
						<Button
							type="submit"
							disabled={isSaving || isUploading || !badgeForm.displayName.trim()}
							>{#if isSaving}<LoaderCircle class="animate-spin" />{/if}{isUploading
								? 'Uploading avatar…'
								: isSaving
									? 'Saving…'
									: 'Save changes'}</Button
						>
					</footer>
				</form>
			{:else}
				<div class="border-t border-slate-100/10 px-5 py-8 sm:px-8">
					<p class="text-sm text-slate-400">This is @{profile.username}'s public profile.</p>
				</div>
			{/if}
		</section>
	</div>
</div>
