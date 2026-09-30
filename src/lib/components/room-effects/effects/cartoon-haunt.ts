type VisitorKind = 'pumpkin' | 'ghost' | 'doll';

type PumpkinParticle = {
	x: number;
	y: number;
	size: number;
	speed: number;
	drift: number;
	phase: number;
	rotation: number;
	spin: number;
	alpha: number;
};

type Bat = {
	x: number;
	y: number;
	scale: number;
	speed: number;
	phase: number;
};

const TAU = Math.PI * 2;
const VISITORS: VisitorKind[] = ['pumpkin', 'ghost', 'doll'];

export class CartoonHaunt {
	private ctx: CanvasRenderingContext2D;
	private width = 0;
	private height = 0;
	private frame = 0;
	private lastFrame = 0;
	private time = 0;
	private pumpkins: PumpkinParticle[] = [];
	private bats: Bat[] = [];
	private currentVisitor: VisitorKind | null = null;
	private previousVisitor: VisitorKind | null = null;
	private visitorTime = 0;
	private nextVisit = 4.2;
	private reducedMotion = false;
	private running = false;
	private randomState: number;

	constructor(
		private canvas: HTMLCanvasElement,
		seed = Date.now()
	) {
		const context = canvas.getContext('2d');
		if (!context) throw new Error('Canvas not supported');

		this.ctx = context;
		this.randomState = seed >>> 0 || 1;
		this.reducedMotion =
			typeof window.matchMedia === 'function' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
		this.ctx.clearRect(0, 0, this.width, this.height);
		this.pumpkins = [];
		this.bats = [];
	};

	public activity(_kind: 'message' | 'reaction') {
		// Kept for the shared room-effect lifecycle. The scares stay independent
		// from chat activity so sending a message never punishes the sender.
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
		const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
		this.canvas.width = Math.round(this.width * dpr);
		this.canvas.height = Math.round(this.height * dpr);
		this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		this.createAmbientActors();
	};

	private createAmbientActors() {
		const pumpkinCount = Math.max(14, Math.min(34, Math.round(this.width / 55)));
		this.pumpkins = Array.from({ length: pumpkinCount }, () => ({
			x: this.random() * this.width,
			y: this.random() * this.height,
			size: 7 + this.random() * 11,
			speed: 5 + this.random() * 12,
			drift: 5 + this.random() * 12,
			phase: this.random() * TAU,
			rotation: (this.random() - 0.5) * 0.5,
			spin: (this.random() - 0.5) * 0.12,
			alpha: 0.18 + this.random() * 0.32
		}));

		this.bats = Array.from({ length: 7 }, () => ({
			x: this.random() * this.width,
			y: 35 + this.random() * Math.max(80, this.height * 0.34),
			scale: 0.55 + this.random() * 0.75,
			speed: 9 + this.random() * 18,
			phase: this.random() * TAU
		}));
	}

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
		for (const pumpkin of this.pumpkins) {
			pumpkin.y -= pumpkin.speed * delta;
			pumpkin.rotation += pumpkin.spin * delta;
			if (pumpkin.y < -pumpkin.size * 2) {
				pumpkin.y = this.height + pumpkin.size * 2;
				pumpkin.x = this.random() * this.width;
			}
		}

		for (const bat of this.bats) {
			bat.x += bat.speed * delta;
			if (bat.x > this.width + 30) {
				bat.x = -30;
				bat.y = 35 + this.random() * Math.max(80, this.height * 0.34);
			}
		}

		if (this.reducedMotion) return;

		if (this.currentVisitor) {
			this.visitorTime += delta;
			if (this.visitorTime >= 1.45) {
				this.currentVisitor = null;
				this.visitorTime = 0;
				this.nextVisit = 11 + this.random() * 10;
			}
			return;
		}

		this.nextVisit -= delta;
		if (this.nextVisit <= 0) this.beginVisit();
	}

	private beginVisit() {
		const choices = VISITORS.filter((visitor) => visitor !== this.previousVisitor);
		this.currentVisitor = choices[Math.floor(this.random() * choices.length)];
		this.previousVisitor = this.currentVisitor;
		this.visitorTime = 0;
	}

	private draw() {
		this.ctx.clearRect(0, 0, this.width, this.height);
		this.drawBackground();
		this.drawBats();
		this.drawPumpkinParticles();
		this.drawForegroundMist();

		if (this.currentVisitor) this.drawVisitor(this.currentVisitor, this.visitorTime);

		this.drawVignette();
	}

	private drawBackground() {
		const ctx = this.ctx;
		const horizon = this.height * 0.66;
		const sky = ctx.createLinearGradient(0, 0, 0, this.height);
		sky.addColorStop(0, '#100e2c');
		sky.addColorStop(0.56, '#352250');
		sky.addColorStop(1, '#12101d');
		ctx.fillStyle = sky;
		ctx.fillRect(0, 0, this.width, this.height);

		const moonX = this.width * 0.76;
		const moonY = Math.max(78, this.height * 0.2);
		const moonRadius = Math.min(62, Math.max(36, this.width * 0.042));
		const moonGlow = ctx.createRadialGradient(moonX, moonY, 2, moonX, moonY, moonRadius * 2.4);
		moonGlow.addColorStop(0, 'rgba(255,231,163,.8)');
		moonGlow.addColorStop(0.35, 'rgba(241,181,114,.2)');
		moonGlow.addColorStop(1, 'rgba(125,82,150,0)');
		ctx.fillStyle = moonGlow;
		ctx.beginPath();
		ctx.arc(moonX, moonY, moonRadius * 2.4, 0, TAU);
		ctx.fill();
		ctx.fillStyle = '#f5d99b';
		ctx.beginPath();
		ctx.arc(moonX, moonY, moonRadius, 0, TAU);
		ctx.fill();
		ctx.fillStyle = 'rgba(116,78,114,.2)';
		ctx.beginPath();
		ctx.arc(moonX - moonRadius * 0.3, moonY - 8, moonRadius * 0.16, 0, TAU);
		ctx.arc(moonX + moonRadius * 0.24, moonY + 15, moonRadius * 0.23, 0, TAU);
		ctx.fill();

		this.drawCloud(this.width * 0.18 + Math.sin(this.time * 0.05) * 22, this.height * 0.2, 1.1);
		this.drawCloud(this.width * 0.61 - Math.sin(this.time * 0.04) * 18, this.height * 0.35, 0.7);

		ctx.fillStyle = '#1b1329';
		ctx.beginPath();
		ctx.moveTo(0, horizon);
		for (let x = 0; x <= this.width + 60; x += 60) {
			ctx.quadraticCurveTo(x + 30, horizon - 35 - Math.sin(x * 0.021) * 18, x + 60, horizon);
		}
		ctx.lineTo(this.width, this.height);
		ctx.lineTo(0, this.height);
		ctx.closePath();
		ctx.fill();

		this.drawCrookedHouse(
			this.width * 0.48,
			horizon,
			Math.min(1.25, Math.max(0.72, this.width / 1100))
		);
		this.drawBareTree(this.width * 0.12, horizon + 12, Math.min(1.2, this.height / 700));
		this.drawBareTree(this.width * 0.9, horizon + 16, Math.min(0.95, this.height / 760));
		this.drawFence(horizon + 26);

		ctx.fillStyle = 'rgba(10,8,18,.42)';
		ctx.fillRect(0, 0, this.width, this.height);
	}

	private drawCloud(x: number, y: number, scale: number) {
		const ctx = this.ctx;
		ctx.save();
		ctx.translate(x, y);
		ctx.scale(scale, scale);
		ctx.fillStyle = 'rgba(171,143,187,.09)';
		ctx.beginPath();
		ctx.ellipse(0, 0, 72, 15, 0, 0, TAU);
		ctx.ellipse(-44, 2, 43, 11, -0.08, 0, TAU);
		ctx.ellipse(47, 4, 54, 12, 0.05, 0, TAU);
		ctx.fill();
		ctx.restore();
	}

	private drawCrookedHouse(x: number, groundY: number, scale: number) {
		const ctx = this.ctx;
		ctx.save();
		ctx.translate(x, groundY);
		ctx.scale(scale, scale);
		ctx.lineJoin = 'round';
		ctx.lineWidth = 6;
		ctx.strokeStyle = '#090713';
		ctx.fillStyle = '#20172b';
		ctx.beginPath();
		ctx.moveTo(-128, 0);
		ctx.lineTo(-118, -145);
		ctx.lineTo(-62, -198);
		ctx.lineTo(-12, -154);
		ctx.lineTo(50, -214);
		ctx.lineTo(126, -150);
		ctx.lineTo(113, 0);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		ctx.fillStyle = '#110c1a';
		ctx.beginPath();
		ctx.moveTo(-144, -137);
		ctx.lineTo(-65, -220);
		ctx.lineTo(3, -153);
		ctx.lineTo(-15, -145);
		ctx.lineTo(-64, -188);
		ctx.lineTo(-118, -132);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(-18, -145);
		ctx.lineTo(48, -236);
		ctx.lineTo(142, -148);
		ctx.lineTo(118, -137);
		ctx.lineTo(50, -201);
		ctx.lineTo(0, -137);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		this.drawHouseWindow(ctx, -82, -128, 42, 52);
		this.drawHouseWindow(ctx, 49, -142, 43, 57);
		ctx.fillStyle = '#0b0811';
		ctx.fillRect(-16, -83, 45, 83);
		ctx.strokeRect(-16, -83, 45, 83);
		ctx.fillStyle = '#8c5934';
		ctx.beginPath();
		ctx.arc(20, -42, 3, 0, TAU);
		ctx.fill();
		ctx.restore();
	}

	private drawHouseWindow(
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		width: number,
		height: number
	) {
		const flicker = 0.76 + Math.sin(this.time * 2.2 + x) * 0.08;
		ctx.fillStyle = `rgba(244,151,62,${flicker})`;
		ctx.fillRect(x, y, width, height);
		ctx.strokeStyle = '#0b0811';
		ctx.lineWidth = 5;
		ctx.strokeRect(x, y, width, height);
		ctx.beginPath();
		ctx.moveTo(x + width / 2, y);
		ctx.lineTo(x + width / 2, y + height);
		ctx.moveTo(x, y + height / 2);
		ctx.lineTo(x + width, y + height / 2);
		ctx.stroke();
	}

	private drawBareTree(x: number, groundY: number, scale: number) {
		const ctx = this.ctx;
		ctx.save();
		ctx.translate(x, groundY);
		ctx.scale(scale, scale);
		ctx.strokeStyle = '#0a0811';
		ctx.lineCap = 'round';
		ctx.lineWidth = 17;
		ctx.beginPath();
		ctx.moveTo(0, 15);
		ctx.quadraticCurveTo(-9, -74, 3, -156);
		ctx.stroke();
		ctx.lineWidth = 8;
		ctx.beginPath();
		ctx.moveTo(-1, -80);
		ctx.quadraticCurveTo(-42, -108, -59, -151);
		ctx.moveTo(1, -108);
		ctx.quadraticCurveTo(40, -133, 47, -178);
		ctx.moveTo(-41, -127);
		ctx.lineTo(-72, -133);
		ctx.moveTo(32, -145);
		ctx.lineTo(72, -161);
		ctx.stroke();
		ctx.restore();
	}

	private drawFence(y: number) {
		const ctx = this.ctx;
		ctx.save();
		ctx.strokeStyle = '#0a0810';
		ctx.fillStyle = '#100c18';
		ctx.lineWidth = 5;
		for (let x = -20; x < this.width + 30; x += 52) {
			const height = 48 + Math.sin(x * 0.08) * 9;
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(x + 4, y - height);
			ctx.lineTo(x + 13, y - height + 12);
			ctx.lineTo(x + 18, y);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}
		ctx.beginPath();
		ctx.moveTo(0, y - 27);
		ctx.lineTo(this.width, y - 23);
		ctx.stroke();
		ctx.restore();
	}

	private drawBats() {
		const ctx = this.ctx;
		for (const bat of this.bats) {
			const flap = Math.sin(this.time * 6 + bat.phase) * 5;
			ctx.save();
			ctx.translate(bat.x, bat.y + Math.sin(this.time * 1.7 + bat.phase) * 8);
			ctx.scale(bat.scale, bat.scale);
			ctx.fillStyle = 'rgba(7,5,13,.62)';
			ctx.beginPath();
			ctx.moveTo(0, 3);
			ctx.quadraticCurveTo(-13, -9 - flap, -27, 1);
			ctx.quadraticCurveTo(-15, -2, -7, 9);
			ctx.quadraticCurveTo(0, 3, 7, 9);
			ctx.quadraticCurveTo(15, -2, 27, 1);
			ctx.quadraticCurveTo(13, -9 - flap, 0, 3);
			ctx.fill();
			ctx.restore();
		}
	}

	private drawPumpkinParticles() {
		const ctx = this.ctx;
		for (const pumpkin of this.pumpkins) {
			const x = pumpkin.x + Math.sin(this.time * 0.65 + pumpkin.phase) * pumpkin.drift;
			ctx.save();
			ctx.translate(x, pumpkin.y);
			ctx.rotate(pumpkin.rotation);
			ctx.globalAlpha = pumpkin.alpha;
			this.drawPumpkin(ctx, pumpkin.size, false);
			ctx.restore();
		}
	}

	private drawPumpkin(ctx: CanvasRenderingContext2D, radius: number, angry: boolean) {
		ctx.lineJoin = 'round';
		ctx.lineCap = 'round';
		ctx.fillStyle = '#e87526';
		ctx.strokeStyle = '#402035';
		ctx.lineWidth = Math.max(1.2, radius * 0.1);
		ctx.beginPath();
		ctx.ellipse(0, 0, radius, radius * 0.78, 0, 0, TAU);
		ctx.fill();
		ctx.stroke();
		ctx.strokeStyle = 'rgba(108,43,45,.55)';
		ctx.lineWidth = Math.max(0.8, radius * 0.055);
		ctx.beginPath();
		ctx.ellipse(0, 0, radius * 0.47, radius * 0.76, 0, -Math.PI / 2, Math.PI / 2);
		ctx.moveTo(0, -radius * 0.76);
		ctx.ellipse(0, 0, radius * 0.47, radius * 0.76, 0, Math.PI / 2, Math.PI * 1.5);
		ctx.stroke();
		ctx.fillStyle = '#385330';
		ctx.fillRect(-radius * 0.12, -radius * 0.98, radius * 0.24, radius * 0.27);

		ctx.fillStyle = angry ? '#170b17' : '#3c2130';
		ctx.beginPath();
		ctx.moveTo(-radius * 0.56, -radius * 0.22);
		ctx.lineTo(-radius * 0.15, -radius * (angry ? 0.05 : 0.31));
		ctx.lineTo(-radius * 0.23, radius * 0.08);
		ctx.closePath();
		ctx.moveTo(radius * 0.56, -radius * 0.22);
		ctx.lineTo(radius * 0.15, -radius * (angry ? 0.05 : 0.31));
		ctx.lineTo(radius * 0.23, radius * 0.08);
		ctx.closePath();
		ctx.fill();

		ctx.beginPath();
		if (angry) {
			ctx.ellipse(0, radius * 0.34, radius * 0.58, radius * 0.3, 0, 0, TAU);
		} else {
			ctx.moveTo(-radius * 0.44, radius * 0.28);
			ctx.quadraticCurveTo(0, radius * 0.56, radius * 0.44, radius * 0.28);
			ctx.lineTo(radius * 0.32, radius * 0.5);
			ctx.lineTo(-radius * 0.3, radius * 0.5);
			ctx.closePath();
		}
		ctx.fill();
	}

	private drawForegroundMist() {
		const ctx = this.ctx;
		const fog = ctx.createLinearGradient(0, this.height * 0.65, 0, this.height);
		fog.addColorStop(0, 'rgba(68,49,83,0)');
		fog.addColorStop(1, 'rgba(92,70,105,.17)');
		ctx.fillStyle = fog;
		ctx.fillRect(0, this.height * 0.55, this.width, this.height * 0.45);
	}

	private drawVisitor(kind: VisitorKind, elapsed: number) {
		const ctx = this.ctx;
		const cue = elapsed < 0.17 ? 1 - elapsed / 0.17 : 0;
		const enter = this.easeOutBack(this.clamp((elapsed - 0.1) / 0.37, 0, 1));
		const exit = 1 - this.smoothstep(1.04, 1.45, elapsed);
		const alpha = Math.min(1, enter * 1.8) * exit;
		const jitter = elapsed > 0.42 && elapsed < 0.92 ? 3.5 : 0.8;
		const x = this.width / 2 + (this.random() - 0.5) * jitter;
		const y = this.height * 0.54 + (this.random() - 0.5) * jitter;
		const base = Math.min(this.width, this.height) * 0.31;
		const scale = (0.25 + enter * 0.92) * (1 + Math.sin(elapsed * 21) * 0.012);

		ctx.save();
		ctx.fillStyle = `rgba(9,5,15,${0.16 + cue * 0.42})`;
		ctx.fillRect(0, 0, this.width, this.height);
		ctx.globalAlpha = alpha;
		ctx.translate(x, y);
		ctx.scale(scale, scale);

		if (kind === 'pumpkin') this.drawPumpkinVisitor(ctx, base);
		if (kind === 'ghost') this.drawGhostVisitor(ctx, base);
		if (kind === 'doll') this.drawDollVisitor(ctx, base);
		ctx.restore();

		if (elapsed > 0.38 && elapsed < 0.96) this.drawScratchFrames(elapsed);
	}

	private drawPumpkinVisitor(ctx: CanvasRenderingContext2D, size: number) {
		ctx.save();
		ctx.rotate(Math.sin(this.visitorTime * 25) * 0.018);
		this.drawPumpkin(ctx, size, true);
		ctx.fillStyle = '#f7c64b';
		ctx.globalAlpha *= 0.82;
		ctx.beginPath();
		ctx.moveTo(-size * 0.47, -size * 0.19);
		ctx.lineTo(-size * 0.19, -size * 0.04);
		ctx.lineTo(-size * 0.25, size * 0.02);
		ctx.moveTo(size * 0.47, -size * 0.19);
		ctx.lineTo(size * 0.19, -size * 0.04);
		ctx.lineTo(size * 0.25, size * 0.02);
		ctx.fill();
		ctx.restore();
	}

	private drawGhostVisitor(ctx: CanvasRenderingContext2D, size: number) {
		ctx.fillStyle = '#ded4c8';
		ctx.strokeStyle = '#2a192d';
		ctx.lineWidth = size * 0.045;
		ctx.beginPath();
		ctx.moveTo(-size * 0.62, size * 0.74);
		ctx.bezierCurveTo(-size * 0.7, size * 0.05, -size * 0.56, -size * 0.74, 0, -size * 0.82);
		ctx.bezierCurveTo(size * 0.58, -size * 0.74, size * 0.7, size * 0.05, size * 0.62, size * 0.74);
		ctx.quadraticCurveTo(size * 0.36, size * 0.42, size * 0.14, size * 0.76);
		ctx.quadraticCurveTo(-size * 0.08, size * 0.42, -size * 0.28, size * 0.77);
		ctx.quadraticCurveTo(-size * 0.46, size * 0.48, -size * 0.62, size * 0.74);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		ctx.fillStyle = '#16101d';
		ctx.beginPath();
		ctx.ellipse(-size * 0.23, -size * 0.22, size * 0.13, size * 0.24, -0.18, 0, TAU);
		ctx.ellipse(size * 0.23, -size * 0.22, size * 0.13, size * 0.24, 0.18, 0, TAU);
		ctx.ellipse(0, size * 0.25, size * 0.15, size * 0.31, 0, 0, TAU);
		ctx.fill();
	}

	private drawDollVisitor(ctx: CanvasRenderingContext2D, size: number) {
		ctx.strokeStyle = '#321c2c';
		ctx.lineWidth = size * 0.045;
		ctx.fillStyle = '#b98970';
		ctx.beginPath();
		ctx.ellipse(0, 0, size * 0.62, size * 0.76, 0, 0, TAU);
		ctx.fill();
		ctx.stroke();

		ctx.fillStyle = '#291b2b';
		ctx.beginPath();
		ctx.arc(-size * 0.23, -size * 0.15, size * 0.13, 0, TAU);
		ctx.arc(size * 0.23, -size * 0.15, size * 0.13, 0, TAU);
		ctx.fill();
		ctx.fillStyle = '#dcc58f';
		for (const eyeX of [-size * 0.23, size * 0.23]) {
			ctx.fillRect(eyeX - size * 0.018, -size * 0.25, size * 0.036, size * 0.2);
			ctx.fillRect(eyeX - size * 0.1, -size * 0.17, size * 0.2, size * 0.036);
		}

		ctx.strokeStyle = '#4d2331';
		ctx.lineWidth = size * 0.035;
		ctx.beginPath();
		ctx.moveTo(-size * 0.35, size * 0.28);
		ctx.quadraticCurveTo(0, size * 0.55, size * 0.38, size * 0.25);
		ctx.stroke();
		for (let index = -3; index <= 3; index++) {
			const stitchX = index * size * 0.1;
			ctx.beginPath();
			ctx.moveTo(stitchX - size * 0.025, size * 0.34 + Math.abs(index) * size * 0.014);
			ctx.lineTo(stitchX + size * 0.025, size * 0.48 - Math.abs(index) * size * 0.014);
			ctx.stroke();
		}
	}

	private drawScratchFrames(elapsed: number) {
		const ctx = this.ctx;
		const strength = Math.sin((elapsed - 0.38) * Math.PI * 4) * 0.5 + 0.5;
		ctx.save();
		ctx.globalAlpha = 0.08 + strength * 0.12;
		ctx.strokeStyle = '#f4d7ad';
		ctx.lineWidth = 1.2;
		for (let index = 0; index < 6; index++) {
			const x = this.random() * this.width;
			ctx.beginPath();
			ctx.moveTo(x, this.height * 0.08);
			ctx.lineTo(x + (this.random() - 0.5) * 40, this.height * 0.9);
			ctx.stroke();
		}
		ctx.restore();
	}

	private drawVignette() {
		const ctx = this.ctx;
		const gradient = ctx.createRadialGradient(
			this.width / 2,
			this.height / 2,
			Math.min(this.width, this.height) * 0.15,
			this.width / 2,
			this.height / 2,
			Math.max(this.width, this.height) * 0.72
		);
		gradient.addColorStop(0, 'rgba(4,2,9,0)');
		gradient.addColorStop(0.72, 'rgba(4,2,9,.12)');
		gradient.addColorStop(1, 'rgba(4,2,9,.68)');
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, this.width, this.height);
	}

	private random() {
		this.randomState = (Math.imul(this.randomState, 1664525) + 1013904223) >>> 0;
		return this.randomState / 4294967296;
	}

	private clamp(value: number, min: number, max: number) {
		return Math.min(max, Math.max(min, value));
	}

	private smoothstep(edge0: number, edge1: number, value: number) {
		const x = this.clamp((value - edge0) / (edge1 - edge0), 0, 1);
		return x * x * (3 - 2 * x);
	}

	private easeOutBack(value: number) {
		const c1 = 1.70158;
		const c3 = c1 + 1;
		return 1 + c3 * Math.pow(value - 1, 3) + c1 * Math.pow(value - 1, 2);
	}
}
