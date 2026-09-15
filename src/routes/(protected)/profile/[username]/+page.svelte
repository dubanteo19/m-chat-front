<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import { onDestroy, untrack } from 'svelte';
	import AvatarCropDialog from '$lib/components/common/avatar-crop-dialog.svelte';
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
		FRAMED_BADGE_STYLES,
		BADGE_ANIMATIONS,
		BADGE_PRESETS
	} from '$lib/constants/animations';
	import { useUser } from '$lib/stores/auth.svelte';
	import type { PageData } from './$types';
	import { ArrowLeft, Camera, Check, LoaderCircle, UserRound, Palette } from '@lucide/svelte';

	let { data }: { data: PageData } = $props();

	const userState = useUser();
	const currentUser = $derived(userState.currentUser);
	let profile = $state(untrack(() => data.profile));
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
		{ value: 'none', label: 'None' },
		{ value: '1px solid', label: 'Solid' },
		{ value: '2px dashed', label: 'Dashed' },
		{ value: '2px double', label: 'Double' }
	];
	const TEXT_EFFECT_OPTIONS = [
		{ value: 'none', label: 'None' },
		{ value: 'neon-glow', label: 'Glow' },
		{ value: 'retro-glitch', label: 'Glitch' },
		{ value: 'deep-shadow', label: 'Shadow' }
	];

	const savedBadgeForm = $derived({
		displayName: profile.displayName,
		title: profile.title || '',
		...DEFAULT_STYLE,
		...profile.titleStyle
	});
	let badgeForm = $state(untrack(() => ({ ...savedBadgeForm })));
	let badgeMode = $state<BadgeMode>(
		BADGE_PRESETS.some((preset) =>
			Object.entries(preset.style).every(
				([key, value]) => badgeForm[key as keyof typeof badgeForm] === value
			)
		)
			? 'presets'
			: 'custom'
	);
	const avatarInitials = $derived(
		(isOwner ? badgeForm.displayName : profile.displayName)
			.trim()
			.split(/\s+/)
			.slice(0, 2)
			.map((part) => part[0])
			.join('')
			.toUpperCase() || '?'
	);
	let imageFailed = $state(false);
	let avatarUrl = $state(untrack(() => profile.avatarUrl || ''));
	let selectedAvatarFile = $state<File | null>(null);
	let cropFile = $state<File | null>(null);
	let photoError = $state('');
	const hasChanges = $derived(
		isOwner &&
			(selectedAvatarFile !== null ||
				Object.keys(savedBadgeForm).some(
					(key) =>
						badgeForm[key as keyof typeof badgeForm] !==
						savedBadgeForm[key as keyof typeof savedBadgeForm]
				))
	);
	const previewUser = $derived({
		title: isOwner ? badgeForm.title.trim() : profile.title || '',
		titleStyle: isOwner ? badgeForm : profile.titleStyle
	});
	const previewName = $derived(
		(isOwner ? badgeForm.displayName.trim() : profile.displayName) || 'Your name'
	);
	let loadedProfile = untrack(() => data.profile);
	$effect(() => {
		const next = data.profile;
		if (next !== loadedProfile) {
			loadedProfile = next;
			untrack(() => {
				profile = next;
				discardChanges();
			});
		}
	});
	$effect(() => {
		if (hasChanges && feedbackMessage.type === 'success') feedbackMessage = { text: '', type: '' };
	});
	beforeNavigate((navigation) => {
		if (!hasChanges && !isSaving) return;
		if (
			navigation.willUnload ||
			isSaving ||
			!window.confirm('You have unsaved changes. Leave without saving?')
		)
			navigation.cancel();
	});
	onDestroy(() => {
		if (avatarUrl.startsWith('blob:')) URL.revokeObjectURL(avatarUrl);
	});

	function undoPhoto() {
		if (avatarUrl.startsWith('blob:')) URL.revokeObjectURL(avatarUrl);
		avatarUrl = profile.avatarUrl || '';
		selectedAvatarFile = null;
		imageFailed = false;
		photoError = '';
	}

	function discardChanges() {
		badgeForm = { ...savedBadgeForm };
		badgeMode = BADGE_PRESETS.some(isPresetSelected) ? 'presets' : 'custom';
		undoPhoto();
		cropFile = null;
		feedbackMessage = { text: '', type: '' };
	}

	function applyPhoto(file: File) {
		undoPhoto();
		selectedAvatarFile = file;
		avatarUrl = URL.createObjectURL(file);
		cropFile = null;
	}

	let isSaving = $state(false);
	let isUploading = $state(false);
	let feedbackMessage = $state({ text: '', type: '' });
	const isFramed = $derived(FRAMED_BADGE_STYLES.has(badgeForm.animationVibe));
	let isBackgroundControlled = $derived(
		BACKGROUND_CONTROLLED_ANIMATIONS.has(badgeForm.animationVibe)
	);

	function applyBadgePreset(preset: (typeof BADGE_PRESETS)[number]) {
		Object.assign(badgeForm, {
			displayName: badgeForm.displayName,
			title: badgeForm.title,
			...preset.style
		});
		badgeMode = 'presets';
	}

	function isPresetSelected(preset: (typeof BADGE_PRESETS)[number]) {
		return Object.entries(preset.style).every(
			([key, value]) => badgeForm[key as keyof typeof badgeForm] === value
		);
	}

	async function handleAvatarUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		if (!input.files?.length) return;
		const file = input.files[0];
		photoError = '';
		if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
			photoError = 'Please choose a JPG, PNG or WebP image.';
			input.value = '';
			return;
		}
		if (file.size > 5 * 1024 * 1024) {
			photoError = 'Avatar must be smaller than 5 MB.';
			input.value = '';
			return;
		}
		cropFile = file;
		input.value = '';
	}

	async function uploadAvatar(file: File): Promise<string> {
		const { uploadUrl, downloadUrl } = await storageService.getPresignedUrl(file.name);
		await storageService.uploadFileToMinio(uploadUrl, file);
		return downloadUrl;
	}

	async function handleProfileUpdate(event: SubmitEvent) {
		event.preventDefault();
		if (isSaving || !hasChanges || !badgeForm.displayName.trim()) return;
		feedbackMessage = { text: '', type: '' };
		isSaving = true;
		try {
			let finalAvatarUrl = profile.avatarUrl;
			if (selectedAvatarFile) {
				isUploading = true;
				finalAvatarUrl = await uploadAvatar(selectedAvatarFile);
				isUploading = false;
			}
			const updated = await userService.updateUserProfile({
				displayName: badgeForm.displayName.trim(),
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
			badgeForm = { ...savedBadgeForm };
			userState.update(updated);
			if (avatarUrl.startsWith('blob:')) URL.revokeObjectURL(avatarUrl);
			avatarUrl = updated.avatarUrl ?? '';
			selectedAvatarFile = null;
			feedbackMessage = { text: 'Changes saved.', type: 'success' };
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
		badgeMode = value as BadgeMode;
	}
</script>

<svelte:head><title>{isOwner ? 'Edit profile' : profile.displayName} | M Chat</title></svelte:head>

{#if cropFile}
	<AvatarCropDialog file={cropFile} onapply={applyPhoto} oncancel={() => (cropFile = null)} />
{/if}

<div class="profile-page">
	<div class="profile-scroll">
		<div class="profile-shell">
			<nav class="breadcrumb" aria-label="Breadcrumb">
				<button type="button" class="back-link" onclick={() => history.back()}
					><ArrowLeft size={16} /> Back</button
				>
				<span aria-hidden="true">/</span><span>Profile</span>
			</nav>
			<header class="page-heading">
				<h1>{isOwner ? 'Your profile' : 'Profile'}</h1>
				{#if isOwner}<p>Manage how you appear in chat.</p>{/if}
			</header>
			<div class="profile-layout" class:public-profile={!isOwner}>
				<aside class="identity-panel" aria-label="Profile information">
					<div class="avatar-wrap">
						<div class="avatar">
							{#if avatarUrl && !imageFailed}
								<img
									src={avatarUrl}
									alt={profile.displayName + "'s avatar"}
									onerror={() => (imageFailed = true)}
								/>
							{:else}<span>{avatarInitials}</span>{/if}
						</div>
						{#if isOwner}
							<label class="avatar-edit" class:upload-disabled={isSaving}>
								<Camera size={18} /><span class="sr-only">Change photo</span>
								<input
									type="file"
									accept="image/png,image/jpeg,image/webp"
									onchange={handleAvatarUpload}
									disabled={isSaving}
									class="sr-only"
								/>
							</label>
						{/if}
					</div>
					<h2>{previewName}</h2>
					<p class="username">@{profile.username}</p>
					{#if previewUser.title}<div class="saved-title">
							<TitleBadge user={previewUser} />
						</div>{/if}
					{#if isOwner}
						<p class="photo-help">JPG, PNG or WebP. Up to 5 MB.</p>
						{#if selectedAvatarFile}<div class="photo-selected">
								New photo selected <button type="button" disabled={isSaving} onclick={undoPhoto}
									>Undo photo</button
								>
							</div>{/if}
						{#if photoError}<p class="photo-error" role="alert">{photoError}</p>{/if}
					{/if}
				</aside>
				{#if isOwner}
					<form id="profile-form" class="settings-form" onsubmit={handleProfileUpdate}>
						<fieldset disabled={isSaving}>
							<section class="settings-section" aria-labelledby="details-heading">
								<div class="section-heading">
									<span class="section-icon"><UserRound size={19} /></span>
									<div>
										<h2 id="details-heading">Personal details</h2>
										<p>Your name and title are visible in your rooms.</p>
									</div>
								</div>
								<div class="field-row">
									<div class="field-caption">
										<label for="displayName">Display name</label>
										<p>What others call you.</p>
									</div>
									<Input
										id="displayName"
										bind:value={badgeForm.displayName}
										maxlength={50}
										autocomplete="name"
										required
									/>
								</div>
								<div class="field-row">
									<div class="field-caption">
										<label for="title">Title <span>Optional</span></label>
										<p id="title-help">Shown beside your name.</p>
									</div>
									<div class="title-input">
										<Input
											id="title"
											bind:value={badgeForm.title}
											maxlength={30}
											placeholder="Add a short title"
											aria-describedby="title-help"
										/><span class="character-count">{badgeForm.title.length}/30</span>
									</div>
								</div>
							</section>
							<section class="chat-preview settings-section" aria-labelledby="preview-heading">
								<div class="preview-heading">
									<h2 id="preview-heading">Chat preview</h2>
									<span>Only visible to you until saved</span>
								</div>
								<div class="preview-message">
									<div class="preview-avatar">
										{#if avatarUrl && !imageFailed}<img
												src={avatarUrl}
												alt=""
											/>{:else}{avatarInitials}{/if}
									</div>
									<div class="preview-content">
										<div class="preview-identity">
											<strong>{previewName}</strong><TitleBadge user={previewUser} />
										</div>
										<p>This is how you appear in chat.</p>
									</div>
								</div>
							</section>
							<section class="settings-section" aria-labelledby="style-heading">
								<div class="section-heading">
									<span class="section-icon"><Palette size={19} /></span>
									<div>
										<h2 id="style-heading">Title appearance</h2>
										<p>Choose a style or set your own colors.</p>
									</div>
								</div>
								{#if !badgeForm.title.trim()}
									<div class="title-empty">
										<p>Add a title to personalize how you appear beside your name.</p>
										<Button
											type="button"
											variant="outline"
											onclick={() => document.getElementById('title')?.focus()}>Add a title</Button
										>
									</div>
								{:else}
									<Tabs.Root
										value={badgeMode}
										onValueChange={handleTabChange}
										class="appearance-tabs"
									>
										<Tabs.List
											><Tabs.Trigger value="presets">Choose a style</Tabs.Trigger><Tabs.Trigger
												value="custom">Advanced</Tabs.Trigger
											></Tabs.List
										>
										<Tabs.Content value="presets" class="mt-5 focus-visible:outline-none">
											<div class="preset-grid">
												{#each BADGE_PRESETS as preset (preset.id)}
													<button
														type="button"
														class="preset-option"
														class:selected={isPresetSelected(preset)}
														aria-pressed={isPresetSelected(preset)}
														aria-label={preset.name}
														onclick={() => applyBadgePreset(preset)}
													>
														<span class="preset-art"
															><TitleBadge
																user={{
																	title: badgeForm.title.trim() || preset.title,
																	titleStyle: preset.style
																}}
															/></span
														>
														<span class="preset-label"
															>{preset.name}<span class="selection-dot" aria-hidden="true"
																>{#if isPresetSelected(preset)}<Check size={12} />{/if}</span
															></span
														>
													</button>
												{/each}
											</div>
										</Tabs.Content>
										<Tabs.Content value="custom" class="mt-0 focus-visible:outline-none">
											<p class="advanced-help">
												Advanced customization — adjust colors, shape and effects.
											</p>
											{#if isFramed}<p class="mb-4 text-sm text-slate-400">
													This frame uses fixed corners and a static finish. You can change its text
													and border colors.
												</p>{/if}
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
															This style uses its own background.
														</p>{/if}</Field.Field
												>
												<Field.Field
													><Field.Label for="radius">Corner radius</Field.Label><Select.Root
														type="single"
														disabled={isFramed}
														bind:value={badgeForm.borderRadius}
														><Select.Trigger id="radius" class="w-full"
															>{{
																'0px': 'Square',
																'4px': 'Slightly rounded',
																'8px': 'Rounded',
																'9999px': 'Pill'
															}[badgeForm.borderRadius] || badgeForm.borderRadius}</Select.Trigger
														><Select.Content
															><Select.Item value="0px">Square</Select.Item><Select.Item value="4px"
																>Slightly rounded</Select.Item
															><Select.Item value="8px">Rounded</Select.Item><Select.Item
																value="9999px">Pill</Select.Item
															></Select.Content
														></Select.Root
													></Field.Field
												>
												<Field.Field
													><Field.Label for="borderStyle">Border type</Field.Label><Select.Root
														type="single"
														disabled={isFramed}
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
															disabled={!isFramed && badgeForm.borderStyle === 'none'}
															class="size-9 shrink-0 cursor-pointer bg-transparent p-0"
														/><Input
															bind:value={badgeForm.borderColor}
															disabled={!isFramed && badgeForm.borderStyle === 'none'}
															aria-label="Border color hex value"
														/>
													</div></Field.Field
												>
												<Field.Field
													><Field.Label for="textEffect">Text effect</Field.Label><Select.Root
														type="single"
														disabled={isFramed}
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
													><Field.Label for="vibe">Frame or effect</Field.Label><Select.Root
														type="single"
														bind:value={badgeForm.animationVibe}
														><Select.Trigger id="vibe" class="w-full"
															>{BADGE_ANIMATIONS.find(
																(animation) => animation.value === badgeForm.animationVibe
															)?.label ?? 'Choose a style'}</Select.Trigger
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
								{/if}
							</section>
						</fieldset>
					</form>
				{/if}
			</div>
		</div>
	</div>
	{#if isOwner}
		<footer class="save-bar">
			<div class="save-bar-inner">
				<div class="save-status" aria-live="polite">
					{#if feedbackMessage.text}<p
							class:error={feedbackMessage.type === 'error'}
							role={feedbackMessage.type === 'error' ? 'alert' : 'status'}
						>
							{#if feedbackMessage.type === 'success'}<Check size={16} />{/if}{feedbackMessage.text}
						</p>{:else if hasChanges}<p class="unsaved">Unsaved changes</p>{:else}<p
							class="unchanged"
						>
							No unsaved changes
						</p>{/if}
				</div>
				<div class="save-actions">
					<Button
						type="button"
						variant="ghost"
						class="cancel-button"
						disabled={isSaving || !hasChanges}
						onclick={discardChanges}>Discard changes</Button
					>
					<Button
						type="submit"
						form="profile-form"
						class="save-button"
						disabled={isSaving || isUploading || !hasChanges || !badgeForm.displayName.trim()}
						>{#if isSaving}<LoaderCircle class="animate-spin" />{/if}{isUploading
							? 'Uploading photo...'
							: isSaving
								? 'Saving...'
								: 'Save changes'}</Button
					>
				</div>
			</div>
		</footer>
	{/if}
</div>

<style>
	.profile-layout.public-profile {
		grid-template-columns: minmax(0, 480px);
		justify-content: center;
	}
	.chat-preview {
		padding: 20px;
		background: #0f172a;
		border: 1px solid #334155;
		border-radius: 14px;
	}
	.preview-heading {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 16px;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20px;
	}
	.preview-heading h2 {
		font-size: 14px;
		font-weight: 600;
	}
	.preview-heading span,
	.advanced-help {
		font-size: 13px;
		color: #94a3b8;
	}
	.advanced-help {
		margin-bottom: 20px;
	}
	.preview-message {
		display: flex;
		gap: 12px;
		align-items: start;
	}
	.preview-avatar {
		width: 40px;
		height: 40px;
		flex-shrink: 0;
		display: grid;
		place-items: center;
		overflow: hidden;
		border-radius: 50%;
		background: #334155;
		font-size: 14px;
	}
	.preview-avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.preview-content {
		min-width: 0;
	}
	.preview-identity {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		overflow-wrap: anywhere;
	}
	.preview-identity strong {
		font-size: 14px;
	}
	.preview-content p {
		margin-top: 8px;
		color: #cbd5e1;
		font-size: 14px;
	}
	.title-empty {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 16px;
		padding: 20px;
		border: 1px dashed #334155;
		border-radius: 12px;
	}
	.title-empty p {
		flex: 1;
		min-width: 180px;
		font-size: 14px;
		color: #94a3b8;
	}
	.photo-error {
		grid-column: 1 / -1;
		margin-top: 12px;
		color: #fca5a5;
		font-size: 13px;
	}
	.photo-selected button {
		display: block;
		margin: 4px auto 0;
		min-height: 44px;
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	.save-status p.unsaved {
		color: #fcd34d;
	}
	.save-status p.unchanged {
		color: #94a3b8;
	}
	.preset-option:not(:hover):not(:focus-visible):not(.selected) :global(*),
	.preset-option:not(:hover):not(:focus-visible):not(.selected) :global(*::before),
	.preset-option:not(:hover):not(:focus-visible):not(.selected) :global(*::after) {
		animation-play-state: paused !important;
	}
	@media (prefers-reduced-motion: reduce) {
		.profile-page :global(*),
		.profile-page :global(*::before),
		.profile-page :global(*::after) {
			animation: none !important;
			transition: none !important;
		}
	}
	.profile-page {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-height: 0;
		background: #020617;
		color: #f1f5f9;
		font-family: var(--font-body);
	}
	.profile-scroll {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior-y: contain;
		scrollbar-gutter: stable;
	}
	.profile-shell {
		max-width: 1160px;
		margin: 0 auto;
		padding: 28px 40px 64px;
	}
	.breadcrumb {
		display: flex;
		align-items: center;
		gap: 16px;
		color: #64748b;
		font-size: 13px;
	}
	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		color: #cbd5e1;
		background: none;
		border: 0;
	}
	.back-link:hover {
		color: white;
	}
	.page-heading {
		padding: 28px 0 36px;
		border-bottom: 1px solid #1e293b;
	}
	.page-heading h1 {
		margin: 0;
		text-align: left;
		font-size: clamp(28px, 4vw, 36px);
		font-weight: 650;
		letter-spacing: -0.035em;
		line-height: 1.2;
	}
	.page-heading p {
		margin-top: 10px;
		color: #94a3b8;
		font-size: 14px;
	}
	.profile-layout {
		display: grid;
		grid-template-columns: 240px minmax(0, 1fr);
		gap: 56px;
		padding-top: 36px;
		align-items: start;
	}
	.identity-panel {
		min-width: 0;
		text-align: center;
		padding: 32px 20px;
		background: #0f172a;
		border: 1px solid #1e293b;
		border-radius: 20px;
	}
	.avatar-wrap {
		position: relative;
		width: 96px;
		margin: 0 auto 20px;
	}
	.avatar {
		display: grid;
		place-items: center;
		width: 96px;
		height: 96px;
		overflow: hidden;
		border-radius: 50%;
		background: #334155;
		box-shadow: 0 0 0 5px #1e293b;
		font-size: 28px;
		font-weight: 600;
	}
	.avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.avatar-edit {
		position: absolute;
		bottom: -7px;
		right: -7px;
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border: 4px solid #0f172a;
		border-radius: 50%;
		background: #e2e8f0;
		color: #0f172a;
		cursor: pointer;
	}
	.avatar-edit:hover {
		background: white;
	}
	.avatar-edit:focus-within {
		outline: 2px solid #38bdf8;
		outline-offset: 3px;
	}
	.upload-disabled {
		opacity: 0.5;
		pointer-events: none;
	}
	.identity-panel h2 {
		font-size: 18px;
		font-weight: 600;
		overflow-wrap: anywhere;
	}
	.username {
		margin-top: 6px;
		font-size: 13px;
		color: #94a3b8;
		overflow-wrap: anywhere;
	}
	.saved-title {
		margin-top: 14px;
		overflow-wrap: anywhere;
	}
	.photo-help {
		margin-top: 28px;
		padding-top: 22px;
		border-top: 1px solid #1e293b;
		font-size: 12px;
		color: #94a3b8;
		line-height: 1.8;
	}
	.photo-selected {
		margin-top: 12px;
		font-size: 12px;
		color: #7dd3fc;
	}
	.settings-form,
	fieldset {
		min-width: 0;
	}
	fieldset {
		padding: 0;
		border: 0;
	}
	.settings-section + .settings-section {
		margin-top: 32px;
		padding-top: 32px;
		border-top: 1px solid #1e293b;
	}
	.section-heading {
		display: flex;
		gap: 12px;
		align-items: center;
		margin-bottom: 28px;
	}
	.section-icon {
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
		flex-shrink: 0;
		border: 1px solid #1e293b;
		border-radius: 12px;
		color: #94a3b8;
	}
	.section-heading h2 {
		font-size: 16px;
		font-weight: 600;
		letter-spacing: -0.015em;
	}
	.section-heading p {
		margin-top: 5px;
		color: #94a3b8;
		font-size: 13px;
	}
	.field-row {
		display: grid;
		grid-template-columns: 180px minmax(0, 1fr);
		gap: 20px;
		align-items: start;
		margin-top: 24px;
	}
	.field-caption label {
		display: block;
		font-size: 14px;
		font-weight: 500;
	}
	.field-caption label span {
		margin-left: 6px;
		font-weight: 400;
		font-size: 12px;
		color: #94a3b8;
	}
	.field-caption p {
		margin-top: 6px;
		color: #94a3b8;
		font-size: 12px;
	}
	.title-input {
		min-width: 0;
	}
	.character-count {
		display: block;
		text-align: right;
		margin-top: 7px;
		color: #94a3b8;
		font-size: 12px;
		font-variant-numeric: tabular-nums;
	}
	.preset-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 12px;
	}
	.preset-option {
		min-width: 0;
		overflow: hidden;
		padding: 0;
		border: 1px solid #1e293b;
		border-radius: 12px;
		background: #0f172a;
		transition:
			border-color 150ms,
			background 150ms;
		text-align: left;
	}
	.preset-option:hover {
		border-color: #64748b;
	}
	.preset-option.selected {
		border-color: #38bdf8;
	}
	.preset-art {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 76px;
		padding: 12px 8px;
		overflow-wrap: anywhere;
	}
	.preset-label {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 6px;
		border-top: 1px solid #1e293b;
		padding: 12px;
		color: #cbd5e1;
		font-size: 12px;
	}
	.selection-dot {
		display: grid;
		place-items: center;
		width: 16px;
		height: 16px;
		flex-shrink: 0;
		border: 1px solid #475569;
		border-radius: 50%;
	}
	.selected .selection-dot {
		background: #38bdf8;
		color: #020617;
		border-color: #38bdf8;
	}
	.profile-page :global(input:not([type='file'])),
	.profile-page :global([data-slot='select-trigger']) {
		min-height: 46px;
		border-radius: 10px;
		border: 1px solid #334155;
		background: #0f172a;
		color: #f1f5f9;
		font-size: 14px;
		box-shadow: none;
	}
	.profile-page :global(input:not([type='color']):not([type='file'])) {
		cursor: text;
	}
	.profile-page :global(input::placeholder) {
		color: #94a3b8;
	}
	.profile-page :global(input:focus-visible),
	.profile-page :global(button:focus-visible) {
		outline: 2px solid #38bdf8;
		outline-offset: 3px;
	}
	.profile-page :global([data-slot='tabs-list']) {
		width: fit-content;
		padding: 4px;
		min-height: 44px;
		border: 1px solid #1e293b;
		border-radius: 10px;
		background: #0f172a;
	}
	.profile-page :global([data-slot='tabs-trigger']) {
		min-height: 36px;
		padding: 0 18px;
		border-radius: 7px;
		color: #94a3b8;
		font-size: 13px;
	}
	.profile-page :global([data-slot='tabs-trigger'][data-active]) {
		background: #334155;
		color: #f8fafc;
	}
	.profile-page :global([data-slot='tabs-content']) {
		margin-top: 20px;
	}
	.save-bar {
		flex-shrink: 0;
		background: #020617;
		border-top: 1px solid #1e293b;
		padding: 16px 40px max(16px, env(safe-area-inset-bottom));
	}
	.save-bar-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
		max-width: 1080px;
		margin: auto;
	}
	.save-status {
		min-width: 0;
	}
	.save-status p {
		display: flex;
		align-items: center;
		gap: 8px;
		color: #6ee7b7;
		font-size: 13px;
		overflow-wrap: anywhere;
	}
	.save-status p.error {
		color: #fca5a5;
	}
	.save-actions {
		display: flex;
		gap: 10px;
		flex-shrink: 0;
	}
	.profile-page :global(.cancel-button) {
		height: 44px;
		border-radius: 10px;
		padding: 0 20px;
		color: #cbd5e1;
	}
	.profile-page :global(.cancel-button:hover) {
		background: #1e293b;
		color: white;
	}
	.profile-page :global(.save-button) {
		height: 44px;
		border-radius: 10px;
		padding: 0 24px;
		background: #0284c7;
		color: white;
		font-weight: 500;
	}
	.profile-page :global(.save-button:hover) {
		background: #0369a1;
	}
	@media (max-width: 960px) {
		.profile-layout {
			grid-template-columns: 200px minmax(0, 1fr);
			gap: 28px;
		}
		.field-row {
			grid-template-columns: 1fr;
			gap: 10px;
		}
		.preset-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 640px) {
		.profile-shell {
			padding: 16px 20px 32px;
		}
		.page-heading {
			padding: 18px 0 24px;
		}
		.profile-layout {
			grid-template-columns: minmax(0, 1fr);
			gap: 32px;
			padding-top: 24px;
		}
		.identity-panel {
			display: grid;
			grid-template-columns: 80px minmax(0, 1fr);
			column-gap: 24px;
			padding: 24px;
			text-align: left;
		}
		.avatar-wrap {
			grid-row: span 3;
			width: 72px;
			margin: 0;
			align-self: center;
		}
		.avatar {
			width: 72px;
			height: 72px;
			font-size: 24px;
		}
		.identity-panel h2 {
			align-self: end;
		}
		.saved-title {
			margin-top: 8px;
		}
		.photo-help {
			grid-column: 1 / -1;
			margin-top: 24px;
			padding-top: 16px;
		}
		.photo-selected {
			grid-column: 1 / -1;
		}
		.save-bar {
			padding: 12px 20px max(12px, env(safe-area-inset-bottom));
		}
		.save-bar-inner {
			flex-wrap: wrap;
			gap: 10px;
		}
		.save-status:empty {
			display: none;
		}
		.save-actions {
			width: 100%;
			justify-content: flex-end;
		}
		.save-actions :global(button) {
			flex: 1;
			padding: 0 10px;
		}
		.photo-selected button {
			margin-left: 0;
		}
		.photo-help {
			margin-top: 12px;
			padding-top: 12px;
		}
		.profile-page :global([data-slot='tabs-trigger']) {
			padding: 0 12px;
		}
		.profile-page :global(input:not([type='file'])),
		.profile-page :global([data-slot='select-trigger']) {
			font-size: 16px;
		}
	}
</style>
