<script lang="ts">
	import { onDestroy, type Snippet } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { SpinMode, type SpinActivity, type SpinDirection } from '$lib/types/room-activity';
	import {
		createSpinActivity,
		getSpinDuration,
		isSpinActivityExpired,
		normalizeSpinActivity
	} from './spin';

	let { children }: { children: Snippet } = $props();

	type QueuedSpin = {
		activity: SpinActivity;
		combo: number;
	};

	const COMBO_WINDOW_MS = 2000;
	const MAX_QUEUE_SIZE = 2;
	const MAX_SEEN_ACTIVITY_IDS = 64;
	type SpinStep = readonly [
		offset: number,
		turns: number,
		scale: number,
		tiltY?: number,
		easing?: string
	];
	const CLASSIC_STEPS: readonly SpinStep[] = [
		[0, 0, 1],
		[0.08, -5 / 360, 0.97, 0, 'ease-in'],
		[0.45, 185 / 360, 0.84, 0, 'ease-in-out'],
		[0.82, 372 / 360, 0.96, 0, 'cubic-bezier(.16,1,.3,1)'],
		[0.92, 357 / 360, 1.01],
		[1, 1, 1]
	];
	const MODE_STEPS: Record<SpinMode, readonly SpinStep[]> = {
		[SpinMode.CLASSIC]: CLASSIC_STEPS,
		[SpinMode.REVERSE]: CLASSIC_STEPS,
		[SpinMode.FAKEOUT]: [
			[0, 0, 1, 0, 'ease-out'],
			[0.13, -16 / 360, 0.97, 0, 'ease-in'],
			[0.3, 38 / 360, 0.91, 0, 'ease-in'],
			[0.78, 374 / 360, 0.88, 0, 'cubic-bezier(.16,1,.3,1)'],
			[0.92, 356 / 360, 1.01],
			[1, 1, 1]
		],
		[SpinMode.CARD]: [
			[0, 0, 1],
			[0.14, -5 / 360, 0.95, 15, 'ease-in'],
			[0.5, 190 / 360, 0.82, -12, 'ease-in-out'],
			[0.86, 370 / 360, 0.97, 3],
			[1, 1, 1]
		],
		[SpinMode.GRAVITY]: [
			[0, 0, 1],
			[0.12, -5 / 360, 0.96, 0, 'ease-in'],
			[0.46, 170 / 360, 0.8, 0, 'cubic-bezier(.55,.06,.68,.19)'],
			[0.82, 376 / 360, 0.94, 0, 'cubic-bezier(.16,1,.3,1)'],
			[0.93, 357 / 360, 1.01],
			[1, 1, 1]
		]
	};

	let layer: HTMLDivElement;
	let ring: HTMLDivElement;
	let activeAnimation: Animation | null = null;
	let ringAnimation: Animation | null = null;
	let queue: QueuedSpin[] = [];
	let combo = 0;
	let lastTriggerAt = 0;
	let isResetting = false;
	const seenActivityIds = new SvelteSet<string>();

	function rememberActivity(activityId: string) {
		seenActivityIds.add(activityId);
		if (seenActivityIds.size <= MAX_SEEN_ACTIVITY_IDS) return;

		const oldestActivityId = seenActivityIds.values().next().value;
		if (typeof oldestActivityId === 'string') seenActivityIds.delete(oldestActivityId);
	}

	function nextCombo(now: number) {
		combo = now - lastTriggerAt <= COMBO_WINDOW_MS ? Math.min(combo + 1, 4) : 1;
		lastTriggerAt = now;
		return combo;
	}

	function createKeyframes(
		mode: SpinMode,
		direction: SpinDirection,
		comboLevel: number
	): Keyframe[] {
		const rounds = comboLevel >= 3 ? 2 : 1;
		return MODE_STEPS[mode].map(([offset, turns, scale, tiltY = 0, easing]) => {
			const frame: Keyframe = {
				offset,
				transform: `${mode === SpinMode.CARD ? 'perspective(1100px) ' : ''}${
					tiltY ? `rotateY(${tiltY * direction}deg) ` : ''
				}rotate(${turns * 360 * rounds * direction}deg) scale(${scale})`
			};
			if (easing) frame.easing = easing;
			return frame;
		});
	}

	function animateRing(duration: number, strong = false) {
		ringAnimation?.cancel();
		ringAnimation = ring.animate(
			[
				{ opacity: 0, transform: 'scale(.985)' },
				{ opacity: strong ? 0.7 : 0.45, transform: 'scale(1)', offset: 0.28 },
				{ opacity: 0, transform: 'scale(1.015)' }
			],
			{
				duration,
				easing: 'cubic-bezier(.22,1,.36,1)'
			}
		);
		ringAnimation.onfinish = () => {
			ringAnimation = null;
		};
	}

	function finishAnimation(animation: Animation) {
		if (activeAnimation !== animation) return;
		activeAnimation = null;
		layer.style.removeProperty('transform');
		layer.style.removeProperty('filter');

		if (isResetting) return;
		const next = queue.shift();
		if (next) start(next.activity, next.combo, 0);
	}

	function start(activity: SpinActivity, comboLevel: number, elapsed: number) {
		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const baseDuration = getSpinDuration(activity.mode);
		const duration =
			comboLevel === 2
				? Math.round(baseDuration / 1.15)
				: comboLevel === 3
					? baseDuration + 450
					: comboLevel >= 4
						? baseDuration + 800
						: baseDuration;

		if (reducedMotion) {
			const reducedDuration = 650;
			animateRing(reducedDuration, true);
			activeAnimation = layer.animate(
				[
					{ transform: 'scale(1)' },
					{ transform: 'scale(1.01)', offset: 0.45 },
					{ transform: 'scale(1)' }
				],
				{ duration: reducedDuration, easing: 'ease-in-out' }
			);
		} else {
			if (comboLevel >= 4) animateRing(Math.min(duration, 900), true);
			activeAnimation = layer.animate(
				createKeyframes(activity.mode, activity.direction, comboLevel),
				{
					duration,
					easing: 'linear'
				}
			);
		}

		const animation = activeAnimation;
		animation.currentTime = Math.min(Math.max(elapsed, 0), Math.max(0, duration - 1));
		animation.onfinish = () => finishAnimation(animation);
		animation.oncancel = () => {
			if (activeAnimation === animation) activeAnimation = null;
		};
	}

	function play(activity: SpinActivity): boolean {
		if (seenActivityIds.has(activity.activityId)) return false;
		rememberActivity(activity.activityId);

		const now = Date.now();
		if (isSpinActivityExpired(activity, now)) return false;

		const comboLevel = nextCombo(now);
		if (activeAnimation) {
			if (queue.length < MAX_QUEUE_SIZE) {
				queue.push({ activity, combo: comboLevel });
			} else {
				animateRing(500, true);
			}
			return true;
		}

		start(activity, comboLevel, Math.max(0, now - activity.startedAt));
		return true;
	}

	function playPayload(payload: unknown): boolean {
		const activity = normalizeSpinActivity(payload);
		return activity ? play(activity) : false;
	}

	function trigger(): SpinActivity {
		const activity = createSpinActivity();
		play(activity);
		return activity;
	}

	function reset() {
		isResetting = true;
		activeAnimation?.cancel();
		ringAnimation?.cancel();
		activeAnimation = null;
		ringAnimation = null;
		queue = [];
		combo = 0;
		lastTriggerAt = 0;
		seenActivityIds.clear();
		layer?.style.removeProperty('transform');
		layer?.style.removeProperty('filter');
		isResetting = false;
	}

	export { play, playPayload, reset, trigger };

	onDestroy(reset);
</script>

<div class="bg-background relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
	<div
		bind:this={layer}
		class="relative isolate flex min-h-0 min-w-0 flex-1 origin-center transform-gpu flex-col overflow-hidden"
	>
		{@render children()}
	</div>
	<div
		bind:this={ring}
		aria-hidden="true"
		class="pointer-events-none absolute inset-2 z-[60] rounded-xl border-2 border-cyan-300/70 opacity-0 shadow-[inset_0_0_22px_rgba(34,211,238,.16),0_0_24px_rgba(168,85,247,.22)]"
	></div>
</div>
