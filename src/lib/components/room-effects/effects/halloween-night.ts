type AnomalyKind =
	| 'signal'
	| 'presence'
	| 'listener'
	| 'resident'
	| 'stare'
	| 'weeping'
	| 'ceiling'
	| 'press';

type ChainOpener = 'listener' | 'stare' | 'ceiling';
type ChainStrike = 'resident' | 'weeping' | 'press';
type FlashbackImage = 'strike' | 'weeping' | 'press';

type SceneImage =
	| 'corridor'
	| 'presence'
	| 'resident'
	| 'scream'
	| 'strike'
	| 'stare'
	| 'weeping'
	| 'ceiling'
	| 'press';

type GlitchTrait =
	| 'chromatic'
	| 'horizontal'
	| 'vertical'
	| 'blocks'
	| 'smear'
	| 'noise'
	| 'sync'
	| 'scanline'
	| 'pulse'
	| 'red';

type GlitchProfile = {
	intensity: number;
	rgbSplit: number;
	tearing: number;
	blocks: number;
	scanlines: number;
	smear: number;
	jitter: number;
	verticalTear: number;
	frameSlip: number;
	noise: number;
	pulse: number;
	red: number;
	darken: number;
	luminance: number;
	blackout: boolean;
};

type GlitchRegion = {
	x: number;
	y: number;
	width: number;
	height: number;
};

const ASSET_PATHS: Record<SceneImage, string> = {
	corridor: '/room-effects/halloween-night/corridor.webp',
	presence: '/room-effects/halloween-night/presence.webp',
	resident: '/room-effects/halloween-night/resident-close.webp',
	scream: '/room-effects/halloween-night/resident-scream.webp',
	strike: '/room-effects/halloween-night/resident-glitch.webp',
	stare: '/room-effects/halloween-night/resident-stare.webp',
	weeping: '/room-effects/halloween-night/resident-weeping.webp',
	ceiling: '/room-effects/halloween-night/resident-ceiling.webp',
	press: '/room-effects/halloween-night/resident-press.webp'
};

const ANOMALY_DURATIONS: Record<AnomalyKind, number> = {
	signal: 1.6,
	presence: 2.4,
	listener: 3.2,
	resident: 1.75,
	stare: 2.8,
	weeping: 2.35,
	ceiling: 3,
	press: 1.8
};

const IMPACT_FREEZE_PROGRESS: Partial<Record<AnomalyKind, number>> = {
	listener: 0.72,
	resident: 0.17,
	stare: 0.61,
	weeping: 0.22,
	press: 0.23
};

const CROSS_CHAIN_STRIKES: Record<ChainOpener, ChainStrike[]> = {
	listener: ['weeping', 'press'],
	stare: ['resident', 'press'],
	ceiling: ['resident', 'weeping']
};

const FLASHBACK_IMAGES: FlashbackImage[] = ['strike', 'weeping', 'press'];

const GLITCH_TRAITS: GlitchTrait[] = [
	'chromatic',
	'horizontal',
	'vertical',
	'blocks',
	'smear',
	'noise',
	'sync',
	'scanline',
	'pulse',
	'red'
];

const TAU = Math.PI * 2;

export class HalloweenNight {
	private ctx: CanvasRenderingContext2D;
	private sceneCanvas: HTMLCanvasElement;
	private sceneCtx: CanvasRenderingContext2D;
	private width = 0;
	private height = 0;
	private dpr = 1;
	private frame = 0;
	private lastFrame = 0;
	private time = 0;
	private running = false;
	private reducedMotion = false;
	private images = new Map<SceneImage, HTMLImageElement>();
	private currentAnomaly: AnomalyKind | null = null;
	private previousAnomaly: AnomalyKind | null = null;
	private anomalyTime = 0;
	private anomalyDuration = 0;
	private impactFreezeDuration = 0;
	private nextAnomaly = 4.5;
	private queuedAnomaly: AnomalyKind | null = null;
	private flashbackTime = 0;
	private flashbackDuration = 0;
	private nextFlashback = 12;
	private flashbackImage: FlashbackImage = 'strike';
	private recentFlashbackImage: FlashbackImage | null = null;
	private flashbackGlitchTraits: GlitchTrait[] = [];
	private ambientTime = 0;
	private nextAmbient = 2.8;
	private ambientGlitchTraits: GlitchTrait[] = [];
	private ambientGlitchRegion: GlitchRegion | null = null;
	private anomalyGlitchTraits: GlitchTrait[] = [];
	private glitchPhase = 0;
	private glitchRate = 8;
	private randomState: number;

	constructor(
		private canvas: HTMLCanvasElement,
		seed = Date.now()
	) {
		const context = canvas.getContext('2d');
		if (!context) throw new Error('Canvas not supported');
		const sceneCanvas = document.createElement('canvas');
		const sceneContext = sceneCanvas.getContext('2d');
		if (!sceneContext) throw new Error('Canvas not supported');

		this.ctx = context;
		this.sceneCanvas = sceneCanvas;
		this.sceneCtx = sceneContext;
		this.randomState = seed >>> 0 || 1;
		this.nextFlashback = 12 + this.random() * 14;
		this.reducedMotion =
			typeof window.matchMedia === 'function' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		this.preloadImages();
		this.resize();
		window.addEventListener('resize', this.resize);
		document.addEventListener('visibilitychange', this.onVisibilityChange);
	}

	public start = () => {
		if (this.running) return;
		this.running = true;
		this.lastFrame = performance.now();
		this.frame = requestAnimationFrame(this.loop);
	};

	public destroy = () => {
		this.running = false;
		cancelAnimationFrame(this.frame);
		window.removeEventListener('resize', this.resize);
		document.removeEventListener('visibilitychange', this.onVisibilityChange);
		this.images.clear();
		this.ctx.clearRect(0, 0, this.width, this.height);
		this.sceneCtx.clearRect(0, 0, this.width, this.height);
	};

	public activity(_kind: 'message' | 'reaction') {
		// Room activity deliberately does not trigger scares.
	}

	private preloadImages() {
		for (const [name, path] of Object.entries(ASSET_PATHS) as [SceneImage, string][]) {
			const image = new Image();
			image.decoding = 'async';
			image.src = path;
			this.images.set(name, image);
		}
	}

	private onVisibilityChange = () => {
		if (document.hidden) {
			cancelAnimationFrame(this.frame);
			return;
		}

		if (this.running) {
			this.lastFrame = performance.now();
			this.frame = requestAnimationFrame(this.loop);
		}
	};

	private resize = () => {
		this.width = this.canvas.clientWidth;
		this.height = this.canvas.clientHeight;
		this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
		this.canvas.width = Math.round(this.width * this.dpr);
		this.canvas.height = Math.round(this.height * this.dpr);
		this.sceneCanvas.width = Math.max(1, Math.round(this.width));
		this.sceneCanvas.height = Math.max(1, Math.round(this.height));
		this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
		this.sceneCtx.setTransform(1, 0, 0, 1, 0, 0);
	};

	private loop = (now: number) => {
		if (!this.running || document.hidden) return;

		const delta = Math.min((now - this.lastFrame) / 1000, 0.05);
		this.lastFrame = now;
		this.time += delta;
		this.update(delta);
		this.draw();
		this.frame = requestAnimationFrame(this.loop);
	};

	private update(delta: number) {
		if (this.ambientTime > 0) {
			this.ambientTime = Math.max(0, this.ambientTime - delta);
			if (this.ambientTime === 0) this.ambientGlitchRegion = null;
		} else {
			this.nextAmbient -= delta;
			if (this.nextAmbient <= 0) {
				this.ambientTime = this.reducedMotion ? 0.16 : 0.24 + this.random() * 0.2;
				this.nextAmbient = 3.5 + this.random() * 6;
				if (!this.reducedMotion && this.random() < 0.72) {
					const width = 0.12 + this.random() * 0.22;
					const height = 0.08 + this.random() * 0.18;
					this.ambientGlitchRegion = {
						x: this.random() * (1 - width),
						y: this.random() * (1 - height),
						width,
						height
					};
				} else {
					this.ambientGlitchRegion = null;
				}
				this.ambientGlitchTraits = this.pickGlitchTraits(
					1 + Math.floor(this.random() * 3),
					['chromatic', 'horizontal', 'vertical', 'blocks', 'noise', 'scanline', 'pulse']
				);
				this.rollGlitchCadence();
			}
		}

		if (this.flashbackTime > 0) {
			this.flashbackTime = Math.min(this.flashbackDuration, this.flashbackTime + delta);
			if (this.flashbackTime >= this.flashbackDuration) this.endFlashback();
			return;
		}

		if (this.currentAnomaly) {
			this.anomalyTime += delta;
			if (this.anomalyTime >= this.anomalyDuration) this.endAnomaly();
			return;
		}

		if (!this.reducedMotion && !this.queuedAnomaly) {
			this.nextFlashback -= delta;
			if (this.nextFlashback <= 0) {
				this.beginFlashback();
				return;
			}
		}

		this.nextAnomaly -= delta;
		if (this.nextAnomaly <= 0) this.beginAnomaly();
	}

	private beginAnomaly() {
		let kind: AnomalyKind;
		if (this.queuedAnomaly) {
			kind = this.queuedAnomaly;
			this.queuedAnomaly = null;
		} else if (this.reducedMotion) {
			kind = 'presence';
		} else {
			const roll = this.random();
			kind =
				roll < 0.16
					? 'signal'
					: roll < 0.38
						? 'presence'
						: roll < 0.54
							? 'listener'
							: roll < 0.63
								? 'resident'
								: roll < 0.74
									? 'stare'
									: roll < 0.84
										? 'weeping'
										: roll < 0.93
											? 'ceiling'
											: 'press';
		}

		if (kind === this.previousAnomaly) kind = 'presence';
		this.currentAnomaly = kind;
		this.previousAnomaly = kind;
		this.anomalyTime = 0;
		this.impactFreezeDuration =
			!this.reducedMotion && IMPACT_FREEZE_PROGRESS[kind] !== undefined
				? 0.05 + this.random() * 0.04
				: 0;
		this.anomalyDuration = ANOMALY_DURATIONS[kind] + this.impactFreezeDuration;
		this.rollAnomalyGlitchRecipe(kind);
		if (kind === 'resident') this.recentFlashbackImage = 'strike';
		else if (kind === 'weeping') this.recentFlashbackImage = 'weeping';
		else if (kind === 'press') this.recentFlashbackImage = 'press';
	}

	private beginFlashback() {
		const useRecent = this.recentFlashbackImage !== null && this.random() < 0.72;
		this.flashbackImage = useRecent
			? (this.recentFlashbackImage ?? 'strike')
			: (FLASHBACK_IMAGES[Math.floor(this.random() * FLASHBACK_IMAGES.length)] ?? 'strike');
		this.flashbackTime = Number.EPSILON;
		this.flashbackDuration = 0.22 + this.random() * 0.16;
		this.flashbackGlitchTraits = this.pickGlitchTraits(
			5 + Math.floor(this.random() * 3),
			GLITCH_TRAITS
		);
		this.ambientTime = 0;
		this.ambientGlitchRegion = null;
		this.nextAmbient = this.flashbackDuration + 1.4;
		this.rollGlitchCadence();
	}

	private endFlashback() {
		this.flashbackTime = 0;
		this.flashbackDuration = 0;
		this.flashbackGlitchTraits = [];
		this.nextFlashback = 18 + this.random() * 20;
		this.nextAnomaly = Math.max(this.nextAnomaly, 1.8 + this.random() * 1.6);
	}

	private endAnomaly() {
		const finishedAnomaly = this.currentAnomaly;
		const wasHardScare =
			finishedAnomaly === 'resident' ||
			finishedAnomaly === 'weeping' ||
			finishedAnomaly === 'press';
		const crossChainStrikes =
			finishedAnomaly === 'listener' ||
			finishedAnomaly === 'stare' ||
			finishedAnomaly === 'ceiling'
				? CROSS_CHAIN_STRIKES[finishedAnomaly]
				: null;
		const queueRareStrike =
			!this.reducedMotion && crossChainStrikes !== null && this.random() < 0.05;
		this.currentAnomaly = null;
		this.anomalyGlitchTraits = [];
		this.anomalyTime = 0;
		this.impactFreezeDuration = 0;

		if (queueRareStrike && crossChainStrikes) {
			this.queuedAnomaly =
				crossChainStrikes[Math.floor(this.random() * crossChainStrikes.length)] ?? 'resident';
			this.nextAnomaly = 2.4 + this.random() * 1.8;
			this.ambientTime = 0;
			this.nextAmbient = this.nextAnomaly + 1;
			return;
		}

		this.nextAnomaly = wasHardScare ? 7 + this.random() * 5 : 3 + this.random() * 4;
	}

	private getAnomalyProgress() {
		if (!this.currentAnomaly) return 0;
		const baseDuration = ANOMALY_DURATIONS[this.currentAnomaly];
		const freezeProgress = IMPACT_FREEZE_PROGRESS[this.currentAnomaly];
		if (freezeProgress === undefined || this.impactFreezeDuration <= 0) {
			return this.clamp(this.anomalyTime / baseDuration, 0, 1);
		}

		const freezeStart = baseDuration * freezeProgress;
		if (this.anomalyTime < freezeStart) {
			return this.clamp(this.anomalyTime / baseDuration, 0, freezeProgress);
		}
		if (this.anomalyTime < freezeStart + this.impactFreezeDuration) return freezeProgress;
		return this.clamp(
			(this.anomalyTime - this.impactFreezeDuration) / baseDuration,
			freezeProgress,
			1
		);
	}

	private isImpactFreezeActive() {
		if (!this.currentAnomaly || this.impactFreezeDuration <= 0) return false;
		const freezeProgress = IMPACT_FREEZE_PROGRESS[this.currentAnomaly];
		if (freezeProgress === undefined) return false;
		const freezeStart = ANOMALY_DURATIONS[this.currentAnomaly] * freezeProgress;
		return (
			this.anomalyTime >= freezeStart &&
			this.anomalyTime < freezeStart + this.impactFreezeDuration
		);
	}

	private draw() {
		const output = this.ctx;
		const glitch = this.getGlitchProfile();
		const localGlitchRegion = this.currentAnomaly ? null : this.ambientGlitchRegion;
		this.ctx = this.sceneCtx;
		this.sceneCtx.clearRect(0, 0, this.width, this.height);
		this.drawCorridor();
		this.drawAnomaly();
		this.drawFlashback();
		this.drawReadabilityVeil();
		this.drawVignette();

		this.ctx = output;
		output.clearRect(0, 0, this.width, this.height);

		if (glitch.blackout && !this.reducedMotion) {
			output.fillStyle = '#010203';
			output.fillRect(0, 0, this.width, this.height);
			this.drawFilmGrain();
			return;
		}

		const jitterX =
			this.reducedMotion || localGlitchRegion
				? 0
				: (this.random() - 0.5) * glitch.jitter * 18;
		const jitterY =
			this.reducedMotion || localGlitchRegion
				? 0
				: (this.random() - 0.5) * glitch.jitter * 13;
		output.save();
		output.globalAlpha = localGlitchRegion
			? 1
			: 1 - this.random() * glitch.luminance * 0.16;
		output.drawImage(this.sceneCanvas, jitterX, jitterY, this.width, this.height);
		output.restore();

		if (glitch.intensity > 0 && !this.reducedMotion) {
			if (localGlitchRegion) this.drawLocalizedSignalDamage(glitch, localGlitchRegion);
			else this.drawSignalDamage(glitch);
		}
		if (glitch.darken > 0) {
			output.fillStyle = `rgba(0,1,2,${glitch.darken})`;
			output.fillRect(0, 0, this.width, this.height);
		}
		this.drawFilmGrain();
	}

	private drawCorridor() {
		const image = this.getReadyImage('corridor');
		if (!image) {
			const fallback = this.ctx.createLinearGradient(0, 0, 0, this.height);
			fallback.addColorStop(0, '#10191b');
			fallback.addColorStop(1, '#030708');
			this.ctx.fillStyle = fallback;
			this.ctx.fillRect(0, 0, this.width, this.height);
			return;
		}

		const flicker = this.reducedMotion ? 0 : Math.max(0, Math.sin(this.time * 0.73 - 1.2)) * 0.014;
		const breathing = this.reducedMotion ? 1 : 1 + Math.sin(this.time * 0.075) * 0.003;
		this.ctx.save();
		this.ctx.globalAlpha = 0.87 + flicker;
		this.drawCover(image, breathing);
		this.ctx.restore();

		const cold = this.ctx.createLinearGradient(0, 0, this.width, this.height);
		cold.addColorStop(0, 'rgba(5,18,21,.32)');
		cold.addColorStop(0.55, 'rgba(2,8,11,.08)');
		cold.addColorStop(1, 'rgba(2,5,7,.43)');
		this.ctx.fillStyle = cold;
		this.ctx.fillRect(0, 0, this.width, this.height);
	}

	private drawAnomaly() {
		if (!this.currentAnomaly) return;
		if (this.currentAnomaly === 'signal') return;

		const progress = this.getAnomalyProgress();
		if (this.currentAnomaly === 'resident') {
			this.drawResident(progress);
			return;
		}
		if (this.currentAnomaly === 'stare') {
			this.drawStare(progress);
			return;
		}
		if (this.currentAnomaly === 'weeping') {
			this.drawWeeping(progress);
			return;
		}
		if (this.currentAnomaly === 'ceiling') {
			this.drawCeiling(progress);
			return;
		}
		if (this.currentAnomaly === 'press') {
			this.drawPress(progress);
			return;
		}

		const fade = this.smoothstep(0, 0.14, progress) * (1 - this.smoothstep(0.72, 1, progress));
		if (fade <= 0) return;

		if (this.currentAnomaly === 'presence') {
			const image = this.getReadyImage('presence');
			const corridor = this.getReadyImage('corridor');
			if (!image || !corridor) return;
			const anchor = this.mapCoverPoint(corridor, 0.405, 0.615);
			const pulse = this.reducedMotion ? 1 : 0.94 + Math.sin(this.time * 7.4) * 0.06;
			const height = Math.max(76, this.height * 0.235 * pulse);
			const drift = this.reducedMotion ? 0 : Math.sin(this.time * 2.1) * 1.8;
			this.drawSprite(image, anchor.x + drift, anchor.y, height, fade * 0.62);
			return;
		}

		if (this.currentAnomaly === 'listener') {
			if (progress >= 0.72) {
				if (progress < 0.88) this.drawCloseScream(progress);
				return;
			}

			const image = this.getReadyImage('resident');
			if (!image) return;
			const wrongMoment = !this.reducedMotion && progress > 0.62 && progress < 0.75;
			const approach = this.easeOutCubic(this.clamp((progress - 0.06) / 0.42, 0, 1));
			const x =
				this.width * (0.72 - approach * 0.08) +
				(wrongMoment ? (this.random() - 0.5) * 7 : 0);
			const height = this.height * (0.56 + approach * (wrongMoment ? 0.43 : 0.36));
			this.ctx.save();
			this.ctx.filter = wrongMoment
				? 'contrast(1.48) saturate(.82)'
				: 'contrast(1.14) saturate(.9)';
			this.drawSprite(image, x, this.height * 1.04, height, fade * (wrongMoment ? 0.94 : 0.7));
			this.ctx.restore();
			return;
		}
	}

	private drawCloseScream(progress: number) {
		const image = this.getReadyImage('scream');
		if (!image) return;

		const frozen = this.isImpactFreezeActive();
		const localProgress = this.clamp((progress - 0.72) / 0.16, 0, 1);
		const fade = 1 - this.smoothstep(0.82, 0.88, progress);
		const jitter = frozen ? 0 : 4 + Math.sin(localProgress * Math.PI) * 8;
		const x = (this.random() - 0.5) * jitter;
		const y = (this.random() - 0.5) * jitter;
		const scale = 1.04 + localProgress * 0.08;

		this.ctx.save();
		this.ctx.globalAlpha = fade;
		this.ctx.filter = 'contrast(1.48) saturate(.94)';
		this.drawCover(image, scale, x, y);
		this.ctx.restore();
	}

	private drawResident(progress: number) {
		const image = this.getReadyImage('strike');
		if (!image || progress < 0.17) return;

		const frozen = this.isImpactFreezeActive();
		const approach = this.easeOutCubic(this.clamp((progress - 0.17) / 0.16, 0, 1));
		const fade = 1 - this.smoothstep(0.82, 1, progress);
		const jitter = frozen ? 0 : progress > 0.2 && progress < 0.78 ? 7 : 0.8;
		const x = (this.random() - 0.5) * jitter;
		const y = (this.random() - 0.5) * jitter;
		const scale = 1.01 + approach * 0.1;

		this.ctx.save();
		this.ctx.globalAlpha = fade;
		this.ctx.filter = progress > 0.22 ? 'contrast(1.38) saturate(.9)' : 'contrast(1.18) saturate(.78)';
		this.drawCover(image, scale, x, y);
		this.ctx.restore();

		if (progress > 0.55 && progress < 0.73) {
			this.ctx.fillStyle = `rgba(0,3,4,${0.2 + this.random() * 0.34})`;
			this.ctx.fillRect(0, 0, this.width, this.height);
		}
	}

	private drawStare(progress: number) {
		const image = this.getReadyImage('stare');
		if (!image) return;

		const frozen = this.isImpactFreezeActive();
		const attack = this.smoothstep(0.02, 0.16, progress);
		const release = 1 - this.smoothstep(0.8, 1, progress);
		const approach = this.easeOutCubic(this.clamp((progress - 0.04) / 0.58, 0, 1));
		const snap =
			this.smoothstep(0.56, 0.61, progress) * (1 - this.smoothstep(0.69, 0.75, progress));
		const flicker = progress > 0.78 && !this.reducedMotion && this.random() < 0.24 ? 0.16 : 1;
		const height = this.height * (0.68 + approach * 0.2 + snap * 0.12);
		const width = height * (image.naturalWidth / image.naturalHeight);
		const x = this.width * (-0.2 + approach * 0.43 + snap * 0.035);
		const y = this.height * (1.04 + Math.sin(this.time * 3.2) * 0.004);
		const rotation =
			(frozen ? -1.2 : -2.5 + Math.sin(this.time * 5.3) * (0.6 + snap * 1.4)) *
			(Math.PI / 180);

		this.ctx.save();
		this.ctx.translate(x, y);
		this.ctx.rotate(rotation);
		this.ctx.globalAlpha = attack * release * flicker * 0.92;
		this.ctx.filter = snap > 0.1 ? 'contrast(1.55) saturate(.75)' : 'contrast(1.25) saturate(.82)';
		this.ctx.drawImage(image, -width / 2, -height, width, height);
		this.ctx.restore();
	}

	private drawWeeping(progress: number) {
		const image = this.getReadyImage('weeping');
		if (!image || progress < 0.1) return;

		const frozen = this.isImpactFreezeActive();
		const attack = this.smoothstep(0.1, 0.22, progress);
		const release = 1 - this.smoothstep(0.84, 1, progress);
		const firstSpasm =
			this.smoothstep(0.38, 0.43, progress) * (1 - this.smoothstep(0.5, 0.56, progress));
		const secondSpasm =
			this.smoothstep(0.63, 0.68, progress) * (1 - this.smoothstep(0.75, 0.8, progress));
		const spasm = Math.max(firstSpasm, secondSpasm);
		const jitter = this.reducedMotion || frozen ? 0 : 1.5 + spasm * 9;
		const x = (this.random() - 0.5) * jitter;
		const y = (this.random() - 0.5) * jitter;
		const breathing = this.reducedMotion || frozen ? 0 : Math.sin(this.time * 5.6) * 0.012;
		const scale = 1.03 + progress * 0.07 + breathing + spasm * 0.055;

		this.ctx.save();
		this.ctx.globalAlpha = attack * release;
		this.ctx.filter = spasm > 0.1 ? 'contrast(1.62) saturate(.72)' : 'contrast(1.34) saturate(.82)';
		this.drawCover(image, scale, x, y);
		this.ctx.restore();
	}

	private drawCeiling(progress: number) {
		const image = this.getReadyImage('ceiling');
		if (!image) return;

		const attack = this.smoothstep(0.02, 0.14, progress);
		const release = 1 - this.smoothstep(0.84, 1, progress);
		const descent = this.easeOutCubic(this.clamp((progress - 0.03) / 0.5, 0, 1));
		const retreat = this.smoothstep(0.76, 0.94, progress);
		const height = this.height * (0.84 + descent * 0.08);
		const width = height * (image.naturalWidth / image.naturalHeight);
		const sway = this.reducedMotion ? 0 : Math.sin(this.time * 2.4) * this.width * 0.006;
		const x = this.width * 0.72 + sway;
		const top = -height * (0.94 - descent * 0.78 + retreat * 0.82);
		const twitch =
			this.reducedMotion || progress < 0.5 ? 0 : (this.random() - 0.5) * retreat * 1.8;
		const rotation = (Math.sin(this.time * 3.8) * 0.75 + twitch) * (Math.PI / 180);

		this.ctx.save();
		this.ctx.translate(x, top + height / 2);
		this.ctx.rotate(rotation);
		this.ctx.globalAlpha = attack * release * 0.94;
		this.ctx.filter = retreat > 0.08 ? 'contrast(1.5) saturate(.72)' : 'contrast(1.24) saturate(.84)';
		this.ctx.drawImage(image, -width / 2, -height / 2, width, height);
		this.ctx.restore();
	}

	private drawPress(progress: number) {
		const image = this.getReadyImage('press');
		if (!image || progress < 0.16) return;
		const frozen = this.isImpactFreezeActive();

		if (progress >= 0.85) {
			const ghost = 1 - this.smoothstep(0.85, 1, progress);
			this.ctx.save();
			this.ctx.globalCompositeOperation = 'screen';
			this.ctx.globalAlpha = ghost * 0.16;
			this.ctx.filter = 'sepia(1) saturate(8) hue-rotate(125deg) contrast(1.5)';
			this.drawCover(image, 1.1, -14 * ghost, 3 * ghost);
			this.ctx.filter = 'sepia(1) saturate(9) hue-rotate(305deg) contrast(1.6)';
			this.drawCover(image, 1.1, 16 * ghost, -2 * ghost);
			this.ctx.restore();
			return;
		}

		const attack = this.smoothstep(0.16, 0.23, progress);
		const firstStep = this.smoothstep(0.27, 0.31, progress);
		const secondStep = this.smoothstep(0.43, 0.47, progress);
		const firstImpact =
			this.smoothstep(0.27, 0.3, progress) * (1 - this.smoothstep(0.34, 0.39, progress));
		const secondImpact =
			this.smoothstep(0.43, 0.46, progress) * (1 - this.smoothstep(0.5, 0.55, progress));
		const impact = Math.max(firstImpact, secondImpact);
		const jitter = this.reducedMotion || frozen ? 0 : 2 + impact * 11;
		const x = (this.random() - 0.5) * jitter;
		const y = (this.random() - 0.5) * jitter;
		const scale = 1.015 + firstStep * 0.045 + secondStep * 0.055 + impact * 0.025;

		this.ctx.save();
		this.ctx.globalAlpha = attack;
		this.ctx.filter = impact > 0.1 ? 'contrast(1.72) saturate(.78)' : 'contrast(1.42) saturate(.86)';
		this.drawCover(image, scale, x, y);
		this.ctx.restore();
	}

	private drawSprite(
		image: HTMLImageElement,
		x: number,
		bottomY: number,
		height: number,
		alpha: number
	) {
		const width = height * (image.naturalWidth / image.naturalHeight);
		this.ctx.save();
		this.ctx.globalAlpha = alpha;
		this.ctx.drawImage(image, x - width / 2, bottomY - height, width, height);
		this.ctx.restore();
	}

	private drawFlashback() {
		if (this.flashbackTime <= 0 || this.flashbackDuration <= 0) return;
		const image = this.getReadyImage(this.flashbackImage);
		if (!image) return;

		const progress = this.flashbackTime / this.flashbackDuration;
		const attack = this.smoothstep(0, 0.08, progress);
		const release = 1 - this.smoothstep(0.7, 1, progress);
		const dropout = this.random() < 0.16 ? 0.18 : 1;
		const jitter = 3 + Math.sin(progress * Math.PI) * 12;
		const x = (this.random() - 0.5) * jitter;
		const y = (this.random() - 0.5) * jitter;
		const scale = 1.025 + progress * 0.115 + this.random() * 0.018;

		this.ctx.save();
		this.ctx.globalAlpha = attack * release * dropout;
		this.ctx.filter =
			progress < 0.52
				? 'contrast(1.7) saturate(.72) brightness(1.08)'
				: 'contrast(1.92) saturate(.62) brightness(.82)';
		this.drawCover(image, scale, x, y);
		this.ctx.restore();
	}

	private getGlitchProfile() {
		const base = this.getBaseGlitchProfile();
		if (
			this.reducedMotion ||
			this.isImpactFreezeActive() ||
			base.blackout ||
			base.intensity <= 0
		) {
			return base;
		}

		const traits =
			this.flashbackTime > 0
				? this.flashbackGlitchTraits
				: this.currentAnomaly
					? this.anomalyGlitchTraits
					: this.ambientGlitchTraits;
		return this.applyGlitchRecipe(base, traits);
	}

	private getBaseGlitchProfile(): GlitchProfile {
		const empty: GlitchProfile = {
			intensity: 0,
			rgbSplit: 0,
			tearing: 0,
			blocks: 0,
			scanlines: 0,
			smear: 0,
			jitter: 0,
			verticalTear: 0,
			frameSlip: 0,
			noise: 0,
			pulse: 0,
			red: 0,
			darken: 0,
			luminance: 0,
			blackout: false
		};
		if (this.reducedMotion) return empty;

		if (this.flashbackTime > 0 && this.flashbackDuration > 0) {
			const progress = this.flashbackTime / this.flashbackDuration;
			const blackout =
				progress < 0.035 || (progress >= 0.46 && progress < 0.52) || progress >= 0.94;
			if (blackout) return { ...empty, blackout: true };

			const envelope =
				this.smoothstep(0.035, 0.12, progress) *
				(1 - this.smoothstep(0.78, 0.94, progress));
			const impact = Math.max(0.78, envelope);
			return {
				...empty,
				intensity: impact,
				rgbSplit: 0.7 + impact * 0.26,
				tearing: 0.76 + impact * 0.22,
				blocks: 0.62 + impact * 0.32,
				scanlines: 0.68 + impact * 0.26,
				smear: 0.58 + impact * 0.36,
				jitter: 0.62 + impact * 0.32,
				verticalTear: 0.66 + impact * 0.3,
				frameSlip: 0.64 + impact * 0.32,
				noise: 0.72 + impact * 0.24,
				pulse: 0.64 + impact * 0.3,
				red: 0.58 + impact * 0.36,
				darken: 0.1 + impact * 0.1,
				luminance: 0.7 + impact * 0.24
			};
		}

		const ambient = this.ambientTime > 0 ? this.clamp(this.ambientTime / 0.44, 0, 1) : 0;
		if (!this.currentAnomaly) {
			if (ambient <= 0) return empty;
			return {
				...empty,
				intensity: ambient * 0.2,
				rgbSplit: ambient * 0.12,
				tearing: ambient * 0.08,
				blocks: ambient * 0.04,
				scanlines: ambient * 0.18,
				verticalTear: ambient * 0.04,
				noise: ambient * 0.08,
				pulse: ambient * 0.05,
				luminance: ambient * 0.12
			};
		}

		const progress = this.getAnomalyProgress();
		if (this.isImpactFreezeActive()) {
			return {
				...empty,
				intensity: 0.13,
				rgbSplit: 0.19,
				tearing: 0.05,
				blocks: 0.025,
				scanlines: 0.16,
				verticalTear: 0.035,
				noise: 0.045,
				pulse: 0.025,
				darken: 0.025,
				luminance: 0.035
			};
		}
		if (this.currentAnomaly === 'signal') {
			const attack = this.smoothstep(0, 0.22, progress);
			const hold = 1 - this.smoothstep(0.68, 1, progress);
			const peak = attack * hold;
			const fracture =
				this.smoothstep(0.28, 0.42, progress) * (1 - this.smoothstep(0.62, 0.76, progress));
			return {
				...empty,
				intensity: 0.18 + peak * 0.42,
				rgbSplit: 0.14 + peak * 0.4,
				tearing: 0.1 + peak * 0.46,
				blocks: 0.06 + fracture * 0.42,
				scanlines: 0.18 + peak * 0.34,
				smear: fracture * 0.16,
				jitter: fracture * 0.24,
				verticalTear: 0.12 + peak * 0.34,
				frameSlip: fracture * 0.46,
				noise: 0.16 + peak * 0.38,
				pulse: 0.1 + fracture * 0.34,
				darken: fracture * 0.09,
				luminance: 0.12 + peak * 0.28,
				red: 0
			};
		}

		if (this.currentAnomaly === 'presence') {
			const envelope =
				this.smoothstep(0, 0.13, progress) * (1 - this.smoothstep(0.68, 1, progress));
			return {
				...empty,
				intensity: 0.16 + envelope * 0.2,
				rgbSplit: 0.12 + envelope * 0.2,
				tearing: 0.08 + envelope * 0.16,
				blocks: envelope * 0.09,
				scanlines: 0.14 + envelope * 0.12,
				verticalTear: envelope * 0.08,
				noise: 0.05 + envelope * 0.08,
				pulse: envelope * 0.1,
				luminance: 0.08
			};
		}

		if (this.currentAnomaly === 'stare') {
			if (progress >= 0.62 && progress < 0.67) return { ...empty, blackout: true };

			const envelope =
				this.smoothstep(0, 0.16, progress) * (1 - this.smoothstep(0.8, 1, progress));
			const snap =
				this.smoothstep(0.54, 0.6, progress) * (1 - this.smoothstep(0.72, 0.78, progress));
			return {
				...empty,
				intensity: 0.22 + envelope * 0.2 + snap * 0.32,
				rgbSplit: 0.18 + snap * 0.46,
				tearing: 0.14 + snap * 0.5,
				blocks: 0.08 + snap * 0.38,
				scanlines: 0.2 + envelope * 0.16,
				smear: 0.06 + snap * 0.24,
				jitter: snap * 0.42,
				verticalTear: 0.12 + snap * 0.48,
				frameSlip: snap * 0.4,
				noise: 0.1 + snap * 0.34,
				pulse: 0.08 + snap * 0.28,
				red: snap * 0.22,
				darken: 0.03 + snap * 0.1,
				luminance: 0.1 + snap * 0.26
			};
		}

		if (this.currentAnomaly === 'weeping') {
			const firstDrop = progress >= 0.06 && progress < 0.1;
			const finalDrop = progress >= 0.78 && progress < 0.83;
			if (firstDrop || finalDrop) return { ...empty, blackout: true };

			const attack = this.smoothstep(0, 0.2, progress);
			const release = 1 - this.smoothstep(0.82, 1, progress);
			const firstSpasm =
				this.smoothstep(0.36, 0.42, progress) * (1 - this.smoothstep(0.5, 0.57, progress));
			const secondSpasm =
				this.smoothstep(0.61, 0.67, progress) * (1 - this.smoothstep(0.75, 0.8, progress));
			const spasm = Math.max(firstSpasm, secondSpasm);
			const collapse = attack * release;
			return {
				...empty,
				intensity: 0.42 + collapse * 0.3 + spasm * 0.25,
				rgbSplit: 0.38 + collapse * 0.26 + spasm * 0.3,
				tearing: 0.4 + collapse * 0.28 + spasm * 0.26,
				blocks: 0.28 + collapse * 0.25 + spasm * 0.34,
				scanlines: 0.42 + collapse * 0.28,
				smear: 0.26 + collapse * 0.24 + spasm * 0.34,
				jitter: 0.12 + spasm * 0.7,
				verticalTear: 0.34 + collapse * 0.28 + spasm * 0.3,
				frameSlip: 0.24 + spasm * 0.66,
				noise: 0.38 + collapse * 0.24 + spasm * 0.28,
				pulse: 0.3 + collapse * 0.26 + spasm * 0.38,
				red: 0.28 + collapse * 0.3 + spasm * 0.22,
				darken: 0.08 + spasm * 0.12,
				luminance: 0.32 + spasm * 0.42
			};
		}

		if (this.currentAnomaly === 'ceiling') {
			if (progress >= 0.72 && progress < 0.76) return { ...empty, blackout: true };

			const descent = this.smoothstep(0, 0.5, progress);
			const retreat = this.smoothstep(0.76, 0.94, progress);
			const envelope = descent * (1 - this.smoothstep(0.84, 1, progress));
			return {
				...empty,
				intensity: 0.18 + envelope * 0.24 + retreat * 0.28,
				rgbSplit: 0.14 + envelope * 0.2 + retreat * 0.34,
				tearing: 0.12 + retreat * 0.42,
				blocks: 0.06 + retreat * 0.34,
				scanlines: 0.2 + envelope * 0.16,
				smear: 0.08 + envelope * 0.18 + retreat * 0.3,
				jitter: retreat * 0.38,
				verticalTear: 0.24 + envelope * 0.28 + retreat * 0.38,
				frameSlip: 0.08 + retreat * 0.46,
				noise: 0.08 + retreat * 0.32,
				pulse: 0.06 + retreat * 0.3,
				red: retreat * 0.24,
				darken: 0.04 + retreat * 0.1,
				luminance: 0.08 + retreat * 0.28
			};
		}

		if (this.currentAnomaly === 'press') {
			const firstDrop = progress >= 0.1 && progress < 0.16;
			const finalDrop = progress >= 0.8 && progress < 0.85;
			if (firstDrop || finalDrop) return { ...empty, blackout: true };

			const attack = this.smoothstep(0, 0.24, progress);
			const release = 1 - this.smoothstep(0.84, 1, progress);
			const firstImpact =
				this.smoothstep(0.26, 0.3, progress) * (1 - this.smoothstep(0.35, 0.4, progress));
			const secondImpact =
				this.smoothstep(0.42, 0.46, progress) * (1 - this.smoothstep(0.51, 0.57, progress));
			const impact = Math.max(firstImpact, secondImpact);
			const collapse = attack * release;
			return {
				...empty,
				intensity: 0.48 + collapse * 0.32 + impact * 0.2,
				rgbSplit: 0.5 + collapse * 0.24 + impact * 0.24,
				tearing: 0.44 + collapse * 0.28 + impact * 0.28,
				blocks: 0.5 + collapse * 0.24 + impact * 0.24,
				scanlines: 0.48 + collapse * 0.3,
				smear: 0.36 + collapse * 0.3 + impact * 0.28,
				jitter: 0.18 + impact * 0.72,
				verticalTear: 0.4 + collapse * 0.3 + impact * 0.26,
				frameSlip: 0.38 + impact * 0.56,
				noise: 0.46 + collapse * 0.26 + impact * 0.22,
				pulse: 0.42 + collapse * 0.28 + impact * 0.26,
				red: 0.44 + collapse * 0.32 + impact * 0.2,
				darken: 0.08 + impact * 0.12,
				luminance: 0.4 + impact * 0.44
			};
		}

		if (this.currentAnomaly === 'listener') {
			const preScreamDrop = progress >= 0.69 && progress < 0.72;
			if (preScreamDrop) return { ...empty, blackout: true };

			if (progress >= 0.72 && progress < 0.88) {
				const attack = this.smoothstep(0.72, 0.76, progress);
				const release = 1 - this.smoothstep(0.84, 0.88, progress);
				const collapse = Math.max(0.82, attack * release);
				return {
					...empty,
					intensity: collapse,
					rgbSplit: 0.74 + collapse * 0.22,
					tearing: 0.78 + collapse * 0.22,
					blocks: 0.66 + collapse * 0.3,
					scanlines: 0.72 + collapse * 0.22,
					smear: 0.7 + collapse * 0.25,
					jitter: 0.68 + collapse * 0.26,
					verticalTear: 0.72 + collapse * 0.24,
					frameSlip: 0.68 + collapse * 0.28,
					noise: 0.74 + collapse * 0.22,
					pulse: 0.72 + collapse * 0.24,
					red: 0.68 + collapse * 0.28,
					darken: 0.12 + collapse * 0.1,
					luminance: 0.7 + collapse * 0.24
				};
			}

			if (progress >= 0.88) {
				const recovery = 1 - this.smoothstep(0.88, 1, progress);
				return {
					...empty,
					intensity: recovery * 0.42,
					rgbSplit: recovery * 0.4,
					tearing: recovery * 0.36,
					blocks: recovery * 0.28,
					scanlines: recovery * 0.32,
					smear: recovery * 0.18,
					jitter: recovery * 0.2,
					verticalTear: recovery * 0.22,
					frameSlip: recovery * 0.12,
					noise: recovery * 0.2,
					pulse: recovery * 0.16,
					red: recovery * 0.24,
					darken: recovery * 0.1,
					luminance: recovery * 0.2
				};
			}

			const envelope =
				this.smoothstep(0, 0.16, progress) * (1 - this.smoothstep(0.78, 1, progress));
			const wrongMoment =
				this.smoothstep(0.56, 0.63, progress) * (1 - this.smoothstep(0.75, 0.82, progress));
			return {
				...empty,
				intensity: 0.25 + envelope * 0.2 + wrongMoment * 0.18,
				rgbSplit: 0.24 + wrongMoment * 0.32,
				tearing: 0.2 + wrongMoment * 0.28,
				blocks: 0.12 + wrongMoment * 0.22,
				scanlines: 0.24,
				smear: 0.1 + wrongMoment * 0.2,
				jitter: wrongMoment * 0.28,
				verticalTear: 0.1 + wrongMoment * 0.25,
				frameSlip: wrongMoment * 0.18,
				noise: 0.12 + wrongMoment * 0.22,
				pulse: 0.08 + wrongMoment * 0.24,
				darken: wrongMoment * 0.08,
				luminance: 0.14
			};
		}

		const firstDrop = progress >= 0.12 && progress < 0.17;
		const finalDrop = progress >= 0.75 && progress < 0.8;
		if (firstDrop || finalDrop) return { ...empty, blackout: true };

		if (progress < 0.12) {
			const buildup = this.smoothstep(0, 0.12, progress);
			return {
				...empty,
				intensity: 0.35 + buildup * 0.38,
				rgbSplit: 0.26 + buildup * 0.34,
				tearing: 0.28 + buildup * 0.42,
				blocks: 0.2 + buildup * 0.36,
				scanlines: 0.3 + buildup * 0.26,
				smear: buildup * 0.24,
				jitter: buildup * 0.36,
				verticalTear: 0.22 + buildup * 0.38,
				frameSlip: buildup * 0.34,
				noise: 0.24 + buildup * 0.34,
				pulse: 0.18 + buildup * 0.4,
				darken: buildup * 0.12,
				luminance: 0.2 + buildup * 0.28
			};
		}

		if (progress < 0.75) {
			const takeover = this.smoothstep(0.17, 0.3, progress);
			const release = 1 - this.smoothstep(0.64, 0.75, progress);
			const collapse = Math.max(0.74, takeover * release);
			return {
				...empty,
				intensity: collapse,
				rgbSplit: 0.62 + collapse * 0.34,
				tearing: 0.7 + collapse * 0.3,
				blocks: 0.58 + collapse * 0.38,
				scanlines: 0.62 + collapse * 0.3,
				smear: 0.52 + collapse * 0.42,
				jitter: 0.46 + collapse * 0.5,
				verticalTear: 0.62 + collapse * 0.34,
				frameSlip: 0.58 + collapse * 0.38,
				noise: 0.66 + collapse * 0.3,
				pulse: 0.6 + collapse * 0.36,
				red: 0.54 + collapse * 0.42,
				darken: 0.08 + collapse * 0.16,
				luminance: 0.58 + collapse * 0.36
			};
		}

		const recovery = 1 - this.smoothstep(0.8, 1, progress);
		return {
			...empty,
			intensity: recovery * 0.46,
			rgbSplit: recovery * 0.42,
			tearing: recovery * 0.38,
			blocks: recovery * 0.26,
			scanlines: recovery * 0.34,
			smear: recovery * 0.18,
			jitter: recovery * 0.2,
			verticalTear: recovery * 0.24,
			frameSlip: recovery * 0.16,
			noise: recovery * 0.22,
			pulse: recovery * 0.18,
			red: recovery * 0.2,
			darken: recovery * 0.12,
			luminance: recovery * 0.2
		};
	}

	private rollAnomalyGlitchRecipe(kind: AnomalyKind) {
		let pool = GLITCH_TRAITS;
		let count = 4;

		if (kind === 'signal') {
			pool = GLITCH_TRAITS.filter((trait) => trait !== 'red');
			count = 4;
		} else if (kind === 'presence') {
			pool = GLITCH_TRAITS.filter(
				(trait) => trait !== 'red' && trait !== 'sync' && trait !== 'smear'
			);
			count = 2;
		} else if (kind === 'stare' || kind === 'ceiling') {
			count = 3;
		} else if (kind === 'resident' || kind === 'weeping' || kind === 'press') {
			count = 5;
		}

		this.anomalyGlitchTraits = this.pickGlitchTraits(count + Math.floor(this.random() * 2), pool);
		this.rollGlitchCadence();
	}

	private pickGlitchTraits(count: number, pool: GlitchTrait[] = GLITCH_TRAITS) {
		const choices = [...pool];
		const selected: GlitchTrait[] = [];
		while (choices.length > 0 && selected.length < count) {
			const index = Math.floor(this.random() * choices.length);
			selected.push(choices[index]);
			choices.splice(index, 1);
		}
		return selected;
	}

	private rollGlitchCadence() {
		this.glitchPhase = this.random() * TAU;
		this.glitchRate = 5.5 + this.random() * 13;
	}

	private applyGlitchRecipe(base: GlitchProfile, traits: GlitchTrait[]) {
		if (traits.length === 0) return base;

		const clock =
			this.flashbackTime > 0
				? this.flashbackTime
				: this.currentAnomaly
					? this.anomalyTime
					: this.time;
		const wave = (Math.sin(clock * this.glitchRate + this.glitchPhase) + 1) * 0.5;
		const strength = this.clamp(base.intensity * (0.62 + wave * 0.58), 0.04, 1);
		const profile = { ...base };

		for (const trait of traits) {
			if (trait === 'chromatic') {
				profile.rgbSplit = this.clamp(profile.rgbSplit * (1.12 + wave * 0.28) + strength * 0.12, 0, 1);
			} else if (trait === 'horizontal') {
				profile.tearing = this.clamp(profile.tearing * (1.15 + wave * 0.3) + strength * 0.1, 0, 1);
			} else if (trait === 'vertical') {
				profile.verticalTear = this.clamp(
					profile.verticalTear * (1.18 + wave * 0.34) + strength * 0.12,
					0,
					1
				);
			} else if (trait === 'blocks') {
				profile.blocks = this.clamp(profile.blocks * (1.14 + wave * 0.32) + strength * 0.11, 0, 1);
				profile.noise = this.clamp(profile.noise + strength * 0.05, 0, 1);
			} else if (trait === 'smear') {
				profile.smear = this.clamp(profile.smear * (1.16 + wave * 0.3) + strength * 0.1, 0, 1);
			} else if (trait === 'noise') {
				profile.noise = this.clamp(profile.noise * (1.16 + wave * 0.34) + strength * 0.13, 0, 1);
			} else if (trait === 'sync') {
				profile.frameSlip = this.clamp(
					profile.frameSlip * (1.18 + wave * 0.34) + strength * 0.12,
					0,
					1
				);
				profile.jitter = this.clamp(profile.jitter + strength * (0.06 + wave * 0.08), 0, 1);
			} else if (trait === 'scanline') {
				profile.scanlines = this.clamp(
					profile.scanlines * (1.12 + wave * 0.26) + strength * 0.1,
					0,
					1
				);
			} else if (trait === 'pulse') {
				profile.pulse = this.clamp(profile.pulse * (1.14 + wave * 0.34) + strength * 0.12, 0, 1);
				profile.luminance = this.clamp(profile.luminance + strength * wave * 0.09, 0, 1);
			} else if (trait === 'red') {
				profile.red = this.clamp(profile.red * (1.1 + wave * 0.26) + strength * 0.12, 0, 1);
				profile.darken = this.clamp(profile.darken + strength * 0.04, 0, 1);
			}
		}

		profile.intensity = this.clamp(
			profile.intensity * (0.94 + traits.length * 0.025) + wave * 0.035,
			0,
			1
		);
		return profile;
	}

	private drawLocalizedSignalDamage(profile: GlitchProfile, region: GlitchRegion) {
		const ctx = this.ctx;
		const source = this.sceneCanvas;
		const x = Math.floor(region.x * this.width);
		const y = Math.floor(region.y * this.height);
		const width = Math.max(24, Math.floor(region.width * this.width));
		const height = Math.max(18, Math.floor(region.height * this.height));
		const strength = this.clamp(profile.intensity * 1.45, 0.08, 0.48);

		ctx.save();
		ctx.beginPath();
		ctx.rect(x, y, width, height);
		ctx.clip();

		const ghostOffset = (this.random() - 0.5) * (4 + strength * 34);
		ctx.globalAlpha = 0.1 + strength * 0.32;
		ctx.drawImage(source, x, y, width, height, x + ghostOffset, y, width, height);

		const slices = 3 + Math.round(profile.tearing * 14);
		ctx.globalAlpha = 0.2 + strength * 0.62;
		for (let index = 0; index < slices; index++) {
			const sliceY = y + Math.floor(this.random() * height);
			const sliceHeight = Math.max(
				1,
				Math.floor(1 + this.random() * (3 + profile.tearing * height * 0.24))
			);
			const offset =
				(index % 2 === 0 ? 1 : -1) * (2 + this.random() * (5 + profile.tearing * 38));
			ctx.drawImage(
				source,
				x,
				sliceY,
				width,
				sliceHeight,
				x + offset,
				sliceY,
				width,
				sliceHeight
			);
		}

		if (profile.verticalTear > 0) {
			const columns = 1 + Math.round(profile.verticalTear * 8);
			ctx.globalAlpha = 0.14 + profile.verticalTear * 0.42;
			for (let index = 0; index < columns; index++) {
				const columnX = x + Math.floor(this.random() * width);
				const columnWidth = Math.max(2, Math.floor(2 + this.random() * width * 0.12));
				const offset = (this.random() - 0.5) * (8 + profile.verticalTear * 44);
				ctx.drawImage(
					source,
					columnX,
					y,
					columnWidth,
					height,
					columnX,
					y + offset,
					columnWidth,
					height
				);
			}
		}

		if (profile.rgbSplit > 0) {
			const offset = 1.5 + profile.rgbSplit * 12;
			ctx.globalCompositeOperation = 'screen';
			ctx.globalAlpha = 0.08 + profile.rgbSplit * 0.26;
			ctx.filter = 'sepia(1) saturate(12) hue-rotate(305deg) contrast(1.5)';
			ctx.drawImage(source, -offset, 0, this.width, this.height);
			ctx.filter = 'sepia(1) saturate(9) hue-rotate(125deg) contrast(1.45)';
			ctx.drawImage(source, offset, 0, this.width, this.height);
			ctx.filter = 'none';
			ctx.globalCompositeOperation = 'source-over';
		}

		const blocks = 2 + Math.round(profile.blocks * 26 + profile.noise * 12);
		for (let index = 0; index < blocks; index++) {
			const blockWidth = Math.max(3, width * (0.06 + this.random() * 0.42));
			const blockHeight = Math.max(1, 1 + this.random() * (3 + profile.blocks * 12));
			const blockX = x + this.random() * Math.max(1, width - blockWidth);
			const blockY = y + this.random() * Math.max(1, height - blockHeight);
			ctx.globalAlpha = 0.08 + this.random() * strength * 0.72;
			ctx.fillStyle = index % 5 === 0 ? '#b9071d' : index % 3 === 0 ? '#1cc4ce' : '#d8e5e4';
			ctx.fillRect(blockX, blockY, blockWidth, blockHeight);
		}

		if (profile.scanlines > 0) {
			ctx.globalAlpha = 0.04 + profile.scanlines * 0.16;
			ctx.fillStyle = '#020405';
			const spacing = Math.max(3, Math.round(7 - profile.scanlines * 4));
			for (let lineY = y; lineY < y + height; lineY += spacing) {
				ctx.fillRect(x, lineY, width, 1);
			}
		}

		if (profile.pulse > 0) {
			ctx.globalCompositeOperation = 'screen';
			ctx.globalAlpha = profile.pulse * 0.08;
			ctx.fillStyle = '#b8eeee';
			ctx.fillRect(x, y, width, height);
		}

		ctx.restore();
	}

	private drawSignalDamage(profile: GlitchProfile) {
		const ctx = this.ctx;
		const source = this.sceneCanvas;
		const intensity = profile.intensity;

		// Vertical sync loss separates the frame into independently drifting
		// sections, briefly exposing a wrapped copy of the same scene.
		if (profile.frameSlip > 0 && this.random() < 0.2 + profile.frameSlip * 0.72) {
			const splitY = Math.floor(this.height * (0.18 + this.random() * 0.64));
			const horizontalSlip = (this.random() - 0.5) * (18 + profile.frameSlip * 110);
			const verticalSlip = Math.round((this.random() - 0.5) * profile.frameSlip * 34);
			ctx.save();
			ctx.globalAlpha = 0.18 + profile.frameSlip * 0.58;
			ctx.drawImage(
				source,
				0,
				0,
				this.width,
				splitY,
				horizontalSlip,
				verticalSlip,
				this.width,
				splitY
			);
			ctx.drawImage(
				source,
				0,
				splitY,
				this.width,
				this.height - splitY,
				-horizontalSlip * 0.45,
				splitY - verticalSlip,
				this.width,
				this.height - splitY
			);
			ctx.globalAlpha = 0.08 + profile.frameSlip * 0.18;
			ctx.fillStyle = '#000507';
			ctx.fillRect(0, splitY - 2, this.width, 4 + profile.frameSlip * 18);
			ctx.restore();
		}

		// Narrow columns sliding vertically complement the horizontal tearing and
		// make severe events feel like the raster itself has lost alignment.
		if (profile.verticalTear > 0) {
			const columns = Math.round(1 + profile.verticalTear * 18);
			ctx.save();
			ctx.globalAlpha = 0.12 + profile.verticalTear * 0.52;
			for (let index = 0; index < columns; index++) {
				const x = Math.floor(this.random() * this.width);
				const width = Math.max(2, Math.floor(2 + this.random() * (8 + profile.verticalTear * 46)));
				const offset = (this.random() - 0.5) * (12 + profile.verticalTear * 120);
				ctx.drawImage(source, x, 0, width, this.height, x, offset, width, this.height);
			}
			ctx.restore();
		}

		if (profile.smear > 0) {
			const echoes = 1 + Math.round(profile.smear * 4);
			for (let index = 0; index < echoes; index++) {
				const offset = (index + 1) * (3 + profile.smear * 8) * (index % 2 === 0 ? -1 : 1);
				ctx.save();
				ctx.globalCompositeOperation = 'screen';
				ctx.globalAlpha = 0.05 + profile.smear * 0.11;
				ctx.filter = index % 2 === 0 ? 'sepia(1) saturate(9) hue-rotate(305deg)' : 'sepia(1) saturate(7) hue-rotate(125deg)';
				ctx.drawImage(source, offset, (this.random() - 0.5) * 5, this.width, this.height);
				ctx.restore();
			}
		}

		const sliceCount = Math.round(1 + profile.tearing * 35);

		// Rebuild the frame from horizontally displaced strips. Because the
		// source is an offscreen scene, the corridor and resident tear together.
		ctx.save();
		ctx.globalAlpha = 0.16 + profile.tearing * 0.7;
		for (let index = 0; index < sliceCount; index++) {
			const y = Math.floor(this.random() * this.height);
			const height = Math.max(1, Math.floor(1 + this.random() * (6 + profile.tearing * 48)));
			const direction = index % 2 === 0 ? 1 : -1;
			const offset = direction * (2 + this.random() * (8 + profile.tearing * 106));
			ctx.drawImage(source, 0, y, this.width, height, offset, y, this.width, height);
			if (profile.tearing > 0.62 && index % 4 === 0) {
				ctx.drawImage(source, 0, y, this.width, height, offset * -0.42, y + height, this.width, height);
			}
		}
		ctx.restore();

		// Chromatic channel echoes reproduce the red/cyan misregistration of a
		// damaged analogue signal without shifting any DOM content.
		const channelPasses = Math.round(1 + profile.rgbSplit * 9);
		for (let index = 0; index < channelPasses; index++) {
			const y = this.random() * this.height;
			const height = 3 + this.random() * (12 + profile.rgbSplit * 76);
			const offset = 2 + this.random() * (5 + profile.rgbSplit * 25);

			ctx.save();
			ctx.beginPath();
			ctx.rect(0, y, this.width, height);
			ctx.clip();
			ctx.globalCompositeOperation = 'screen';
			ctx.globalAlpha = 0.12 + profile.rgbSplit * 0.42;
			ctx.filter = 'sepia(1) saturate(12) hue-rotate(305deg) contrast(1.7)';
			ctx.drawImage(source, -offset, 0, this.width, this.height);
			ctx.filter = 'sepia(1) saturate(10) hue-rotate(125deg) contrast(1.6)';
			ctx.drawImage(source, offset, 0, this.width, this.height);
			ctx.restore();
		}

		if (profile.red > 0) {
			ctx.save();
			ctx.globalCompositeOperation = 'screen';
			ctx.fillStyle = `rgba(190,0,18,${profile.red * 0.3})`;
			ctx.fillRect(0, 0, this.width, this.height);
			ctx.fillStyle = `rgba(0,83,96,${profile.red * 0.09})`;
			ctx.fillRect(0, 0, this.width, this.height);
			ctx.restore();
		}

		if (profile.pulse > 0) {
			const wave = (Math.sin(this.time * (8 + profile.pulse * 15)) + 1) * 0.5;
			const pulse = profile.pulse * (0.16 + wave * 0.84);
			const glow = ctx.createRadialGradient(
				this.width * 0.5,
				this.height * 0.46,
				Math.min(this.width, this.height) * 0.08,
				this.width * 0.5,
				this.height * 0.46,
				Math.max(this.width, this.height) * 0.72
			);
			glow.addColorStop(0, `rgba(205,235,234,${pulse * 0.08})`);
			glow.addColorStop(0.58, `rgba(3,45,52,${pulse * 0.05})`);
			glow.addColorStop(1, `rgba(205,0,24,${pulse * 0.2})`);
			ctx.save();
			ctx.globalCompositeOperation = 'screen';
			ctx.fillStyle = glow;
			ctx.fillRect(0, 0, this.width, this.height);
			ctx.restore();
		}

		// Dense rectangular fragments and dark dropout bars create the broken
		// codec texture visible in the reference while keeping text unobstructed.
		ctx.save();
		const blocks = Math.round(profile.blocks * 58);
		for (let index = 0; index < blocks; index++) {
			const width = Math.max(3, this.width * (0.025 + this.random() * 0.28));
			const height = Math.max(2, 2 + this.random() * (8 + profile.blocks * 42));
			const sourceX = this.random() * Math.max(1, this.width - width);
			const sourceY = this.random() * Math.max(1, this.height - height);
			const offsetX = (this.random() - 0.5) * (24 + profile.blocks * 150);
			const offsetY = (this.random() - 0.5) * (4 + profile.blocks * 24);
			ctx.globalAlpha = 0.12 + this.random() * profile.blocks * 0.58;
			ctx.drawImage(
				source,
				sourceX,
				sourceY,
				width,
				height,
				sourceX + offsetX,
				sourceY + offsetY,
				width,
				height
			);

			if (index % 3 === 0) {
				ctx.fillStyle = index % 6 === 0 ? '#e0001b' : '#031013';
				ctx.fillRect(sourceX + offsetX, sourceY + offsetY, width, Math.min(3, height));
			}
		}

		if (profile.scanlines > 0) {
			ctx.globalAlpha = 0.04 + profile.scanlines * 0.18;
			ctx.fillStyle = '#020405';
			const spacing = Math.max(3, Math.round(8 - profile.scanlines * 5));
			for (let y = 0; y < this.height; y += spacing) ctx.fillRect(0, y, this.width, 1);

			const scanY = (this.time * (70 + profile.scanlines * 190)) % (this.height + 36) - 18;
			ctx.globalAlpha = 0.04 + profile.scanlines * 0.12;
			ctx.fillStyle = '#d5edef';
			ctx.fillRect(0, scanY, this.width, 2 + profile.scanlines * 3);

			const dropoutY =
				(this.time * (34 + profile.scanlines * 82)) % (this.height + 90) - 45;
			ctx.globalAlpha = 0.03 + profile.scanlines * 0.1;
			ctx.fillStyle = '#000203';
			ctx.fillRect(0, dropoutY, this.width, 12 + profile.scanlines * 34);
		}
		ctx.restore();

		if (profile.noise > 0) {
			const fragments = Math.round(8 + profile.noise * 210);
			ctx.save();
			ctx.globalCompositeOperation = 'screen';
			for (let index = 0; index < fragments; index++) {
				const colored = index % 5 === 0;
				ctx.globalAlpha = 0.035 + this.random() * profile.noise * 0.24;
				ctx.fillStyle = colored ? (index % 10 === 0 ? '#ff1738' : '#25e5ec') : '#d7e4e2';
				const width = 1 + this.random() * (2 + profile.noise * 18);
				const height = this.random() > 0.82 ? 2 + profile.noise * 3 : 1;
				ctx.fillRect(this.random() * this.width, this.random() * this.height, width, height);
			}
			ctx.restore();
		}

		if (profile.luminance > 0 && this.random() > 0.62) {
			ctx.fillStyle = `rgba(205,226,224,${profile.luminance * 0.08})`;
			ctx.fillRect(0, 0, this.width, this.height);
		}
	}

	private drawReadabilityVeil() {
		const ctx = this.ctx;
		ctx.fillStyle = 'rgba(2,7,9,.2)';
		ctx.fillRect(0, 0, this.width, this.height);

		const bottom = ctx.createLinearGradient(0, this.height * 0.45, 0, this.height);
		bottom.addColorStop(0, 'rgba(1,4,6,0)');
		bottom.addColorStop(1, 'rgba(1,4,6,.33)');
		ctx.fillStyle = bottom;
		ctx.fillRect(0, this.height * 0.42, this.width, this.height * 0.58);
	}

	private drawFilmGrain() {
		const ctx = this.ctx;
		ctx.save();
		ctx.globalAlpha = 0.035;
		ctx.fillStyle = '#b9cccb';
		const dots = Math.min(90, Math.round((this.width * this.height) / 15000));
		for (let index = 0; index < dots; index++) {
			ctx.fillRect(this.random() * this.width, this.random() * this.height, 1, 1);
		}
		ctx.restore();
	}

	private drawVignette() {
		const gradient = this.ctx.createRadialGradient(
			this.width * 0.5,
			this.height * 0.46,
			Math.min(this.width, this.height) * 0.16,
			this.width * 0.5,
			this.height * 0.46,
			Math.max(this.width, this.height) * 0.72
		);
		gradient.addColorStop(0.48, 'rgba(0,3,4,0)');
		gradient.addColorStop(0.78, 'rgba(0,3,4,.18)');
		gradient.addColorStop(1, 'rgba(0,2,3,.76)');
		this.ctx.fillStyle = gradient;
		this.ctx.fillRect(0, 0, this.width, this.height);
	}

	private mapCoverPoint(image: HTMLImageElement, normalizedX: number, normalizedY: number) {
		const scale = Math.max(this.width / image.naturalWidth, this.height / image.naturalHeight);
		const width = image.naturalWidth * scale;
		const height = image.naturalHeight * scale;
		return {
			x: (this.width - width) / 2 + width * normalizedX,
			y: (this.height - height) / 2 + height * normalizedY
		};
	}

	private drawCover(image: HTMLImageElement, scale = 1, offsetX = 0, offsetY = 0) {
		const baseScale = Math.max(this.width / image.naturalWidth, this.height / image.naturalHeight);
		const width = image.naturalWidth * baseScale * scale;
		const height = image.naturalHeight * baseScale * scale;
		this.ctx.drawImage(
			image,
			(this.width - width) / 2 + offsetX,
			(this.height - height) / 2 + offsetY,
			width,
			height
		);
	}

	private getReadyImage(name: SceneImage) {
		const image = this.images.get(name);
		return image?.complete && image.naturalWidth > 0 ? image : null;
	}

	private random() {
		this.randomState = (Math.imul(this.randomState, 1664525) + 1013904223) >>> 0;
		return this.randomState / 4294967296;
	}

	private clamp(value: number, min: number, max: number) {
		return Math.min(max, Math.max(min, value));
	}

	private smoothstep(edge0: number, edge1: number, value: number) {
		const x = this.clamp((value - edge0) / Math.max(0.000001, edge1 - edge0), 0, 1);
		return x * x * (3 - 2 * x);
	}

	private easeOutCubic(value: number) {
		return 1 - Math.pow(1 - value, 3);
	}
}
