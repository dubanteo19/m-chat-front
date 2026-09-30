type AnomalyKind = 'signal' | 'presence' | 'listener' | 'resident';

type SceneImage = 'corridor' | 'presence' | 'resident' | 'scream' | 'strike';

type GlitchProfile = {
	intensity: number;
	rgbSplit: number;
	tearing: number;
	blocks: number;
	scanlines: number;
	smear: number;
	jitter: number;
	red: number;
	darken: number;
	luminance: number;
	blackout: boolean;
};

const ASSET_PATHS: Record<SceneImage, string> = {
	corridor: '/room-effects/halloween-night/corridor.webp',
	presence: '/room-effects/halloween-night/presence.webp',
	resident: '/room-effects/halloween-night/resident-close.webp',
	scream: '/room-effects/halloween-night/resident-scream.webp',
	strike: '/room-effects/halloween-night/resident-glitch.webp'
};

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
	private nextAnomaly = 7;
	private ambientTime = 0;
	private nextAmbient = 2.8;
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
		} else {
			this.nextAmbient -= delta;
			if (this.nextAmbient <= 0) {
				this.ambientTime = this.reducedMotion ? 0.16 : 0.24 + this.random() * 0.2;
				this.nextAmbient = 3.5 + this.random() * 6;
			}
		}

		if (this.currentAnomaly) {
			this.anomalyTime += delta;
			if (this.anomalyTime >= this.anomalyDuration) this.endAnomaly();
			return;
		}

		this.nextAnomaly -= delta;
		if (this.nextAnomaly <= 0) this.beginAnomaly();
	}

	private beginAnomaly() {
		let kind: AnomalyKind;
		if (this.reducedMotion) {
			kind = 'presence';
		} else {
			const roll = this.random();
			kind = roll < 0.24 ? 'signal' : roll < 0.66 ? 'presence' : roll < 0.9 ? 'listener' : 'resident';
		}

		if (kind === this.previousAnomaly) kind = 'presence';
		this.currentAnomaly = kind;
		this.previousAnomaly = kind;
		this.anomalyTime = 0;
		this.anomalyDuration =
			kind === 'signal' ? 1.12 : kind === 'presence' ? 1.45 : kind === 'listener' ? 2.35 : 1.18;
	}

	private endAnomaly() {
		const wasResident = this.currentAnomaly === 'resident';
		this.currentAnomaly = null;
		this.anomalyTime = 0;
		this.nextAnomaly = wasResident ? 22 + this.random() * 13 : 9 + this.random() * 9;
	}

	private draw() {
		const output = this.ctx;
		const glitch = this.getGlitchProfile();
		this.ctx = this.sceneCtx;
		this.sceneCtx.clearRect(0, 0, this.width, this.height);
		this.drawCorridor();
		this.drawAnomaly();
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

		const jitterX = this.reducedMotion ? 0 : (this.random() - 0.5) * glitch.jitter * 18;
		const jitterY = this.reducedMotion ? 0 : (this.random() - 0.5) * glitch.jitter * 13;
		output.save();
		output.globalAlpha = 1 - this.random() * glitch.luminance * 0.16;
		output.drawImage(this.sceneCanvas, jitterX, jitterY, this.width, this.height);
		output.restore();

		if (glitch.intensity > 0 && !this.reducedMotion) this.drawSignalDamage(glitch);
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

		const progress = this.anomalyTime / this.anomalyDuration;
		if (this.currentAnomaly === 'resident') {
			this.drawResident(progress);
			return;
		}

		const fade = this.smoothstep(0, 0.14, progress) * (1 - this.smoothstep(0.72, 1, progress));
		if (fade <= 0) return;

		if (this.currentAnomaly === 'presence') {
			const image = this.getReadyImage('presence');
			if (!image) return;
			const height = Math.max(48, this.height * 0.15);
			this.drawSprite(image, this.width * 0.5, this.height * 0.55, height, fade * 0.46);
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

		const localProgress = this.clamp((progress - 0.72) / 0.16, 0, 1);
		const fade = 1 - this.smoothstep(0.82, 0.88, progress);
		const jitter = 4 + Math.sin(localProgress * Math.PI) * 8;
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

		const approach = this.easeOutCubic(this.clamp((progress - 0.17) / 0.16, 0, 1));
		const fade = 1 - this.smoothstep(0.82, 1, progress);
		const jitter = progress > 0.2 && progress < 0.78 ? 7 : 0.8;
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

	private getGlitchProfile(): GlitchProfile {
		const empty: GlitchProfile = {
			intensity: 0,
			rgbSplit: 0,
			tearing: 0,
			blocks: 0,
			scanlines: 0,
			smear: 0,
			jitter: 0,
			red: 0,
			darken: 0,
			luminance: 0,
			blackout: false
		};
		if (this.reducedMotion) return empty;

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
				luminance: ambient * 0.12
			};
		}

		const progress = this.anomalyTime / this.anomalyDuration;
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
				luminance: 0.08
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
			red: recovery * 0.2,
			darken: recovery * 0.12,
			luminance: recovery * 0.2
		};
	}

	private drawSignalDamage(profile: GlitchProfile) {
		const ctx = this.ctx;
		const source = this.sceneCanvas;
		const intensity = profile.intensity;

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
		}
		ctx.restore();

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
