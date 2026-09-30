const COLORS = [
	[236, 72, 153],
	[168, 85, 247],
	[34, 211, 238],
	[59, 130, 246],
	[163, 230, 53],
	[251, 191, 36]
] as const;

const BALL_REFLECTION_COLORS = [0, 1, 2, 5] as const;

type Beam = {
	baseAngle: number;
	sweep: number;
	speed: number;
	phase: number;
	width: number;
	length: number;
	alpha: number;
	colorIndex: number;
};

type LightPool = {
	beamIndex: number;
	x: number;
	targetX: number;
	radius: number;
	alpha: number;
	colorIndex: number;
	yRatio: number;
};

type Sparkle = {
	x: number;
	y: number;
	vx: number;
	vy: number;
	size: number;
	alpha: number;
	baseAlpha: number;
	depth: number;
	variant: number;
	colorIndex: number;
	wobble: number;
	wobbleSpeed: number;
	flutter: number;
	flutterSpeed: number;
	rotation: number;
	rotationSpeed: number;
};

type BeatState = {
	kick: number;
	snare: number;
	hat: number;
	energy: number;
};

const BEAT_PATTERN = [
	{ kick: 1, snare: 0, hat: 0.28 },
	{ kick: 0, snare: 0, hat: 0.62 },
	{ kick: 0.34, snare: 0.78, hat: 0.34 },
	{ kick: 0, snare: 0, hat: 0.74 },
	{ kick: 0.82, snare: 0, hat: 0.3 },
	{ kick: 0, snare: 0.24, hat: 0.68 },
	{ kick: 0.3, snare: 1, hat: 0.38 },
	{ kick: 0, snare: 0, hat: 0.82 },
	{ kick: 0.92, snare: 0, hat: 0.32 },
	{ kick: 0, snare: 0, hat: 0.7 },
	{ kick: 0.42, snare: 0.86, hat: 0.36 },
	{ kick: 0, snare: 0, hat: 0.78 },
	{ kick: 0.74, snare: 0.12, hat: 0.3 },
	{ kick: 0, snare: 0, hat: 0.66 },
	{ kick: 0.28, snare: 0.92, hat: 0.4 },
	{ kick: 0, snare: 0.18, hat: 0.88 }
] as const;

export class DiscoFever {
	private width = 0;
	private height = 0;
	private timer = 0;
	private pixelScale = 4;
	private bpm: number;
	private paletteOffset = 0;
	private reducedMotion: boolean;
	private scene: HTMLCanvasElement | null = null;
	private sceneContext: CanvasRenderingContext2D | null = null;
	private backdrop: HTMLCanvasElement | null = null;
	private ballFrames: HTMLCanvasElement[] = [];
	private poolSprites: HTMLCanvasElement[] = [];
	private sparkleSprites = new Map<string, HTMLCanvasElement>();
	private beams: Beam[] = [];
	private pools: LightPool[] = [];
	private sparkles: Sparkle[] = [];
	private ballSize = 168;
	private beat: BeatState = { kick: 0, snare: 0, hat: 0, energy: 0.42 };

	constructor(private random: () => number) {
		this.bpm = 108 + random() * 10;
		this.reducedMotion =
			typeof window.matchMedia === 'function' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}

	resize(width: number, height: number) {
		this.width = width;
		this.height = height;
		this.pixelScale = width < 720 ? 3 : width * height > 1_400_000 ? 5 : 4;

		this.scene = document.createElement('canvas');
		this.scene.width = Math.max(1, Math.ceil(width / this.pixelScale));
		this.scene.height = Math.max(1, Math.ceil(height / this.pixelScale));
		this.sceneContext = this.scene.getContext('2d');
		if (this.sceneContext) this.sceneContext.imageSmoothingEnabled = false;

		this.ballSize = this.clamp(Math.min(width, height) * 0.25, 128, 184);
		this.backdrop = this.createBackdrop();
		this.ballFrames = Array.from({ length: 20 }, (_, index) => this.createBallFrame(index, 20));
		this.poolSprites = COLORS.map((_, index) => this.createPoolSprite(index));
		this.buildSparkleSprites();
		this.buildScene();
		this.buildSparkles();
	}

	update(deltaSeconds: number, timer: number) {
		this.timer = timer;
		this.updateBeat();
		this.updatePools(deltaSeconds);
		this.updateSparkles(deltaSeconds);
	}

	draw(target: CanvasRenderingContext2D) {
		const scene = this.scene;
		const context = this.sceneContext;
		if (!scene || !context || !this.backdrop) return;

		context.clearRect(0, 0, scene.width, scene.height);
		context.globalAlpha = 1;
		context.globalCompositeOperation = 'source-over';
		context.imageSmoothingEnabled = false;
		context.drawImage(this.backdrop, 0, 0);
		this.drawPools(context);
		this.drawBeams(context);
		this.drawSparkles(context);
		this.drawBall(context);

		target.save();
		target.imageSmoothingEnabled = false;
		target.drawImage(scene, 0, 0, scene.width, scene.height, 0, 0, this.width, this.height);
		target.restore();
	}

	destroy() {
		this.scene = null;
		this.sceneContext = null;
		this.backdrop = null;
		this.ballFrames = [];
		this.poolSprites = [];
		this.sparkleSprites.clear();
		this.beams = [];
		this.pools = [];
		this.sparkles = [];
	}

	private buildScene() {
		const beamCount = this.width < 640 ? 7 : 9;
		this.beams = Array.from({ length: beamCount }, (_, index) => {
			const progress = index / (beamCount - 1);
			return {
				baseAngle: Math.PI * (0.16 + progress * 0.68 + (this.random() - 0.5) * 0.035),
				sweep: 0.055 + this.random() * 0.12,
				speed: 0.13 + this.random() * 0.18,
				phase: this.random() * Math.PI * 2,
				width: 0.028 + this.random() * 0.032,
				length: 0.82 + this.random() * 0.24,
				alpha: 0.11 + this.random() * 0.08,
				colorIndex: index % 3
			};
		});

		this.pools = [1, Math.floor(beamCount * 0.5), beamCount - 2].map((beamIndex, index) => {
			const x = this.width * (0.26 + index * 0.24);
			return {
				beamIndex,
				x,
				targetX: x,
				radius: 0.07 + this.random() * 0.025,
				alpha: 0.42 + this.random() * 0.12,
				colorIndex: this.beams[beamIndex]?.colorIndex ?? index,
				yRatio: 0.74 + index * 0.055
			};
		});
	}

	private buildSparkles() {
		const count = this.clamp(Math.floor((this.width * this.height) / 13_500), 42, 92);
		this.sparkles = Array.from({ length: count }, () => {
			const depth = this.random();
			const variantRoll = this.random();
			return {
				x: this.random() * this.width,
				y: this.random() * this.height,
				vx: (this.random() - 0.5) * 5,
				vy: 10 + depth * 34 + this.random() * 10,
				size: 0.8 + depth * 2.8,
				alpha: 0.18 + depth * 0.46,
				baseAlpha: 0.18 + depth * 0.46,
				depth,
				variant: variantRoll < 0.46 ? 0 : variantRoll < 0.7 ? 1 : variantRoll < 0.9 ? 2 : 3,
				colorIndex: Math.floor(this.random() * COLORS.length),
				wobble: this.random() * Math.PI * 2,
				wobbleSpeed: 0.35 + this.random() * 0.75,
				flutter: this.random() * Math.PI * 2,
				flutterSpeed: 0.55 + this.random() * 1.05,
				rotation: this.random() * Math.PI * 2,
				rotationSpeed: (this.random() - 0.5) * (1.1 + depth * 1.9)
			};
		});
	}

	private updateBeat() {
		const motion = this.reducedMotion ? 0.08 : 1;
		const position =
			((this.timer * this.bpm * 2) / 60) * (1 + Math.sin(this.timer * 0.17) * 0.012 * motion);
		const absoluteStep = Math.floor(position);
		const phase = position - absoluteStep;
		const step = BEAT_PATTERN[absoluteStep % BEAT_PATTERN.length];
		const envelope = this.reducedMotion ? 0.08 : this.beatEnvelope(phase);
		const bar = Math.floor(absoluteStep / BEAT_PATTERN.length);
		const phrase = 0.9 + Math.sin(bar * 0.73 + 0.4) * 0.08;

		this.beat.kick = step.kick * envelope * phrase;
		this.beat.snare = step.snare * envelope * phrase;
		this.beat.hat = step.hat * envelope;
		this.beat.energy = this.reducedMotion
			? 0.28
			: this.clamp(0.38 + phrase * 0.12 + this.beat.kick * 0.1, 0.34, 0.62);
		this.paletteOffset = Math.floor(bar / 4) % COLORS.length;
	}

	private updatePools(deltaSeconds: number) {
		const follow = 1 - Math.exp(-deltaSeconds * 3.8);
		const centerY = this.clamp(this.height * 0.14, 70, 108);
		for (const pool of this.pools) {
			const beam = this.beams[pool.beamIndex];
			if (!beam) continue;
			const angle = this.beamAngle(beam);
			const rayLength =
				Math.max(1, pool.yRatio * this.height - centerY) / Math.max(0.18, Math.sin(angle));
			pool.targetX = this.clamp(
				this.width * 0.5 + Math.cos(angle) * rayLength,
				this.width * 0.06,
				this.width * 0.94
			);
			pool.x += (pool.targetX - pool.x) * follow;
		}
	}

	private updateSparkles(deltaSeconds: number) {
		for (const sparkle of this.sparkles) {
			const sway =
				Math.sin(this.timer * sparkle.wobbleSpeed + sparkle.wobble) * (4 + sparkle.depth * 11);
			sparkle.x += (sparkle.vx + sway) * deltaSeconds;
			sparkle.y += sparkle.vy * deltaSeconds;
			sparkle.rotation += sparkle.rotationSpeed * deltaSeconds;
			const shimmer = 0.72 + Math.sin(this.timer * sparkle.flutterSpeed + sparkle.flutter) * 0.18;
			sparkle.alpha =
				sparkle.baseAlpha * shimmer * (0.88 + this.beat.hat * 0.34 + this.beat.energy * 0.12);

			if (sparkle.y > this.height + 24) {
				sparkle.y = -24 - this.random() * 36;
				sparkle.x = this.random() * this.width;
			}
			if (sparkle.x < -34) sparkle.x = this.width + 34;
			if (sparkle.x > this.width + 34) sparkle.x = -34;
		}
	}

	private createBackdrop() {
		const canvas = document.createElement('canvas');
		canvas.width = Math.max(1, Math.ceil(this.width / this.pixelScale));
		canvas.height = Math.max(1, Math.ceil(this.height / this.pixelScale));
		const context = canvas.getContext('2d');
		if (!context) return canvas;

		context.imageSmoothingEnabled = false;
		context.fillStyle = '#07091f';
		context.fillRect(0, 0, canvas.width, canvas.height);
		context.fillStyle = 'rgba(49, 46, 129, 0.18)';
		context.fillRect(0, 0, canvas.width, Math.round(canvas.height * 0.24));
		context.fillStyle = 'rgba(88, 28, 135, 0.1)';
		context.fillRect(
			0,
			Math.round(canvas.height * 0.24),
			canvas.width,
			Math.round(canvas.height * 0.2)
		);

		context.fillStyle = 'rgba(192, 132, 252, 0.13)';
		for (let y = 3; y < canvas.height * 0.56; y += 7) {
			for (let x = y % 2 === 0 ? 2 : 5; x < canvas.width; x += 13) {
				if ((x + y) % 4 === 0) context.fillRect(x, y, 1, 1);
			}
		}

		this.drawFloor(context, canvas.width, canvas.height);
		context.fillStyle = 'rgba(2, 4, 18, 0.2)';
		context.fillRect(
			Math.round(canvas.width * 0.2),
			Math.round(canvas.height * 0.16),
			Math.round(canvas.width * 0.6),
			Math.round(canvas.height * 0.43)
		);
		return canvas;
	}

	private drawFloor(context: CanvasRenderingContext2D, width: number, height: number) {
		const floorY = Math.round(height * 0.61);
		const vanishingX = width * 0.5;
		context.fillStyle = '#0b1234';
		context.fillRect(0, floorY, width, height - floorY);

		for (let row = 0; row < 9; row += 1) {
			const near = Math.pow(row / 9, 1.62);
			const far = Math.pow((row + 1) / 9, 1.62);
			const y0 = floorY + (height - floorY) * near;
			const y1 = floorY + (height - floorY) * far;
			const half0 = width * (0.035 + near * 0.58);
			const half1 = width * (0.035 + far * 0.58);

			for (let column = 0; column < 14; column += 1) {
				const start = column / 14;
				const end = (column + 1) / 14;
				context.fillStyle =
					(row + column) % 2 === 0 ? 'rgba(67, 56, 202, 0.28)' : 'rgba(126, 34, 206, 0.2)';
				context.beginPath();
				context.moveTo(Math.round(vanishingX - half0 + half0 * 2 * start), Math.round(y0));
				context.lineTo(Math.round(vanishingX - half0 + half0 * 2 * end), Math.round(y0));
				context.lineTo(Math.round(vanishingX - half1 + half1 * 2 * end), Math.round(y1));
				context.lineTo(Math.round(vanishingX - half1 + half1 * 2 * start), Math.round(y1));
				context.closePath();
				context.fill();
			}
		}
	}

	private createBallFrame(frameIndex: number, frameCount: number) {
		const size = Math.max(28, Math.round(this.ballSize / this.pixelScale));
		const canvas = document.createElement('canvas');
		canvas.width = size;
		canvas.height = size;
		const context = canvas.getContext('2d');
		if (!context) return canvas;

		const center = size * 0.5;
		const radius = size * 0.38;
		const rotation = frameIndex / frameCount;
		for (let y = -radius; y < radius; y += 2) {
			const normalizedY = (y + 1) / radius;
			const rowRadius = Math.sqrt(Math.max(0, 1 - normalizedY * normalizedY)) * radius;
			const row = Math.floor((y + radius) / 2);
			for (let column = 0; column < 16; column += 1) {
				const longitude0 = -Math.PI * 0.5 + (column / 16) * Math.PI;
				const longitude1 = -Math.PI * 0.5 + ((column + 1) / 16) * Math.PI;
				const x0 = center + Math.sin(longitude0) * rowRadius;
				const x1 = center + Math.sin(longitude1) * rowRadius;
				const longitude = (longitude0 + longitude1) * 0.5;
				const reflected = (column / 16 + rotation + row * 0.035) % 1;
				const highlight = Math.pow(Math.max(0, Math.cos((reflected - 0.16) * Math.PI * 2)), 7);
				const alpha = this.clamp(
					0.46 + Math.max(0.18, Math.cos(longitude)) * 0.34 + highlight * 0.2,
					0.32,
					0.98
				);
				context.fillStyle =
					highlight > 0.68
						? `rgba(248, 250, 252, ${alpha})`
						: this.color(
								BALL_REFLECTION_COLORS[
									(Math.floor(reflected * BALL_REFLECTION_COLORS.length) + row) %
										BALL_REFLECTION_COLORS.length
								],
								alpha
							);
				context.fillRect(
					Math.round(x0) + 1,
					Math.round(center + y) + 1,
					Math.max(1, Math.round(x1 - x0) - 1),
					1
				);
			}
		}

		context.fillStyle = 'rgba(226, 232, 240, 0.8)';
		for (let y = -Math.floor(radius); y <= radius; y += 1) {
			const edge = Math.round(Math.sqrt(Math.max(0, radius * radius - y * y)));
			context.fillRect(Math.round(center - edge), Math.round(center + y), 1, 1);
			context.fillRect(Math.round(center + edge), Math.round(center + y), 1, 1);
		}
		return canvas;
	}

	private createPoolSprite(colorIndex: number) {
		const canvas = document.createElement('canvas');
		canvas.width = 52;
		canvas.height = 18;
		const context = canvas.getContext('2d');
		if (!context) return canvas;

		for (let y = 0; y < canvas.height; y += 1) {
			for (let x = 0; x < canvas.width; x += 1) {
				const distance =
					Math.pow((x - canvas.width * 0.5) / (canvas.width * 0.5), 2) +
					Math.pow((y - canvas.height * 0.5) / (canvas.height * 0.5), 2);
				if (distance > 1) continue;
				const alpha = distance < 0.18 ? 0.92 : distance < 0.48 ? 0.48 : 0.18;
				context.fillStyle = this.color(colorIndex, alpha);
				context.fillRect(x, y, 1, 1);
			}
		}
		return canvas;
	}

	private drawPools(context: CanvasRenderingContext2D) {
		for (const pool of this.pools) {
			const sprite = this.poolSprites[(pool.colorIndex + this.paletteOffset) % COLORS.length];
			if (!sprite) continue;
			const width =
				((Math.max(this.width, this.height) * pool.radius * 2) / this.pixelScale) *
				(1 + this.beat.kick * 0.1);
			const height = width * 0.32;
			context.globalAlpha =
				pool.alpha * (0.74 + this.beat.energy * 0.3) * (1 + this.beat.kick * 0.36);
			context.drawImage(
				sprite,
				Math.round(pool.x / this.pixelScale - width * 0.5),
				Math.round((pool.yRatio * this.height) / this.pixelScale - height * 0.5),
				Math.round(width),
				Math.round(height)
			);
		}
		context.globalAlpha = 1;
	}

	private drawBeams(context: CanvasRenderingContext2D) {
		const centerX = (this.width * 0.5) / this.pixelScale;
		const centerY = this.clamp(this.height * 0.14, 70, 108) / this.pixelScale;
		const startRadius = (this.ballSize * 0.37 * 0.55) / this.pixelScale;
		const maxLength = (Math.hypot(this.width, this.height) * 1.08) / this.pixelScale;

		for (const beam of this.beams) {
			this.drawBeamBands(
				context,
				centerX,
				centerY,
				startRadius,
				this.beamAngle(beam),
				beam.width * (1 + this.beat.snare * 0.26),
				maxLength * beam.length,
				(beam.colorIndex + this.paletteOffset) % COLORS.length,
				beam.alpha * (0.72 + this.beat.energy * 0.38) * (1 + this.beat.snare * 0.58)
			);
		}
	}

	private drawBeamBands(
		context: CanvasRenderingContext2D,
		centerX: number,
		centerY: number,
		startRadius: number,
		angle: number,
		halfWidth: number,
		length: number,
		colorIndex: number,
		alpha: number
	) {
		for (let layer = 0; layer < 2; layer += 1) {
			const width = halfWidth * (layer === 0 ? 1 : 0.46);
			const layerAlpha = alpha * (layer === 0 ? 0.52 : 1);
			for (let segment = 0; segment < 3; segment += 1) {
				const start = startRadius + (length * segment) / 3;
				const end = startRadius + (length * (segment + 1)) / 3;
				const first = angle - width;
				const second = angle + width;
				context.fillStyle = this.color(
					colorIndex,
					this.clamp(layerAlpha * (1 - segment * 0.2), 0, 0.36)
				);
				context.beginPath();
				context.moveTo(
					Math.round(centerX + Math.cos(first) * start),
					Math.round(centerY + Math.sin(first) * start)
				);
				context.lineTo(
					Math.round(centerX + Math.cos(first) * end),
					Math.round(centerY + Math.sin(first) * end)
				);
				context.lineTo(
					Math.round(centerX + Math.cos(second) * end),
					Math.round(centerY + Math.sin(second) * end)
				);
				context.lineTo(
					Math.round(centerX + Math.cos(second) * start),
					Math.round(centerY + Math.sin(second) * start)
				);
				context.closePath();
				context.fill();
			}
		}
	}

	private drawSparkles(context: CanvasRenderingContext2D) {
		for (const sparkle of this.sparkles) {
			const size = this.clamp(Math.round(sparkle.size), 1, 4);
			const color = (sparkle.colorIndex + this.paletteOffset) % COLORS.length;
			const sprite = this.sparkleSprites.get(`${sparkle.variant}:${size}:${color}`);
			if (!sprite) continue;
			context.save();
			context.globalAlpha = sparkle.alpha;
			context.translate(
				Math.round(sparkle.x / this.pixelScale),
				Math.round(sparkle.y / this.pixelScale)
			);
			context.rotate(Math.floor(sparkle.rotation / (Math.PI * 0.5)) * Math.PI * 0.5);
			context.drawImage(sprite, -Math.floor(sprite.width * 0.5), -Math.floor(sprite.height * 0.5));
			context.restore();
		}
	}

	private drawBall(context: CanvasRenderingContext2D) {
		if (!this.ballFrames.length) return;
		const frame =
			this.ballFrames[
				Math.floor(this.timer * (this.reducedMotion ? 0.8 : 4)) % this.ballFrames.length
			];
		const centerX = Math.round((this.width * 0.5) / this.pixelScale);
		const centerY = Math.round(this.clamp(this.height * 0.14, 70, 108) / this.pixelScale);
		const scale = 1 + (this.reducedMotion ? 0 : this.beat.kick * 0.015);
		const width = Math.round(frame.width * scale);
		const height = Math.round(frame.height * scale);

		context.fillStyle = 'rgba(226, 232, 240, 0.5)';
		context.fillRect(centerX, 0, 1, Math.max(0, centerY - Math.floor(frame.height * 0.37)));
		context.globalAlpha = 0.9 + this.beat.energy * 0.1;
		context.drawImage(
			frame,
			centerX - Math.floor(width * 0.5),
			centerY - Math.floor(height * 0.5),
			width,
			height
		);
		context.globalAlpha = 1;
	}

	private buildSparkleSprites() {
		this.sparkleSprites.clear();
		for (let variant = 0; variant < 4; variant += 1) {
			for (let size = 1; size <= 4; size += 1) {
				for (let color = 0; color < COLORS.length; color += 1) {
					this.sparkleSprites.set(
						`${variant}:${size}:${color}`,
						this.createSparkleSprite(variant, size, color)
					);
				}
			}
		}
	}

	private createSparkleSprite(variant: number, size: number, colorIndex: number) {
		const canvas = document.createElement('canvas');
		canvas.width = (size + 2) * 2 + 1;
		canvas.height = canvas.width;
		const context = canvas.getContext('2d');
		if (!context) return canvas;
		context.fillStyle = this.color(colorIndex, 0.94);
		const center = Math.floor(canvas.width * 0.5);

		if (variant === 0) {
			context.fillRect(center, center - size, 1, size * 2 + 1);
			context.fillRect(center - size, center, size * 2 + 1, 1);
		} else if (variant === 1) {
			for (let offset = -size; offset <= size; offset += 1) {
				const width = size - Math.abs(offset);
				context.fillRect(center - width, center + offset, width * 2 + 1, 1);
			}
		} else if (variant === 2) {
			context.fillRect(center - size - 1, center, size * 2 + 3, 1);
			if (size > 1) {
				context.globalAlpha = 0.5;
				context.fillRect(center - size, center - 1, size * 2 + 1, 1);
			}
		} else {
			context.fillRect(
				center - Math.floor(size * 0.5),
				center - Math.floor(size * 0.5),
				Math.max(1, size),
				Math.max(1, size)
			);
		}
		return canvas;
	}

	private beamAngle(beam: Beam) {
		const motion = this.reducedMotion ? 0.08 : 1;
		return (
			beam.baseAngle +
			Math.sin(this.timer * beam.speed * motion + beam.phase) * beam.sweep * motion +
			Math.sin(this.timer * beam.speed * 0.43 * motion + beam.phase * 0.7) *
				beam.sweep *
				0.28 *
				motion
		);
	}

	private beatEnvelope(phase: number) {
		if (phase < 0.12) return this.smoothStep(0, 0.12, phase);
		return Math.exp(-(phase - 0.12) * 5.2);
	}

	private color(index: number, alpha: number) {
		const normalized = ((index % COLORS.length) + COLORS.length) % COLORS.length;
		const [red, green, blue] = COLORS[normalized];
		return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
	}

	private clamp(value: number, min: number, max: number) {
		return Math.max(min, Math.min(max, value));
	}

	private smoothStep(edge0: number, edge1: number, value: number) {
		const normalized = this.clamp((value - edge0) / (edge1 - edge0), 0, 1);
		return normalized * normalized * (3 - 2 * normalized);
	}
}
