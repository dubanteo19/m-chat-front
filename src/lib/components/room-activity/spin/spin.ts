import {
	RoomActivityType,
	SpinMode,
	type RoomActivityVariant,
	type SpinActivity
} from '$lib/types/room-activity';

const SPIN_VARIANTS = [
	{ variant: SpinMode.CLASSIC, weight: 35, duration: 2100 },
	{ variant: SpinMode.FAKEOUT, weight: 20, duration: 2000 },
	{ variant: SpinMode.REVERSE, weight: 15, duration: 1900 },
	{ variant: SpinMode.CARD, weight: 15, duration: 2300 },
	{ variant: SpinMode.GRAVITY, weight: 15, duration: 2200 }
] as const satisfies readonly RoomActivityVariant<SpinMode>[];

const SPIN_MODES = new Set<SpinMode>(Object.values(SpinMode));

function randomFromSeed(seed: number) {
	let state = seed >>> 0 || 1;
	return () => {
		state += 0x6d2b79f5;
		let value = state;
		value = Math.imul(value ^ (value >>> 15), value | 1);
		value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
		return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
	};
}

export function selectSpinMode(seed: number): SpinMode {
	let roll = randomFromSeed(seed)() * 100;
	for (const variant of SPIN_VARIANTS) {
		roll -= variant.weight;
		if (roll < 0) return variant.variant;
	}
	return SpinMode.GRAVITY;
}

function createSeed() {
	return typeof crypto !== 'undefined' && crypto.getRandomValues
		? crypto.getRandomValues(new Uint32Array(1))[0]
		: Date.now() >>> 0;
}

export function createSpinActivity(startedAt = Date.now()): SpinActivity {
	const seed = createSeed();
	const mode = selectSpinMode(seed);
	const direction = mode === SpinMode.REVERSE || randomFromSeed(seed ^ 0x9e3779b9)() < 0.5 ? -1 : 1;

	return {
		activity: RoomActivityType.SPIN,
		activityId:
			typeof crypto !== 'undefined' && crypto.randomUUID
				? crypto.randomUUID()
				: `spin-${startedAt}-${seed}`,
		seed,
		startedAt,
		mode,
		direction
	};
}

export function isSpinCommand(content: string): boolean {
	return /^\/spin\s*$/i.test(content.trim());
}

export function getSpinDuration(mode: SpinMode): number {
	return SPIN_VARIANTS.find((variant) => variant.variant === mode)?.duration ?? 0;
}

export function isSpinActivityExpired(activity: SpinActivity, now = Date.now()): boolean {
	return now - activity.startedAt > getSpinDuration(activity.mode) + 150;
}

export function normalizeSpinActivity(payload: unknown): SpinActivity | null {
	if (!payload || typeof payload !== 'object') return null;
	const value = payload as Record<string, unknown>;

	if (
		value.activity !== RoomActivityType.SPIN ||
		typeof value.activityId !== 'string' ||
		!value.activityId ||
		typeof value.seed !== 'number' ||
		!Number.isFinite(value.seed) ||
		typeof value.startedAt !== 'number' ||
		!Number.isFinite(value.startedAt) ||
		typeof value.mode !== 'string' ||
		!SPIN_MODES.has(value.mode as SpinMode) ||
		(value.direction !== -1 && value.direction !== 1)
	) {
		return null;
	}

	return {
		activity: RoomActivityType.SPIN,
		activityId: value.activityId,
		seed: value.seed >>> 0,
		startedAt: value.startedAt,
		mode: value.mode as SpinMode,
		direction: value.direction
	};
}
