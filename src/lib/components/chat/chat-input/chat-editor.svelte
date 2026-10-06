<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { AtSign } from '@lucide/svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Link from '@tiptap/extension-link';
	import Mention from '@tiptap/extension-mention';
	import { Placeholder } from '@tiptap/extensions';
	import type { RoomMemberInfo } from '$lib/types/room';

	let {
		value = '',
		members = [],
		oninput,
		onkeydown
	}: {
		value?: string;
		members?: RoomMemberInfo[];
		oninput?: (value: string) => void;
		onkeydown?: (event: KeyboardEvent) => boolean;
	} = $props();

	let editorElement: HTMLDivElement;
	let editor: Editor;

	let showMentionMenu = $state(false);
	let mentionQuery = $state('');
	let selectedMentionIndex = $state(0);
	let mentionList = $state<HTMLDivElement>();

	const mentionId = $props.id();
	let editorRoot: HTMLDivElement;
	let availableHeight = $state(240);
	let dismissedQuery: string | null = null;

	function normalizeSearch(value: string) {
		return value
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[\u0111\u0110]/g, 'd')
			.toLowerCase()
			.trim();
	}

	function findMembers(query: string) {
		const search = normalizeSearch(query);
		return members
			.map((member) => {
				const names = [member.user.displayName, member.user.username].map((name) =>
					normalizeSearch(name || '')
				);
				const rank = names.some((name) => name === search)
					? 0
					: names.some((name) => name.startsWith(search))
						? 1
						: 2;
				return { member, names, rank };
			})
			.filter(({ names }) => names.some((name) => name.includes(search)))
			.sort((a, b) => a.rank - b.rank)
			.map(({ member }) => member);
	}

	function closeMentions() {
		dismissedQuery = mentionQuery;
		showMentionMenu = false;
	}

	function updateMentionHeight() {
		const top = window.visualViewport?.offsetTop ?? 0;
		availableHeight = Math.max(0, Math.min(240, editorRoot.getBoundingClientRect().top - top - 52));
	}

	async function moveSelection(direction: number) {
		if (!filteredMembers.length) return;
		selectedMentionIndex =
			(selectedMentionIndex + direction + filteredMembers.length) % filteredMembers.length;
		await tick();
		const row = mentionList?.querySelector<HTMLElement>(
			`[data-mention-index="${selectedMentionIndex}"]`
		);
		if (row && mentionList) {
			const offset = row.getBoundingClientRect().top - mentionList.getBoundingClientRect().top;
			if (offset < 0) mentionList.scrollTop += offset;
			else if (offset + row.offsetHeight > mentionList.clientHeight)
				mentionList.scrollTop += offset + row.offsetHeight - mentionList.clientHeight;
		}
	}

	$effect(() => {
		const open = showMentionMenu;
		const count = filteredMembers.length;
		const active = selectedMentionIndex;
		const input = editorElement?.querySelector('[contenteditable="true"]');
		if (!input) return;
		input.setAttribute('aria-expanded', String(open));
		if (open) input.setAttribute('aria-controls', mentionId);
		else input.removeAttribute('aria-controls');
		if (open && count) input.setAttribute('aria-activedescendant', `${mentionId}-${active}`);
		else input.removeAttribute('aria-activedescendant');
	});

	function serializeEditor(editor: Editor): string {
		const doc = editor.getJSON();

		function serializeNode(node: any): string {
			if (node.type === 'text') {
				return node.text ?? '';
			}

			if (node.type === 'mention') {
				return `<@${node.attrs?.id}>`;
			}

			if (node.type === 'paragraph') {
				return (node.content ?? []).map(serializeNode).join('');
			}

			if (node.type === 'hardBreak') {
				return '\n';
			}

			if (node.content) {
				return node.content.map(serializeNode).join('');
			}

			return '';
		}

		return (doc.content ?? []).map(serializeNode).join('\n');
	}
	let filteredMembers = $derived(findMembers(mentionQuery));

	let mentionCommand: ((props: { id: string; label: string }) => void) | null = null;

	const mentionSuggestion = {
		char: '@',

		items: ({ query }: { query: string }) => {
			mentionQuery = query;
			selectedMentionIndex = 0;

			return findMembers(query).map((member) => ({
				id: String(member.user.id ?? member.user.username),
				label: member.user.displayName || member.user.username,
				member
			}));
		},

		render: () => {
			return {
				onStart: (props: any) => {
					dismissedQuery = null;
					mentionQuery = props.query;
					mentionCommand = props.command;
					showMentionMenu = dismissedQuery !== props.query;
					updateMentionHeight();
				},

				onUpdate: (props: any) => {
					if (dismissedQuery !== props.query) dismissedQuery = null;
					mentionQuery = props.query;
					mentionCommand = props.command;
					showMentionMenu = dismissedQuery !== props.query;
					updateMentionHeight();
				},

				onKeyDown: (props: any) => {
					if (!showMentionMenu || props.event.isComposing || props.event.keyCode === 229)
						return false;

					if (props.event.key === 'ArrowDown') {
						props.event.preventDefault();

						void moveSelection(1);

						return true;
					}

					if (props.event.key === 'ArrowUp') {
						props.event.preventDefault();

						void moveSelection(-1);

						return true;
					}

					if (props.event.key === 'Enter' || props.event.key === 'Tab') {
						if (props.event.shiftKey || (!filteredMembers.length && props.event.key === 'Tab')) {
							closeMentions();
							return false;
						}
						props.event.preventDefault();

						const member = filteredMembers[selectedMentionIndex];

						if (member && mentionCommand) {
							mentionCommand({
								id: String(member.user.id ?? member.user.username),
								label: member.user.displayName || member.user.username
							});
						}

						return true;
					}

					if (props.event.key === 'Escape') {
						props.event.preventDefault();
						closeMentions();
						return true;
					}

					return false;
				},

				onExit: () => {
					showMentionMenu = false;
					mentionCommand = null;
					dismissedQuery = null;
				}
			};
		}
	};

	onMount(() => {
		editor = new Editor({
			element: editorElement,

			extensions: [
				StarterKit.configure({
					heading: false,
					bulletList: false,
					orderedList: false,
					blockquote: false,
					codeBlock: false,
					horizontalRule: false
				}),
				Placeholder.configure({
					placeholder: 'Type a message...'
				}),
				Mention.configure({
					HTMLAttributes: {
						class: 'mention'
					},
					deleteTriggerWithBackspace: true,
					suggestion: mentionSuggestion
				}),
				Link.configure({
					autolink: true,
					linkOnPaste: true
				})
			],

			editorProps: {
				attributes: {
					role: 'combobox',
					'aria-label': 'Message',
					'aria-autocomplete': 'list',
					'aria-haspopup': 'listbox',
					'aria-expanded': 'false',
					'aria-multiline': 'true'
				},
				handleKeyDown: (_view, event) => {
					if (event.isComposing || event.keyCode === 229) return true;
					if (showMentionMenu) {
						return false;
					}
					const { empty } = editor.state.selection;

					if (event.key === ' ' && empty && editor.isActive('link')) {
						editor.commands.unsetLink();
					}
					return onkeydown?.(event) ?? false;
				}
			},
			content: value,

			onUpdate: ({ editor }) => {
				oninput?.(serializeEditor(editor));
			}
		});

		const onOutside = (event: PointerEvent) => {
			if (showMentionMenu && event.target instanceof Node && !editorRoot.contains(event.target))
				closeMentions();
		};
		document.addEventListener('pointerdown', onOutside);
		window.visualViewport?.addEventListener('resize', updateMentionHeight);
		window.visualViewport?.addEventListener('scroll', updateMentionHeight);
		window.addEventListener('resize', updateMentionHeight);
		return () => {
			document.removeEventListener('pointerdown', onOutside);
			window.visualViewport?.removeEventListener('resize', updateMentionHeight);
			window.visualViewport?.removeEventListener('scroll', updateMentionHeight);
			window.removeEventListener('resize', updateMentionHeight);
			editor?.destroy();
		};
	});

	export function clear() {
		editor.commands.clearContent();
		editor.commands.focus('end');
	}

	export function focus() {
		editor.commands.focus('end');
	}

	function selectMention(index: number) {
		const member = filteredMembers[index];

		if (!member || !mentionCommand) return;

		mentionCommand({
			id: String(member.user.id ?? member.user.username),
			label: member.user.displayName || member.user.username
		});
	}
</script>

<div bind:this={editorRoot} class="relative w-full">
	{#if showMentionMenu}
		<div
			class="absolute bottom-full left-0 z-50 mb-1.5 w-80 max-w-full overflow-hidden rounded-md border border-[#30333a] bg-[#181a1f] text-[#e6e8ec] shadow-[0_12px_32px_rgba(0,0,0,0.42)]"
		>
			<div
				class="flex h-7 items-center gap-2 border-b border-[#292c33] px-2.5 text-[10px] text-[#8b919d]"
			>
				<span class="font-medium text-[#aeb4bf]">Members</span>
				<span class="ml-auto max-w-[65%] truncate font-mono text-[#666d78]">
					@{mentionQuery}
				</span>
			</div>
			<div
				bind:this={mentionList}
				id={mentionId}
				style:max-height={`${availableHeight}px`}
				class="mention-list max-h-60 overflow-y-auto overscroll-contain p-1"
				role="listbox"
				aria-label="Mention suggestions"
			>
				{#each filteredMembers as member, index (member.user.id)}
					{@const displayName = member.user.displayName || member.user.username}
					<button
						type="button"
						id={`${mentionId}-${index}`}
						role="option"
						aria-selected={index === selectedMentionIndex}
						tabindex="-1"
						data-mention-index={index}
						aria-label={`${displayName}, @${member.user.username}${member.role === 'MASTER' ? ', Room owner' : ''}`}
						class="flex min-h-10 w-full items-center gap-2 rounded-sm px-2 py-1 text-left transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[#5d6470]
							{index === selectedMentionIndex
							? 'bg-[#2a2d34] text-[#f1f2f4]'
							: 'text-[#c5cad3] hover:bg-[#22252b]'}"
						onmousedown={(event) => event.preventDefault()}
						onclick={() => selectMention(index)}
						onmouseenter={() => (selectedMentionIndex = index)}
					>
						<span
							class="flex size-5 shrink-0 items-center justify-center text-[#8f96a3]"
							aria-hidden="true"><AtSign class="size-3.5" /></span
						>
						<span class="min-w-0 flex-1">
							<span class="block truncate text-[11px] font-medium text-[#e1e4e8]">
								@{member.user.username}
							</span>
							<span class="block truncate text-[10px] leading-4 text-[#777e89]">
								{displayName}{member.role === 'MASTER' ? ' · Room owner' : ''}
							</span>
						</span>
					</button>
				{/each}
			</div>
			{#if !filteredMembers.length}
				<p class="px-3 py-5 text-center text-[11px] text-[#777e89]" role="status">
					No matching members
				</p>
			{/if}
			<div
				class="flex h-7 items-center gap-3 border-t border-[#292c33] px-2.5 text-[9px] text-[#666d78]"
				aria-hidden="true"
			>
				<span><kbd>↑↓</kbd> Navigate</span>
				<span><kbd>Enter</kbd> Select</span>
				<span class="ml-auto"><kbd>Esc</kbd> Close</span>
			</div>
		</div>
	{/if}

	<div
		bind:this={editorElement}
		class="min-h-10 max-h-36 w-full overflow-y-auto outline-none"
	></div>
</div>

<style>
	.mention-list {
		scrollbar-width: thin;
		scrollbar-color: var(--muted-foreground) var(--popover);
	}

	@supports selector(::-webkit-scrollbar) {
		.mention-list {
			scrollbar-width: auto;
			scrollbar-color: auto;
		}

		.mention-list::-webkit-scrollbar {
			width: 6px;
		}

		.mention-list::-webkit-scrollbar-track {
			background: var(--popover);
		}

		.mention-list::-webkit-scrollbar-thumb {
			border: 1px solid var(--popover);
			border-radius: 999px;
			background: color-mix(in oklab, var(--muted-foreground) 65%, var(--popover));
		}

		.mention-list::-webkit-scrollbar-thumb:hover {
			background: var(--muted-foreground);
		}

		.mention-list::-webkit-scrollbar-button {
			display: none;
			width: 0;
			height: 0;
		}
	}

	:global(.ProseMirror) {
		min-height: 38px;
		max-height: 144px;
		overflow-y: auto;
		padding: 9px 12px;
		outline: none;
		white-space: pre-wrap;
		word-break: break-word;
	}

	:global(.ProseMirror:focus) {
		outline: none;
	}

	:global(.ProseMirror p) {
		margin: 0;
	}

	:global(.mention) {
		color: #a99cff;
		background: rgb(139 124 246 / 14%);
		font-weight: 600;
		border-radius: 4px;
		padding: 1px 3px;
	}
	:global(.ProseMirror a) {
		color: #2563eb;
		text-decoration: underline;
		word-break: break-all;
	}
	:global(.tiptap p.is-editor-empty:first-child::before) {
		content: attr(data-placeholder);
		float: left;
		color: #999;
		pointer-events: none;
		height: 0;
	}
</style>
