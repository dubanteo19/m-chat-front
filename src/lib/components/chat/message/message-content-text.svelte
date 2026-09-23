<script lang="ts">
	import { ROOM_MEMBERS_KEY, type RoomState } from '$lib/components/room/room-state.svelte';
	import { useUser } from '$lib/stores/auth.svelte';
	import { parseMessage } from '$lib/utils/message-parser';
	import type { MessageToken } from '$lib/utils/message-parser';
	import { truncateText } from '$lib/utils/text';
	import { getContext } from 'svelte';

	const roomState = getContext<RoomState>(ROOM_MEMBERS_KEY);

	let { text }: { text: string } = $props();

	const tokens = $derived(parseMessage(text));
	const useState = useUser();
	function getDisplayName(userId: string) {
		const member = roomState.members.find((m) => String(m.user.id) === userId);

		return member?.user.displayName || member?.user.username || userId;
	}
</script>

{#each tokens as token, i (i)}
	{@render renderToken(token)}
{/each}

{#snippet renderToken(token: MessageToken)}
	{#if token.type === 'text'}
		{token.value}
	{:else if token.type === 'mention'}
		<span
			class="mention-chip"
			class:self-mention={token.userId === String(useState.currentUser?.id)}
			data-user-id={token.userId}
		>
			@{getDisplayName(token.userId)}
		</span>
	{:else if token.type === 'merge_request'}
		<div class="mr-card-wrapper">
			<a
				href={token.url}
				target="_blank"
				rel="noopener noreferrer"
				class="mt-2 mb-1 p-[10px_14px] bg-slate-50 border border-slate-200 border-l-4 border-l-[#fc6d26] rounded-lg flex flex-col gap-0.5 max-w-[480px] !no-underline transition-colors hover:bg-slate-100"
			>
				<div class="flex items-center gap-1.5 font-semibold text-sm text-[#fc6d26] !no-underline">
					{@render gitlabIcon(18)}
					<span>MERGE REQUEST !{token.mrId}</span>
				</div>
				<span class="text-[0.8125rem] text-slate-500 !no-underline">
					{token.projectPath}
				</span>
			</a>
		</div>
	{:else if token.type === 'backlog'}
		{#if tokens.length > 1}
			<a
				href={token.url}
				target="_blank"
				rel="noopener noreferrer"
				class="!text-[#2fa67c] !underline hover:opacity-80"
			>
				Backlog · {token.issueKey}
			</a>
		{/if}

		<a
			href={token.url}
			target="_blank"
			rel="noopener noreferrer"
			class="mt-2 mb-1 p-[10px_14px] bg-slate-50 border border-slate-200 border-l-4 border-l-[#4ecea1] rounded-lg flex flex-col gap-0.5 max-w-[480px] !no-underline transition-colors hover:bg-slate-100"
		>
			<span class="font-semibold text-sm text-[#4ecea1] !no-underline">
				Backlog · {token.issueKey}
			</span>
			<span class="text-[0.8125rem] text-slate-500 !no-underline">
				{#if token.commentId}
					Liên kết đến comment
				{:else}
					Xem ticket
				{/if}
			</span>
		</a>
	{:else if token.type === 'link'}
		<a href={token.url} target="_blank" rel="noopener noreferrer" class="message-link">
			{truncateText(token.url)}
		</a>
	{/if}
{/snippet}
{#snippet gitlabIcon(size = 18)}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={size}
		height={size}
		viewBox="100 100 180 180"
		class="shrink-0"
	>
		<defs>
			<style>
				.cls-1 {
					fill: #fca326;
				}
				.cls-2 {
					fill: #fc6d26;
				}
				.cls-3 {
					fill: #e24329;
				}
			</style>
		</defs>
		<path
			class="cls-3"
			d="M265.26416,174.37243l-.2134-.55822-21.19899-55.30908c-.4236-1.08359-1.18542-1.99642-2.17699-2.62689-.98837-.63373-2.14749-.93253-3.32305-.87014-1.1689.06239-2.29195.48925-3.20809,1.21821-.90957.73554-1.56629,1.73047-1.87493,2.85346l-14.31327,43.80662h-57.90965l-14.31327-43.80662c-.30864-1.12299-.96536-2.11791-1.87493-2.85346-.91614-.72895-2.03911-1.15582-3.20809-1.21821-1.17548-.06239-2.33468.23641-3.32297.87014-.99166.63047-1.75348,1.5433-2.17707,2.62689l-21.19891,55.31237-.21348.55493c-6.28158,16.38521-.92929,34.90803,13.05891,45.48782.02621.01641.04922.03611.07552.05582l.18719.14119,32.29094,24.17392,15.97151,12.09024,9.71951,7.34871c2.34117,1.77316,5.57877,1.77316,7.92002,0l9.71943-7.34871,15.96822-12.09024,32.48142-24.31511c.02958-.02299.05588-.04269.08538-.06568,13.97834-10.57977,19.32735-29.09604,13.04905-45.47796Z"
		/>
		<path
			class="cls-2"
			d="M265.26416,174.37243l-.2134-.55822c-10.5174,2.16062-20.20405,6.6099-28.49844,12.81593-.1346.0985-25.20497,19.05805-46.55171,35.19699,15.84998,11.98517,29.6477,22.40405,29.6477,22.40405l32.48142-24.31511c.02958-.02299.05588-.04269.08538-.06568,13.97834-10.57977,19.32735-29.09604,13.04905-45.47796Z"
		/>
		<path
			class="cls-1"
			d="M160.34962,244.23117l15.97151,12.09024,9.71951,7.34871c2.34117,1.77316,5.57877,1.77316,7.92002,0l9.71943-7.34871,15.96822-12.09024s-13.79772-10.41888-29.6477-22.40405c-15.85327,11.98517-29.65099,22.40405-29.65099,22.40405Z"
		/>
		<path
			class="cls-2"
			d="M143.44561,186.63014c-8.29111-6.20274-17.97446-10.65531-28.49507-12.81264l-.21348.55493c-6.28158,16.38521-.92929,34.90803,13.05891,45.48782.02621.01641.04922.03611.07552.05582l.18719.14119,32.29094,24.17392s13.79772-10.41888,29.65099-22.40405c-21.34673-16.13894-46.42031-35.09848-46.55499-35.19699Z"
		/>
	</svg>
{/snippet}

<style>
	.self-mention {
		color: red !important;
	}
	.mention-chip {
		color: #60a5fa;
		font-weight: 600;
		padding: 1px 4px;
		border-radius: 4px;
		display: inline-block;
	}

	.message-link {
		color: #2563eb;
		text-decoration: underline;
		word-break: break-all;
	}
	.mr-card-wrapper {
		margin: 6px 0;
	}

</style>
