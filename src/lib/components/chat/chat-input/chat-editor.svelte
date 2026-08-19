<script lang="ts">
	import { onMount } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Link from '@tiptap/extension-link';
	import Mention from '@tiptap/extension-mention';
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
	let filteredMembers = $derived(
		members.filter((member) => {
			const name = member.user.displayName || member.user.username;

			return name.toLowerCase().includes(mentionQuery.toLowerCase());
		})
	);

	let mentionCommand: ((props: { id: string; label: string }) => void) | null = null;

	const mentionSuggestion = {
		char: '@',

		items: ({ query }: { query: string }) => {
			mentionQuery = query;
			selectedMentionIndex = 0;

			return members
				.filter((member) => {
					const name = member.user.displayName || member.user.username;

					return name.toLowerCase().includes(query.toLowerCase());
				})
				.map((member) => ({
					id: String(member.user.id ?? member.user.username),
					label: member.user.displayName || member.user.username,
					member
				}));
		},

		render: () => {
			return {
				onStart: (props: any) => {
					mentionCommand = props.command;
					showMentionMenu = props.items.length > 0;
				},

				onUpdate: (props: any) => {
					mentionCommand = props.command;
					showMentionMenu = props.items.length > 0;
				},

				onKeyDown: (props: any) => {
					if (!showMentionMenu) return false;

					if (props.event.key === 'ArrowDown') {
						props.event.preventDefault();

						selectedMentionIndex = (selectedMentionIndex + 1) % filteredMembers.length;

						return true;
					}

					if (props.event.key === 'ArrowUp') {
						props.event.preventDefault();

						selectedMentionIndex =
							(selectedMentionIndex - 1 + filteredMembers.length) % filteredMembers.length;

						return true;
					}

					if (props.event.key === 'Enter' || props.event.key === 'Tab') {
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
						showMentionMenu = false;
						return true;
					}

					return false;
				},

				onExit: () => {
					showMentionMenu = false;
					mentionCommand = null;
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
				handleKeyDown: (_view, event) => {
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

		return () => {
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

<div class="relative w-full">
	{#if showMentionMenu && filteredMembers.length > 0}
		<div
			class="absolute bottom-full left-0 z-50 mb-2 max-h-48 w-64 overflow-y-auto rounded-lg border border-slate-700 bg-slate-900 shadow-xl"
		>
			{#each filteredMembers as member, index (member.user.id)}
				{@const displayName = member.user.displayName || member.user.username}

				<button
					type="button"
					class="flex w-full items-center px-3 py-2 text-left text-sm transition-colors
						{index === selectedMentionIndex ? 'bg-blue-600 text-white' : 'text-slate-200 hover:bg-slate-800'}"
					onmousedown={(event) => {
						event.preventDefault();
						selectMention(index);
					}}
					onmouseenter={() => (selectedMentionIndex = index)}
				>
					<span class="font-medium">@{displayName}</span>
				</button>
			{/each}
		</div>
	{/if}

	<div
		bind:this={editorElement}
		class="w-full min-h-11 max-h-36 overflow-y-auto outline-none"
	></div>
</div>

<style>
	:global(.ProseMirror) {
		min-height: 44px;
		max-height: 144px;
		overflow-y: auto;
		padding: 12px;
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
		color: #60a5fa;
		font-weight: 600;
		border-radius: 4px;
	}
	:global(.ProseMirror a) {
		color: #2563eb;
		text-decoration: underline;
		word-break: break-all;
	}
</style>
