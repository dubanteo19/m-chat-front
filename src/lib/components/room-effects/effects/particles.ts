export type Effect = "snow" | "sakura";

interface Particle {

    x: number;
    y: number;

    vx: number;
    vy: number;

    size: number;

    alpha: number;

    rotation: number;
    rotationSpeed: number;

    wobble: number;
    wobbleSpeed: number;

    depth: number;
}
export class ParticleEngine {

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    private width = 0;
    private height = 0;

    private particles: Particle[] = [];

    private animation = 0;

    private wind = 0;
    private windVelocity = 0;

    private timer = 0;
    constructor(
        canvas: HTMLCanvasElement,
        private effect: Effect
    ) {
        this.canvas = canvas;

        const ctx = canvas.getContext("2d");

        if (!ctx)
            throw new Error("Canvas not supported");

        this.ctx = ctx;

        this.resize();

        window.addEventListener("resize", this.resize);

        this.createParticles();
    }
    private resize = () => {
        this.width = this.canvas.clientWidth;
        this.height = this.canvas.clientHeight;

        const dpr = window.devicePixelRatio || 1;

        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;

        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // If particles already exist, reposition them
        if (this.particles.length) {
            for (const p of this.particles) {
                p.x = Math.random() * this.width;
                p.y = Math.random() * this.height;
            }
        }
    };

    public start = () => {
        const loop = () => {
            this.update();
            this.draw();

            this.animation = requestAnimationFrame(loop);
        };

        loop();
    };
    private update() {
        this.timer++;

        // Slowly wandering wind
        this.windVelocity += (Math.random() - 0.5) * 0.002;
        this.windVelocity *= 0.985;

        this.wind += this.windVelocity;

        this.wind = Math.max(-0.8, Math.min(0.8, this.wind));

        for (const p of this.particles) {
            p.wobble += p.wobbleSpeed;

            // Wind affects nearby flakes more
            const windForce = this.wind * (0.3 + p.depth);

            // Small turbulence
            const turbulence =
                Math.sin(p.wobble) * (0.4 + p.depth * 0.8);

            p.x += p.vx + windForce + turbulence;

            p.y += p.vy + Math.abs(this.wind) * 0.05;

            p.rotation +=
                p.rotationSpeed +
                this.wind * 0.01;

            if (p.y > this.height + 40) {
                p.y = -40;
                p.x = Math.random() * this.width;

                p.rotation = Math.random() * Math.PI * 2;
                p.wobble = Math.random() * Math.PI * 2;
            }

            if (p.x < -60)
                p.x = this.width + 60;

            if (p.x > this.width + 60)
                p.x = -60;
        }
    }
    public destroy = () => {
        cancelAnimationFrame(this.animation);

        window.removeEventListener("resize", this.resize);
    };
    private createParticles() {
        const COUNT = Math.max(
            120,
            Math.floor((this.width * this.height) / 9000)
        );

        for (let i = 0; i < COUNT; i++) {
            const depth = Math.random();

            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,

                vx: (Math.random() - 0.5) * 0.15,

                vy: 0.6 + depth * 2 + Math.random() * 0.4,

                size: 2 + depth * 8,

                alpha: 0.15 + depth * 0.85,

                rotation: Math.random() * Math.PI * 2,

                rotationSpeed: (Math.random() - 0.5) * 0.03,

                wobble: Math.random() * Math.PI * 2,

                wobbleSpeed: 0.01 + Math.random() * 0.02,

                depth,
            });
        }
    }
    private draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        for (const p of this.particles) {
            this.ctx.save();

            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation);

            this.ctx.globalAlpha = p.alpha;

            // this.ctx.shadowBlur = 10 * p.depth;
            // this.ctx.shadowColor = "white";

            this.drawSnowflake(p.size);

            this.ctx.restore();
        }
    }
    private drawSnowflake(size: number) {
        const c = this.ctx;

        c.strokeStyle = "white";
        c.lineWidth = Math.max(0.8, size * 0.12);
        c.lineCap = "round";

        for (let i = 0; i < 6; i++) {
            c.save();

            c.rotate((Math.PI / 3) * i);

            c.beginPath();

            c.moveTo(0, 0);
            c.lineTo(0, -size);

            // Left branch
            c.moveTo(0, -size * 0.5);
            c.lineTo(-size * 0.18, -size * 0.7);

            // Right branch
            c.moveTo(0, -size * 0.5);
            c.lineTo(size * 0.18, -size * 0.7);

            c.stroke();

            c.restore();
        }
    }
}