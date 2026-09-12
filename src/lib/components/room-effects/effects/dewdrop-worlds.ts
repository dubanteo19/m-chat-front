interface Dewdrop {
	x: number;
	y: number;
	radius: number;
	targetRadius: number;
	age: number;
	lifetime: number;
	phase: number;
	speed: number;
	wobble: number;
	light: number;
	variant: number;
	trailTime: number;
	trailX: number;
	trailY: number;
}

interface DewTrail {
	x: number;
	y: number;
	endX: number;
	endY: number;
	width: number;
	life: number;
}

/** A bounded glass simulation. Forest artwork is cached; only water moves per frame. */
export class DewdropWorlds {
	private width = 0;
	private height = 0;
	private drops: Dewdrop[] = [];
	private trails: DewTrail[] = [];
	private worlds: HTMLCanvasElement[] = [];
	private spawnTime = 0;
	private activityCooldown = 0;
	private time = 0;
	private readonly reducedMotion: boolean;

	constructor(
		private canvas: HTMLCanvasElement,
		private random: () => number
	) {
		this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
		this.worlds = [0, 1, 2].map((variant) => this.createWorld(variant));
		this.resize();
		window.addEventListener('pointerdown', this.onPointerDown, { passive: true });
	}

	private get capacity() {
		return this.width < 600 ? 18 : 30;
	}

	resize() {
		const previousWidth = this.width;
		const previousHeight = this.height;
		this.width = this.canvas.clientWidth;
		this.height = this.canvas.clientHeight;
		if (previousWidth && previousHeight) {
			for (const drop of this.drops) {
				drop.x *= this.width / previousWidth;
				drop.y *= this.height / previousHeight;
				drop.trailX = drop.x;
				drop.trailY = drop.y;
			}
			this.drops = this.drops.slice(0, this.capacity);
			this.trails = [];
		}
		if (this.width > 0 && this.height > 0 && this.drops.length === 0) {
			for (let i = 0; i < this.capacity; i++) this.spawn(true);
		}
	}

	private spawn(initial = false) {
		if (!this.width || !this.height || this.drops.length >= this.capacity) return;
		const radius = 5 + Math.pow(this.random(), 1.8) * (this.width < 600 ? 20 : 31);
		const edgeWidth = Math.min(130, this.width * 0.17);
		const inset = radius + this.random() * Math.max(0, edgeWidth - radius);
		const x = this.random() < 0.5 ? inset : this.width - inset;
		const y = radius + this.random() * Math.max(0, this.height - radius * 3);
		this.drops.push({
			x,
			y,
			radius: initial ? radius : 1,
			targetRadius: radius,
			age: initial ? 3 + this.random() * 12 : 0,
			lifetime: 35 + this.random() * 45,
			phase: this.random() * Math.PI * 2,
			speed: 0,
			wobble: 0,
			light: 0,
			variant: Math.floor(this.random() * this.worlds.length),
			trailTime: 0,
			trailX: x,
			trailY: y
		});
	}

	activity(kind: 'message' | 'reaction') {
		if (this.reducedMotion || this.activityCooldown > 0 || this.drops.length === 0) return;
		this.activityCooldown = 0.65;
		const drop = this.drops[Math.floor(this.random() * this.drops.length)];
		drop.light = 1;
		drop.wobble = 0.7;
		if (kind === 'message') {
			drop.targetRadius = Math.min(46, drop.targetRadius + 3);
			this.spawn();
		}
	}

	private onPointerDown = (event: PointerEvent) => {
		if (this.reducedMotion) return;
		const target = event.target;
		if (!(target instanceof Element) || !this.canvas.parentElement?.parentElement?.contains(target))
			return;
		if (
			target.closest(
				'button, a, input, textarea, select, [contenteditable="true"], [role="dialog"]'
			)
		)
			return;
		const bounds = this.canvas.getBoundingClientRect();
		const x = event.clientX - bounds.left;
		const y = event.clientY - bounds.top;
		const drop = this.drops.find((item) => Math.hypot(item.x - x, item.y - y) < item.radius * 1.15);
		if (drop) {
			drop.wobble = 1;
			drop.light = 1;
			drop.phase += 0.8;
		}
	};

	update(deltaSeconds: number) {
		if (this.reducedMotion || !this.width || !this.height) return;
		const dt = Math.max(0, Math.min(deltaSeconds, 0.05));
		this.time += dt;
		this.activityCooldown = Math.max(0, this.activityCooldown - dt);
		this.spawnTime += dt;
		if (this.spawnTime > 1.6) {
			this.spawnTime = 0;
			this.spawn();
		}

		for (const drop of this.drops) {
			drop.age += dt;
			drop.wobble *= Math.exp(-dt * 3);
			drop.light *= Math.exp(-dt * 1.5);
			const evaporating = drop.age > drop.lifetime && drop.speed < 1;
			if (evaporating) drop.targetRadius = Math.max(0, drop.targetRadius - dt * 2);
			else drop.targetRadius = Math.min(46, drop.targetRadius + dt * 0.12);
			drop.radius += (drop.targetRadius - drop.radius) * (1 - Math.exp(-dt * 1.6));
			// Capillary adhesion holds small drops in place until gravity wins.
			const slideThreshold = this.width < 600 ? 23 : 31;
			const targetSpeed =
				drop.radius > slideThreshold || drop.speed > 4
					? 12 + Math.max(0, drop.radius - slideThreshold) * 3
					: 0;
			drop.speed += (targetSpeed - drop.speed) * (1 - Math.exp(-dt * 1.3));
			if (drop.speed > 1) {
				drop.y += drop.speed * dt;
				const edgeWidth = Math.min(130, this.width * 0.17);
				const left = drop.x < this.width / 2;
				drop.x += Math.sin(this.time * 0.8 + drop.phase) * dt * 3;
				drop.x = left
					? Math.max(drop.radius * 0.5, Math.min(edgeWidth, drop.x))
					: Math.min(this.width - drop.radius * 0.5, Math.max(this.width - edgeWidth, drop.x));
				drop.trailTime += dt;
				if (drop.trailTime > 0.08 && this.trails.length < 200) {
					this.trails.push({
						x: drop.trailX,
						y: drop.trailY,
						endX: drop.x,
						endY: drop.y,
						width: drop.radius * 0.5,
						life: 1
					});
					drop.trailTime = 0;
					drop.trailX = drop.x;
					drop.trailY = drop.y;
				}
			}
		}

		// Nearby surfaces pull together before merging, conserving visible water area.
		for (let i = 0; i < this.drops.length; i++) {
			const a = this.drops[i];
			for (let j = i + 1; j < this.drops.length; j++) {
				const b = this.drops[j];
				const distance = Math.hypot(a.x - b.x, a.y - b.y);
				const contact = a.radius + b.radius;
				if (distance < contact * 1.2 && distance > contact * 0.75) {
					const pull = Math.min(0.05, dt * 0.7);
					const dx = (b.x - a.x) * pull;
					const dy = (b.y - a.y) * pull;
					a.x += dx;
					a.y += dy;
					b.x -= dx;
					b.y -= dy;
					a.wobble = Math.max(a.wobble, 0.15);
					b.wobble = Math.max(b.wobble, 0.15);
				}
				if (distance >= contact * 0.88) continue;
				const areaA = a.radius ** 2;
				const areaB = b.radius ** 2;
				const weight = areaB / Math.max(1, areaA + areaB);
				a.x += (b.x - a.x) * weight;
				a.y += (b.y - a.y) * weight;
				a.trailX = a.x;
				a.trailY = a.y;
				a.targetRadius = Math.min(52, Math.sqrt(a.targetRadius ** 2 + b.targetRadius ** 2));
				a.radius = Math.min(52, Math.sqrt(areaA + areaB));
				a.age = Math.min(a.age, b.age);
				a.wobble = 1;
				a.light = 0.6;
				a.speed = Math.max(a.speed, b.speed);
				this.drops.splice(j--, 1);
			}
		}
		this.drops = this.drops.filter(
			(drop) => drop.y - drop.radius < this.height + 10 && drop.radius > 0.8
		);
		for (const trail of this.trails) trail.life -= dt / 3.2;
		this.trails = this.trails.filter((trail) => trail.life > 0);
	}

	private createWorld(variant: number) {
		const canvas = document.createElement('canvas');
		canvas.width = canvas.height = 160;
		const c = canvas.getContext('2d');
		if (!c) return canvas;
		const sky = c.createLinearGradient(0, 0, 0, 160);
		sky.addColorStop(0, ['#d6f3df', '#c4e8ee', '#e9ecc6'][variant]);
		sky.addColorStop(0.55, '#629e8c');
		sky.addColorStop(1, '#123d3c');
		c.fillStyle = sky;
		c.fillRect(0, 0, 160, 160);
		const sun = c.createRadialGradient(100, 40, 0, 100, 40, 64);
		sun.addColorStop(0, 'rgba(255,252,211,.85)');
		sun.addColorStop(1, 'rgba(255,252,211,0)');
		c.fillStyle = sun;
		c.fillRect(0, 0, 160, 160);
		for (let layer = 0; layer < 3; layer++) {
			c.strokeStyle = ['rgba(48,107,90,.22)', 'rgba(29,83,69,.38)', 'rgba(12,57,45,.65)'][layer];
			c.fillStyle = c.strokeStyle;
			for (let tree = 0; tree < 4; tree++) {
				const x = this.random() * 160;
				const top = 20 + this.random() * 85;
				c.lineWidth = 1 + layer;
				c.beginPath();
				c.moveTo(x, 170);
				c.quadraticCurveTo(x - 8, 90, x + 3, top);
				c.stroke();
				for (let leaf = 0; leaf < 5; leaf++) {
					const y = top + leaf * 15;
					const direction = leaf % 2 ? 1 : -1;
					c.beginPath();
					c.ellipse(
						x + direction * 8,
						y,
						12 + layer * 2,
						3 + layer,
						direction * -0.5,
						0,
						Math.PI * 2
					);
					c.fill();
				}
			}
		}
		return canvas;
	}

	private traceDrop(c: CanvasRenderingContext2D) {
		c.beginPath();
		c.moveTo(-0.12, -0.96);
		c.bezierCurveTo(0.42, -1.04, 0.92, -0.57, 0.96, 0.08);
		c.bezierCurveTo(1.02, 0.72, 0.49, 1.01, -0.07, 0.96);
		c.bezierCurveTo(-0.75, 1.02, -1.02, 0.55, -0.93, -0.08);
		c.bezierCurveTo(-0.9, -0.6, -0.62, -0.94, -0.12, -0.96);
		c.closePath();
	}

	draw(c: CanvasRenderingContext2D) {
		const alpha = c.globalAlpha;
		for (const trail of this.trails) {
			c.save();
			c.lineCap = 'round';
			c.lineWidth = trail.width;
			c.strokeStyle = `rgba(183,223,215,${trail.life * 0.055})`;
			c.beginPath();
			c.moveTo(trail.x, trail.y);
			c.lineTo(trail.endX, trail.endY);
			c.stroke();
			c.restore();
		}
		for (const drop of this.drops) {
			c.save();
			const fade = Math.min(1, drop.age / 2, drop.radius / 4);
			c.globalAlpha = alpha * fade;
			const wobble = Math.sin(this.time * 13 + drop.phase) * drop.wobble * 0.12;
			const stretch = Math.min(0.24, drop.speed * 0.004);
			c.translate(drop.x, drop.y);
			c.scale(drop.radius * (1 + wobble - stretch * 0.4), drop.radius * (1 - wobble + stretch));

			// A dark lower meniscus reads on light themes; the bright rim reads on dark themes.
			this.traceDrop(c);
			c.fillStyle = 'rgba(14,55,53,.13)';
			c.fill();
			c.save();
			c.clip();
			if (drop.radius > 10) {
				c.globalAlpha *= 0.36;
				const parallax = Math.sin(this.time * 0.22 + drop.phase) * 0.08;
				c.drawImage(this.worlds[drop.variant], -1.14 + parallax, -1.12, 2.28, 2.28);
				c.globalAlpha = alpha * fade;
				// Pollen lives inside the lens rather than drifting across the chat.
				for (let i = 0; i < 4; i++) {
					const phase = drop.phase + i * 2.4;
					const x = Math.sin(this.time * 0.22 + phase) * 0.65;
					const y = Math.cos(this.time * 0.18 + phase * 1.3) * 0.6;
					c.fillStyle = `rgba(255,247,194,${0.25 + drop.light * 0.5})`;
					c.beginPath();
					c.arc(x, y, 0.018 + drop.light * 0.008, 0, Math.PI * 2);
					c.fill();
				}
			}
			const glass = c.createRadialGradient(-0.3, -0.4, 0.06, 0.04, 0.03, 1.12);
			glass.addColorStop(0, 'rgba(240,255,252,.13)');
			glass.addColorStop(0.65, 'rgba(160,225,212,.015)');
			glass.addColorStop(0.86, 'rgba(15,65,61,.17)');
			glass.addColorStop(1, 'rgba(211,255,242,.37)');
			c.fillStyle = glass;
			c.fillRect(-1.2, -1.2, 2.4, 2.4);
			c.restore();

			this.traceDrop(c);
			c.lineWidth = 0.8 / drop.radius;
			c.strokeStyle = 'rgba(197,241,230,.52)';
			c.stroke();
			c.lineCap = 'round';
			c.lineWidth = 1.5 / drop.radius;
			c.strokeStyle = `rgba(255,255,255,${0.55 + drop.light * 0.3})`;
			c.beginPath();
			c.moveTo(-0.68, -0.24);
			c.bezierCurveTo(-0.66, -0.6, -0.42, -0.76, -0.14, -0.78);
			c.stroke();
			c.lineWidth = 1 / drop.radius;
			c.strokeStyle = 'rgba(221,255,232,.58)';
			c.beginPath();
			c.moveTo(0.02, 0.79);
			c.quadraticCurveTo(0.47, 0.87, 0.71, 0.5);
			c.stroke();
			c.restore();
		}
	}

	destroy() {
		window.removeEventListener('pointerdown', this.onPointerDown);
		this.drops = [];
		this.trails = [];
		this.worlds = [];
	}
}
