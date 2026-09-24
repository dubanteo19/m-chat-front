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
		const finalFileName = `avatars/${profile.username}-${Date.now()}.png`;
		const { uploadUrl, downloadUrl } = await storageService.getPresignedUrl(finalFileName);
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

<div
	class="flex min-h-0 flex-1 flex-col bg-slate-950 font-[var(--font-body)] text-slate-100 motion-reduce:[&_*]:animate-none! motion-reduce:[&_*]:transition-none! motion-reduce:[&_*::after]:animate-none! motion-reduce:[&_*::before]:animate-none!"
>
	<div class="min-h-0 flex-1 overflow-y-auto overscroll-y-contain [scrollbar-gutter:stable]">
		<div class="mx-auto w-full max-w-[1160px] px-5 pt-4 pb-8 sm:px-10 sm:pt-7 sm:pb-16">
			<nav class="flex items-center gap-4 text-[13px] text-slate-500" aria-label="Breadcrumb">
				<button
					type="button"
					class="inline-flex min-h-11 items-center gap-2 border-0 bg-transparent text-slate-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-sky-400"
					onclick={() => history.back()}><ArrowLeft size={16} /> Back</button
				>
				<span aria-hidden="true">/</span><span>Profile</span>
			</nav>
			<header class="border-b border-slate-800 py-6 sm:pt-7 sm:pb-9">
				<h1
					class="m-0 text-left text-[clamp(28px,4vw,36px)] leading-[1.2] font-[650] tracking-[-0.035em]"
				>
					{isOwner ? 'Your profile' : 'Profile'}
				</h1>
				{#if isOwner}<p class="mt-2.5 text-sm text-slate-400">
						Manage how you appear in chat.
					</p>{/if}
			</header>
			<div
				class={isOwner
					? 'grid grid-cols-1 items-start gap-8 pt-6 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-7 sm:pt-9 min-[961px]:grid-cols-[240px_minmax(0,1fr)] min-[961px]:gap-14'
					: 'grid grid-cols-[minmax(0,480px)] items-start justify-center pt-6 sm:pt-9'}
			>
				<aside
					class="grid min-w-0 grid-cols-[80px_minmax(0,1fr)] gap-x-6 rounded-[20px] border border-slate-800 bg-slate-900 p-6 text-left sm:block sm:px-5 sm:py-8 sm:text-center"
					aria-label="Profile information"
				>
					<div class="relative row-span-3 m-0 w-[72px] self-center sm:mx-auto sm:mb-5 sm:w-24">
						<div
							class="grid size-[72px] place-items-center overflow-hidden rounded-full bg-slate-700 text-2xl font-semibold shadow-[0_0_0_5px_#1e293b] sm:size-24 sm:text-[28px]"
						>
							{#if avatarUrl && !imageFailed}
								<img
									src={avatarUrl}
									alt={profile.displayName + "'s avatar"}
									onerror={() => (imageFailed = true)}
									class="size-full object-cover"
								/>
							{:else}<span>{avatarInitials}</span>{/if}
						</div>
						{#if isOwner}
							<label
								class="absolute -right-[7px] -bottom-[7px] grid size-11 cursor-pointer place-items-center rounded-full border-4 border-slate-900 bg-slate-200 text-slate-950 hover:bg-white focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-sky-400"
								class:pointer-events-none={isSaving}
								class:opacity-50={isSaving}
							>
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
					<h2 class="self-end text-lg font-semibold [overflow-wrap:anywhere]">{previewName}</h2>
					<p class="mt-1.5 text-[13px] text-slate-400 [overflow-wrap:anywhere]">
						@{profile.username}
					</p>
					{#if previewUser.title}<div class="mt-2 [overflow-wrap:anywhere] sm:mt-3.5">
							<TitleBadge user={previewUser} />
						</div>{/if}
					{#if isOwner}
						<p
							class="col-span-full mt-3 border-t border-slate-800 pt-3 text-xs leading-[1.8] text-slate-400 sm:mt-7 sm:pt-[22px]"
						>
							JPG, PNG or WebP. Up to 5 MB.
						</p>
						{#if selectedAvatarFile}<div class="col-span-full mt-3 text-xs text-sky-300">
								New photo selected <button
									type="button"
									disabled={isSaving}
									onclick={undoPhoto}
									class="mt-1 block min-h-11 underline underline-offset-4 sm:mx-auto"
									>Undo photo</button
								>
							</div>{/if}
						{#if photoError}<p class="col-span-full mt-3 text-[13px] text-red-300" role="alert">
								{photoError}
							</p>{/if}
					{/if}
				</aside>
				{#if isOwner}
					<form id="profile-form" class="min-w-0" onsubmit={handleProfileUpdate}>
						<fieldset class="min-w-0 border-0 p-0" disabled={isSaving}>
							<section aria-labelledby="details-heading">
								<div class="mb-7 flex items-center gap-3">
									<span
										class="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-800 text-slate-400"
										><UserRound size={19} /></span
									>
									<div>
										<h2 id="details-heading" class="text-base font-semibold tracking-[-0.015em]">
											Personal details
										</h2>
										<p class="mt-1 text-[13px] text-slate-400">
											Your name and title are visible in your rooms.
										</p>
									</div>
								</div>
								<div
									class="mt-6 grid grid-cols-1 items-start gap-2.5 min-[961px]:grid-cols-[180px_minmax(0,1fr)] min-[961px]:gap-5"
								>
									<div>
										<label for="displayName" class="block text-sm font-medium">Display name</label>
										<p class="mt-1.5 text-xs text-slate-400">What others call you.</p>
									</div>
									<Input
										id="displayName"
										bind:value={badgeForm.displayName}
										maxlength={50}
										autocomplete="name"
										required
										class="min-h-[46px] cursor-text rounded-[10px] border-slate-700 bg-slate-900 text-base text-slate-100 shadow-none placeholder:text-slate-400 focus-visible:border-slate-700 focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-sky-400 sm:text-sm"
									/>
								</div>
								<div
									class="mt-6 grid grid-cols-1 items-start gap-2.5 min-[961px]:grid-cols-[180px_minmax(0,1fr)] min-[961px]:gap-5"
								>
									<div>
										<label for="title" class="block text-sm font-medium"
											>Title <span class="ml-1.5 text-xs font-normal text-slate-400">Optional</span
											></label
										>
										<p id="title-help" class="mt-1.5 text-xs text-slate-400">
											Shown beside your name.
										</p>
									</div>
									<div class="min-w-0">
										<Input
											id="title"
											bind:value={badgeForm.title}
											maxlength={30}
											placeholder="Add a short title"
											aria-describedby="title-help"
											class="min-h-[46px] cursor-text rounded-[10px] border-slate-700 bg-slate-900 text-base text-slate-100 shadow-none placeholder:text-slate-400 focus-visible:border-slate-700 focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-sky-400 sm:text-sm"
										/><span class="mt-[7px] block text-right text-xs text-slate-400 tabular-nums"
											>{badgeForm.title.length}/30</span
										>
									</div>
								</div>
							</section>
							<section
								class="mt-8 rounded-[14px] border border-slate-700 bg-slate-900 p-5 pt-8"
								aria-labelledby="preview-heading"
							>
								<div class="mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
									<h2 id="preview-heading" class="text-sm font-semibold">Chat preview</h2>
									<span class="text-[13px] text-slate-400">Only visible to you until saved</span>
								</div>
								<div class="flex items-start gap-3">
									<div
										class="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-slate-700 text-sm"
									>
										{#if avatarUrl && !imageFailed}<img
												src={avatarUrl}
												alt=""
												class="size-full object-cover"
											/>{:else}{avatarInitials}{/if}
									</div>
									<div class="min-w-0">
										<div class="flex flex-wrap items-center gap-2 [overflow-wrap:anywhere]">
											<strong class="text-sm">{previewName}</strong><TitleBadge
												user={previewUser}
											/>
										</div>
										<p class="mt-2 text-sm text-slate-300">This is how you appear in chat.</p>
									</div>
								</div>
							</section>
							<section class="mt-8 border-t border-slate-800 pt-8" aria-labelledby="style-heading">
								<div class="mb-7 flex items-center gap-3">
									<span
										class="grid size-10 shrink-0 place-items-center rounded-xl border border-slate-800 text-slate-400"
										><Palette size={19} /></span
									>
									<div>
										<h2 id="style-heading" class="text-base font-semibold tracking-[-0.015em]">
											Title appearance
										</h2>
										<p class="mt-1 text-[13px] text-slate-400">
											Choose a style or set your own colors.
										</p>
									</div>
								</div>
								{#if !badgeForm.title.trim()}
									<div
										class="flex flex-wrap items-center gap-4 rounded-xl border border-dashed border-slate-700 p-5"
									>
										<p class="min-w-[180px] flex-1 text-sm text-slate-400">
											Add a title to personalize how you appear beside your name.
										</p>
										<Button
											type="button"
											variant="outline"
											class="focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-sky-400"
											onclick={() => document.getElementById('title')?.focus()}>Add a title</Button
										>
									</div>
								{:else}
									<Tabs.Root value={badgeMode} onValueChange={handleTabChange}>
										<Tabs.List
											class="min-h-11 w-fit rounded-[10px] border border-slate-800 bg-slate-900 p-1"
											><Tabs.Trigger
												value="presets"
												class="min-h-9 rounded-[7px] px-3 text-[13px] text-slate-400 data-active:bg-slate-700 data-active:text-slate-50 sm:px-[18px]"
												>Choose a style</Tabs.Trigger
											><Tabs.Trigger
												value="custom"
												class="min-h-9 rounded-[7px] px-3 text-[13px] text-slate-400 data-active:bg-slate-700 data-active:text-slate-50 sm:px-[18px]"
												>Advanced</Tabs.Trigger
											></Tabs.List
										>
										<Tabs.Content value="presets" class="mt-5 focus-visible:outline-none">
											<div class="grid grid-cols-2 gap-3 min-[961px]:grid-cols-3">
												{#each BADGE_PRESETS as preset (preset.id)}
													<button
														type="button"
														class={isPresetSelected(preset)
															? "min-w-0 overflow-hidden rounded-xl border border-sky-400 bg-slate-900 p-0 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-sky-400 [&:not(:hover):not(:focus-visible):not([aria-pressed='true'])_*]:[animation-play-state:paused]! [&:not(:hover):not(:focus-visible):not([aria-pressed='true'])_*::after]:[animation-play-state:paused]! [&:not(:hover):not(:focus-visible):not([aria-pressed='true'])_*::before]:[animation-play-state:paused]!"
															: "min-w-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-0 text-left transition-colors hover:border-slate-500 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-sky-400 [&:not(:hover):not(:focus-visible):not([aria-pressed='true'])_*]:[animation-play-state:paused]! [&:not(:hover):not(:focus-visible):not([aria-pressed='true'])_*::after]:[animation-play-state:paused]! [&:not(:hover):not(:focus-visible):not([aria-pressed='true'])_*::before]:[animation-play-state:paused]!"}
														aria-pressed={isPresetSelected(preset)}
														aria-label={preset.name}
														onclick={() => applyBadgePreset(preset)}
													>
														<span
															class="flex min-h-[76px] items-center justify-center px-2 py-3 [overflow-wrap:anywhere]"
															><TitleBadge
																user={{
																	title: badgeForm.title.trim() || preset.title,
																	titleStyle: preset.style
																}}
															/></span
														>
														<span
															class="flex items-center justify-between gap-1.5 border-t border-slate-800 p-3 text-xs text-slate-300"
															>{preset.name}<span
																class={isPresetSelected(preset)
																	? 'grid size-4 shrink-0 place-items-center rounded-full border border-sky-400 bg-sky-400 text-slate-950'
																	: 'grid size-4 shrink-0 place-items-center rounded-full border border-slate-600'}
																aria-hidden="true"
																>{#if isPresetSelected(preset)}<Check size={12} />{/if}</span
															></span
														>
													</button>
												{/each}
											</div>
										</Tabs.Content>
										<Tabs.Content value="custom" class="mt-5 focus-visible:outline-none">
											<p class="mb-5 text-[13px] text-slate-400">
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
															class="h-[46px] min-h-[46px] w-9 shrink-0 cursor-pointer rounded-[10px] border-slate-700 bg-transparent p-0 shadow-none focus-visible:border-slate-700 focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-sky-400"
														/><Input
															bind:value={badgeForm.textColor}
															aria-label="Text color hex value"
															class="min-h-[46px] cursor-text rounded-[10px] border-slate-700 bg-slate-900 text-base text-slate-100 shadow-none placeholder:text-slate-400 focus-visible:border-slate-700 focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-sky-400 sm:text-sm"
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
															class="h-[46px] min-h-[46px] w-9 shrink-0 cursor-pointer rounded-[10px] border-slate-700 bg-transparent p-0 shadow-none focus-visible:border-slate-700 focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-sky-400"
														/><Input
															bind:value={badgeForm.backgroundColor}
															disabled={isBackgroundControlled}
															aria-label="Background color hex value"
															class="min-h-[46px] cursor-text rounded-[10px] border-slate-700 bg-slate-900 text-base text-slate-100 shadow-none placeholder:text-slate-400 focus-visible:border-slate-700 focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-sky-400 sm:text-sm"
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
														><Select.Trigger
															id="radius"
															class="min-h-[46px] w-full rounded-[10px] border-slate-700 bg-slate-900 text-base text-slate-100 shadow-none focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-sky-400 sm:text-sm"
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
														><Select.Trigger
															id="borderStyle"
															class="min-h-[46px] w-full rounded-[10px] border-slate-700 bg-slate-900 text-base text-slate-100 shadow-none focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-sky-400 sm:text-sm"
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
															class="h-[46px] min-h-[46px] w-9 shrink-0 cursor-pointer rounded-[10px] border-slate-700 bg-transparent p-0 shadow-none focus-visible:border-slate-700 focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-sky-400"
														/><Input
															bind:value={badgeForm.borderColor}
															disabled={!isFramed && badgeForm.borderStyle === 'none'}
															aria-label="Border color hex value"
															class="min-h-[46px] cursor-text rounded-[10px] border-slate-700 bg-slate-900 text-base text-slate-100 shadow-none placeholder:text-slate-400 focus-visible:border-slate-700 focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-sky-400 sm:text-sm"
														/>
													</div></Field.Field
												>
												<Field.Field
													><Field.Label for="textEffect">Text effect</Field.Label><Select.Root
														type="single"
														disabled={isFramed}
														bind:value={badgeForm.textEffect}
														><Select.Trigger
															id="textEffect"
															class="min-h-[46px] w-full rounded-[10px] border-slate-700 bg-slate-900 text-base text-slate-100 shadow-none focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-sky-400 sm:text-sm"
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
														><Select.Trigger
															id="vibe"
															class="min-h-[46px] w-full rounded-[10px] border-slate-700 bg-slate-900 text-base text-slate-100 shadow-none focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-sky-400 sm:text-sm"
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
	{#if isOwner && (hasChanges || isSaving)}
		<footer
			class="shrink-0 border-t border-slate-800 bg-slate-950 px-5 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:px-10 sm:pt-4 sm:pb-[max(16px,env(safe-area-inset-bottom))]"
		>
			<div
				class="mx-auto flex max-w-[1080px] flex-wrap items-center justify-between gap-2.5 sm:flex-nowrap sm:gap-5"
			>
				<div class="min-w-0 empty:hidden sm:empty:block" aria-live="polite">
					{#if feedbackMessage.text}<p
							class={feedbackMessage.type === 'error'
								? 'flex items-center gap-2 text-[13px] text-red-300 [overflow-wrap:anywhere]'
								: 'flex items-center gap-2 text-[13px] text-emerald-300 [overflow-wrap:anywhere]'}
							role={feedbackMessage.type === 'error' ? 'alert' : 'status'}
						>
							{#if feedbackMessage.type === 'success'}<Check size={16} />{/if}{feedbackMessage.text}
						</p>{:else}<p class="text-[13px] text-amber-300">Unsaved changes</p>{/if}
				</div>
				<div class="flex w-full shrink-0 justify-end gap-2.5 sm:w-auto">
					<Button
						type="button"
						variant="ghost"
						class="h-11 flex-1 rounded-[10px] px-2.5 text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-sky-400 sm:flex-none sm:px-5"
						disabled={isSaving || !hasChanges}
						onclick={discardChanges}>Discard changes</Button
					>
					<Button
						type="submit"
						form="profile-form"
						class="h-11 flex-1 rounded-[10px] bg-sky-600 px-2.5 font-medium text-white hover:bg-sky-700 focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-sky-400 sm:flex-none sm:px-6"
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
