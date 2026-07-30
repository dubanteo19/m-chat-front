export type Effect =
    | "snow"
    | "sakura"
    | "aurora"
    | "thunderstorm"
    | "radiance-of-amitabha";

const sakuraColors = [
    "#ffd7e5",
    "#ffc8dc",
    "#ffe7ef",
    "#f7bfd0",
];

const amitabhaGlyphs = ["अ", "मि", "ता", "भ"];

type AmitabhaParticleKind = "light" | "lotus" | "glyph";

interface Particle {
    originX: number;
    originY: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    length: number;
    alpha: number;
    rotation: number;
    rotationSpeed: number;
    wobble: number;
    wobbleSpeed: number;
    depth: number;
    flutter: number;
    flutterSpeed: number;
    kind?: AmitabhaParticleKind;
    glyphIndex?: number;
    variant?: number;
    colorIndex?: number;
    baseAlpha?: number;
}

export class ParticleEngine {

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private width = 0;
    private height = 0;
    private particles: Particle[] = [];
    private animation = 0;
    private wind = 0;
    private timer = 0;
    private lastFrameTime = 0;
    private isRunning = false;
    private isStopping = false;
    private transitionAlpha = 0;
    private randomState: number;

    // Cached layers for the Amitabha effect. The expensive gradients,
    // shadows, vector paths and glyph rendering are rasterized once.
    private amitabhaBackdrop: HTMLCanvasElement | null = null;
    private amitabhaFigure: HTMLCanvasElement | null = null;
    private amitabhaParticleSprites = new Map<string, HTMLCanvasElement>();
    private readonly amitabhaSpriteDpr = 1.5;

    constructor(
        canvas: HTMLCanvasElement,
        private effect: Effect,
        seed = Date.now()
    ) {
        this.canvas = canvas;
        this.randomState = seed >>> 0 || 1;
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

        const deviceDpr = window.devicePixelRatio || 1;
        const isLargeAmitabhaCanvas =
            this.effect === "radiance-of-amitabha" &&
            this.width * this.height > 1_400_000;

        // The Amitabha effect relies on soft glows, so a slightly lower DPR
        // is visually harmless and saves a large amount of fill-rate.
        const maxDpr =
            this.effect === "radiance-of-amitabha"
                ? isLargeAmitabhaCanvas
                    ? 1.25
                    : 1.5
                : 2;

        const dpr = Math.min(deviceDpr, maxDpr);

        this.canvas.width = Math.round(this.width * dpr);
        this.canvas.height = Math.round(this.height * dpr);

        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        if (this.effect === "radiance-of-amitabha") {
            this.rebuildAmitabhaCaches();
        }

        // Recreate particles so density stays balanced after resize.
        if (this.particles.length) {
            this.createParticles(true);
        }
    };

    public start = (elapsedMs = 0) => {
        if (this.isRunning)
            return;

        this.isRunning = true;
        this.isStopping = false;
        this.transitionAlpha = 0;
        this.timer = Math.max(0, elapsedMs / 1000);
        this.lastFrameTime = performance.now();

        const loop = (frameTime: number) => {
            if (!this.isRunning)
                return;

            const deltaSeconds = Math.min(
                (frameTime - this.lastFrameTime) / 1000,
                0.05
            );

            this.lastFrameTime = frameTime;
            this.timer += deltaSeconds;

            this.updateTransition(deltaSeconds);
            this.update(deltaSeconds);
            this.draw();

            if (!this.isRunning)
                return;

            this.animation = requestAnimationFrame(loop);
        };

        this.animation = requestAnimationFrame(loop);
    };

    private updateTransition(deltaSeconds: number) {
        const transitionDuration =
            this.isStopping ? 0.45 : 0.65;

        const direction = this.isStopping ? -1 : 1;

        this.transitionAlpha = this.clamp(
            this.transitionAlpha +
            direction * deltaSeconds / transitionDuration,
            0,
            1
        );

        if (
            this.isStopping &&
            this.transitionAlpha <= 0
        ) {
            this.cleanup();
        }
    }

    private update(deltaSeconds: number) {
        this.updateWind();

        for (const p of this.particles) {
            if (this.effect === "snow") {
                this.updateSnowParticle(p, deltaSeconds);
                continue;
            }

            if (this.effect === "sakura") {
                this.updateSakuraParticle(p, deltaSeconds);
                continue;
            }

            if (this.effect === "thunderstorm") {
                this.updateRainParticle(p, deltaSeconds);
                continue;
            }

            if (this.effect === "aurora") {
                this.updateAuroraParticle(p, deltaSeconds);
                continue;
            }

            if (this.effect === "radiance-of-amitabha") {
                this.updateAmitabhaParticle(p, deltaSeconds);
            }
        }
    }

    private updateWind() {
        if (this.effect === "thunderstorm") {
            // Layered sine waves create strong but continuous gale movement.
            this.wind =
                0.75 +
                Math.sin(this.timer * 0.72) * 0.16 +
                Math.sin(this.timer * 0.21 + 1.4) * 0.09;
            return;
        }

        if (this.effect === "aurora") {
            this.wind =
                Math.sin(this.timer * 0.28) * 0.18 +
                Math.sin(this.timer * 0.11 + 0.8) * 0.08;
            return;
        }

        if (this.effect === "snow") {
            const softGust =
                Math.pow(
                    Math.max(
                        0,
                        Math.sin(this.timer * 0.19 + 0.7)
                    ),
                    3
                ) * 0.16;

            this.wind =
                Math.sin(this.timer * 0.28) * 0.2 +
                Math.sin(this.timer * 0.09 + 1.4) * 0.09 +
                softGust;
            return;
        }

        if (this.effect === "sakura") {
            const breezeWave =
                Math.pow(
                    Math.max(
                        0,
                        Math.sin(this.timer * 0.24 + 0.4)
                    ),
                    2
                ) * 0.18;

            this.wind =
                0.32 +
                Math.sin(this.timer * 0.38) * 0.11 +
                Math.sin(this.timer * 0.12 + 1.1) * 0.06 +
                breezeWave;
            return;
        }

        if (this.effect === "radiance-of-amitabha") {
            this.wind =
                Math.sin(this.timer * 0.22) * 0.06 +
                Math.sin(this.timer * 0.09 + 1.1) * 0.025;
            return;
        }

        this.wind =
            Math.sin(this.timer * 0.45) * 0.38 +
            Math.sin(this.timer * 0.17 + 1.2) * 0.18;
    }

    private updateSnowParticle(
        p: Particle,
        deltaSeconds: number
    ) {
        p.wobble += p.wobbleSpeed * deltaSeconds;
        p.flutter += p.flutterSpeed * deltaSeconds;

        const depthWind = this.wind * (14 + p.depth * 30);
        const meander =
            Math.sin(p.wobble) * (5 + p.depth * 12) +
            Math.sin(p.flutter * 0.52 + p.wobble) * 3;

        p.x += (p.vx + depthWind + meander) * deltaSeconds;
        p.y +=
            (
                p.vy +
                Math.sin(p.flutter) * (1.5 + p.depth * 2.5)
            ) * deltaSeconds;

        p.rotation +=
            (
                p.rotationSpeed +
                this.wind * 0.12
            ) * deltaSeconds;

        const shimmer =
            0.88 +
            Math.sin(p.flutter * 0.7 + p.wobble) * 0.12;

        p.alpha =
            (p.baseAlpha ?? 0.5) * shimmer;

        if (p.y > this.height + 36) {
            p.y = -36;
            p.x = this.random() * this.width;
            p.wobble = this.random() * Math.PI * 2;
            p.flutter = this.random() * Math.PI * 2;
        }

        this.wrapHorizontal(p, 54);
    }

    private updateSakuraParticle(
        p: Particle,
        deltaSeconds: number
    ) {
        p.wobble += p.wobbleSpeed * deltaSeconds;
        p.flutter += p.flutterSpeed * deltaSeconds;

        const breeze = this.wind * (24 + p.depth * 42);
        const ribbonMotion =
            Math.sin(p.wobble) * (12 + p.depth * 18) +
            Math.sin(p.wobble * 0.47 + p.flutter) * 5;

        p.x +=
            (p.vx + breeze + ribbonMotion) *
            deltaSeconds;

        p.y +=
            (
                p.vy +
                Math.sin(p.flutter * 0.55) *
                    (4 + p.depth * 6)
            ) * deltaSeconds;

        p.rotation +=
            (
                p.rotationSpeed +
                Math.sin(p.flutter) * 0.45 +
                this.wind * 0.2
            ) * deltaSeconds;

        const softPulse =
            0.9 +
            Math.sin(p.flutter * 0.4 + p.wobble) * 0.1;

        p.alpha =
            (p.baseAlpha ?? 0.72) * softPulse;

        if (
            p.y > this.height + 44 ||
            p.x > this.width + 90
        ) {
            p.y = -30 - this.random() * 80;
            p.x = -50 + this.random() * this.width * 0.42;
            p.rotation = this.random() * Math.PI * 2;
            p.wobble = this.random() * Math.PI * 2;
            p.flutter = this.random() * Math.PI * 2;
        }

        if (p.x < -100)
            p.x = this.width + 70;
    }

    private updateAuroraParticle(
        p: Particle,
        deltaSeconds: number
    ) {
        const horizontalSpan = this.width + 60;
        const driftSpeed =
            p.vx + this.wind * 12;

        p.x =
            (
                p.originX +
                this.timer * driftSpeed +
                30
            ) % horizontalSpan - 30;

        p.y =
            p.originY +
            Math.sin(
                this.timer * p.wobbleSpeed +
                p.wobble
            ) * p.vy;

        p.rotation =
            p.wobble * 0.16 +
            this.timer * p.rotationSpeed;

        const pulse =
            0.72 +
            Math.sin(
                this.timer * p.flutterSpeed +
                p.flutter
            ) * 0.28;

        p.alpha =
            (0.15 + p.depth * 0.35) *
            pulse;
    }

    private updateRainParticle(
        p: Particle,
        _deltaSeconds: number
    ) {
        const verticalSpan =
            this.height + p.length + 140;

        const horizontalSpan =
            this.width + 420;

        const gustOffset =
            Math.sin(
                this.timer * 0.72 +
                p.wobble
            ) * (16 + p.depth * 24) +
            Math.sin(
                this.timer * 0.21 + 1.4
            ) * 22;

        p.y =
            (
                p.originY +
                this.timer * p.vy +
                p.length +
                100
            ) % verticalSpan -
            p.length -
            100;

        p.x =
            (
                p.originX +
                this.timer * p.vx +
                gustOffset +
                210
            ) % horizontalSpan -
            210;
    }

    private updateAmitabhaParticle(
        p: Particle,
        _deltaSeconds: number
    ) {
        const centerX = this.width * 0.5;
        const centerY = this.height * 0.46;

        const cycleDuration =
            p.kind === "glyph"
                ? 8.8
                : p.kind === "lotus"
                    ? 7.4
                    : 6.6;

        const phaseOffset =
            p.flutter / (Math.PI * 2);

        const phase =
            (this.timer / cycleDuration + phaseOffset) % 1;

        const eased =
            phase * phase * (3 - 2 * phase);

        const orbit =
            p.originY +
            this.timer * p.rotationSpeed +
            Math.sin(
                this.timer * p.wobbleSpeed +
                p.wobble
            ) * (p.kind === "glyph" ? 0.055 : 0.12);

        const radius =
            p.originX + eased * p.length;

        const verticalScale =
            p.kind === "glyph" ? 0.82 : 0.68;

        const rise =
            eased *
            (p.kind === "glyph"
                ? 46
                : p.kind === "lotus"
                    ? 28
                    : 18);

        p.x = centerX + Math.cos(orbit) * radius;
        p.y =
            centerY +
            Math.sin(orbit) * radius * verticalScale -
            rise;

        if (p.kind === "glyph") {
            p.rotation =
                Math.sin(
                    this.timer * 0.35 +
                    p.wobble
                ) * 0.045;
        } else {
            p.rotation =
                orbit +
                Math.PI * 0.5 +
                Math.sin(
                    this.timer * p.flutterSpeed +
                    p.flutter
                ) * 0.12;
        }

        const envelope = Math.sin(Math.PI * phase);
        const pulse =
            0.84 +
            Math.sin(
                this.timer * p.flutterSpeed +
                p.flutter
            ) * 0.16;

        const baseAlpha =
            p.kind === "glyph"
                ? 0.56
                : p.kind === "lotus"
                    ? 0.46
                    : 0.24 + p.depth * 0.34;

        p.alpha =
            baseAlpha * envelope * pulse;
    }

    private wrapHorizontal(p: Particle, margin: number) {
        if (p.x < -margin)
            p.x = this.width + margin;

        if (p.x > this.width + margin)
            p.x = -margin;
    }

    public stop = () => {
        if (!this.isRunning || this.isStopping)
            return;

        this.isStopping = true;
    };

    public destroy = () => {
        this.cleanup();
    };

    private cleanup() {
        this.isRunning = false;
        this.isStopping = false;
        this.transitionAlpha = 0;

        cancelAnimationFrame(this.animation);
        window.removeEventListener("resize", this.resize);

        this.ctx.clearRect(0, 0, this.width, this.height);

        this.amitabhaBackdrop = null;
        this.amitabhaFigure = null;
        this.amitabhaParticleSprites.clear();
    }

    private createParticles(reset = false) {
        if (reset)
            this.particles = [];

        const count = this.getParticleCount();

        for (let i = 0; i < count; i++) {
            const depth = this.random();

            switch (this.effect) {
                case "snow":
                    this.particles.push(
                        this.createSnowParticle(depth)
                    );
                    break;

                case "sakura":
                    this.particles.push(
                        this.createSakuraParticle(depth)
                    );
                    break;

                case "aurora":
                    this.particles.push(
                        this.createAuroraParticle(depth)
                    );
                    break;

                case "thunderstorm":
                    this.particles.push(
                        this.createRainParticle(depth)
                    );
                    break;

                case "radiance-of-amitabha":
                    this.particles.push(
                        this.createAmitabhaParticle(
                            depth,
                            i,
                            count
                        )
                    );
                    break;
            }
        }
    }

    private getParticleCount() {
        const area = this.width * this.height;

        switch (this.effect) {
            case "snow":
                return this.clamp(
                    Math.floor(area / 11500),
                    72,
                    132
                );

            case "sakura":
                return this.clamp(
                    Math.floor(area / 15500),
                    54,
                    96
                );

            case "aurora":
                return this.clamp(
                    Math.floor(area / 28000),
                    24,
                    54
                );

            case "thunderstorm":
                return this.clamp(
                    Math.floor(area / 5200),
                    90,
                    210
                );

            case "radiance-of-amitabha":
                return this.clamp(
                    Math.floor(area / 36000),
                    24,
                    38
                );

            default:
                return Math.max(
                    120,
                    Math.floor(area / 9000)
                );
        }
    }

    private createSnowParticle(depth: number): Particle {
        const x = this.random() * this.width;
        const y = this.random() * this.height;
        const selector = this.random();
        const variant =
            selector < 0.54
                ? 0
                : selector < 0.88
                    ? 1
                    : 2;

        const baseSize =
            variant === 0
                ? 1.1 + depth * 2.2
                : variant === 1
                    ? 2 + depth * 3.8
                    : 3.2 + depth * 5.2;

        const baseAlpha =
            variant === 0
                ? 0.2 + depth * 0.34
                : variant === 1
                    ? 0.34 + depth * 0.44
                    : 0.46 + depth * 0.46;

        return {
            originX: x,
            originY: y,
            x,
            y,

            vx: (this.random() - 0.5) * 7,
            vy:
                22 +
                depth * 70 +
                this.random() * 18,

            size: baseSize,
            length: 0,
            alpha: baseAlpha,

            rotation: this.random() * Math.PI * 2,
            rotationSpeed:
                (this.random() - 0.5) *
                (variant === 2 ? 0.7 : 0.42),

            wobble: this.random() * Math.PI * 2,
            wobbleSpeed: 0.55 + this.random() * 0.85,

            flutter: this.random() * Math.PI * 2,
            flutterSpeed: 0.5 + this.random() * 0.8,

            depth,
            variant,
            baseAlpha,
        };
    }

    private createSakuraParticle(depth: number): Particle {
        const x =
            -40 +
            this.random() * (this.width + 80);
        const y =
            -40 +
            this.random() * (this.height + 80);
        const selector = this.random();
        const variant =
            selector < 0.8
                ? 0
                : selector < 0.96
                    ? 1
                    : 2;

        const baseAlpha =
            variant === 2
                ? 0.56 + depth * 0.3
                : 0.46 + depth * 0.42;

        return {
            originX: x,
            originY: y,
            x,
            y,

            vx: 14 + this.random() * 18,
            vy: 18 + depth * 50 + this.random() * 12,

            size:
                variant === 2
                    ? 4.2 + depth * 5.2
                    : 5 + depth * 7.5,
            length: 0,
            alpha: baseAlpha,

            rotation: this.random() * Math.PI * 2,
            rotationSpeed: (this.random() - 0.5) * 1.05,

            wobble: this.random() * Math.PI * 2,
            wobbleSpeed: 1.2 + this.random() * 1.7,

            flutter: this.random() * Math.PI * 2,
            flutterSpeed: 2.2 + this.random() * 2.6,

            depth,
            variant,
            colorIndex:
                Math.floor(
                    this.random() * sakuraColors.length
                ),
            baseAlpha,
        };
    }

    private createAuroraParticle(depth: number): Particle {
        const originX = this.random() * this.width;
        const originY = this.random() * this.height;

        return {
            originX,
            originY,
            x: originX,
            y: originY,

            vx: 8 + depth * 14,
            vy: 6 + depth * 12,

            size: 0.8 + depth * 2.1,
            length: 0,
            alpha: 0.15 + depth * 0.35,

            rotation: this.random() * Math.PI * 2,
            rotationSpeed: (this.random() - 0.5) * 0.3,

            wobble: this.random() * Math.PI * 2,
            wobbleSpeed: 0.3 + this.random() * 0.45,

            flutter: this.random() * Math.PI * 2,
            flutterSpeed: 0.8 + this.random() * 1.2,

            depth,
        };
    }

    private createRainParticle(depth: number): Particle {
        const originX =
            this.random() * (this.width + 420) -
            210;

        const originY =
            this.random() * (this.height + 140) -
            100;

        const particle: Particle = {
            originX,
            originY,
            x: originX,
            y: originY,

            vx: 125 + depth * 95,
            vy: 520 + depth * 500,

            size: 0.7 + depth * 1.1,
            length: 12 + depth * 24,
            alpha: 0.12 + depth * 0.38,

            rotation: 0,
            rotationSpeed: 0,

            wobble: this.random() * Math.PI * 2,
            wobbleSpeed: 0.8 + this.random() * 1.2,

            flutter: 0,
            flutterSpeed: 0,

            depth,
        };

        return particle;
    }

    private createAmitabhaParticle(
        depth: number,
        index: number,
        total: number
    ): Particle {
        const glyphCount = this.clamp(
            Math.floor(total * 0.14),
            4,
            6
        );

        const lotusCount = this.clamp(
            Math.floor(total * 0.22),
            6,
            8
        );

        const kind: AmitabhaParticleKind =
            index < glyphCount
                ? "glyph"
                : index < glyphCount + lotusCount
                    ? "lotus"
                    : "light";

        const angle =
            (index / Math.max(total, 1)) *
            Math.PI * 2 +
            (this.random() - 0.5) * 0.48;

        const baseRadius =
            kind === "glyph"
                ? 62 + this.random() * 30
                : kind === "lotus"
                    ? 76 + this.random() * 54
                    : 48 + this.random() * 112;

        const travelDistance =
            kind === "glyph"
                ? 128 + depth * 64
                : kind === "lotus"
                    ? 92 + depth * 76
                    : 76 + depth * 110;

        const centerX = this.width * 0.5;
        const centerY = this.height * 0.46;

        return {
            originX: baseRadius,
            originY: angle,
            x: centerX + Math.cos(angle) * baseRadius,
            y:
                centerY +
                Math.sin(angle) * baseRadius * 0.68,

            vx: 0,
            vy: 0,

            size:
                kind === "glyph"
                    ? 17 + depth * 7
                    : kind === "lotus"
                        ? 5 + depth * 7
                        : 0.9 + depth * 2.2,
            length: travelDistance,
            alpha: 0,

            rotation: 0,
            rotationSpeed:
                kind === "glyph"
                    ? (this.random() - 0.5) * 0.018
                    : (this.random() - 0.5) * 0.08,

            wobble: this.random() * Math.PI * 2,
            wobbleSpeed: 0.18 + this.random() * 0.24,

            flutter: this.random() * Math.PI * 2,
            flutterSpeed: 0.42 + this.random() * 0.5,

            depth,
            kind,
            glyphIndex:
                kind === "glyph"
                    ? index % amitabhaGlyphs.length
                    : undefined,
        };
    }

    private draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.ctx.save();
        this.ctx.globalAlpha = this.transitionAlpha;

        if (this.effect === "snow") {
            this.drawSnowBackground();
        }

        if (this.effect === "sakura") {
            this.drawSakuraBackground();
        }

        if (this.effect === "aurora") {
            this.drawAuroraBackground();
        }

        if (this.effect === "thunderstorm") {
            this.drawStormBackground();
        }

        if (this.effect === "radiance-of-amitabha") {
            this.drawAmitabhaBackground();
        }

        this.ctx.restore();

        if (this.effect === "radiance-of-amitabha") {
            this.drawAmitabhaParticlesOptimized();
            return;
        }

        for (const p of this.particles) {
            this.ctx.save();

            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation);
            this.ctx.globalAlpha =
                p.alpha * this.transitionAlpha;

            switch (this.effect) {
                case "snow":
                    this.drawSnowParticle(p);
                    break;

                case "sakura":
                    this.drawSakuraParticle(p);
                    break;

                case "aurora":
                    this.drawAuroraSpark(p.size);
                    break;

                case "thunderstorm":
                    this.drawRainDrop(p);
                    break;

            }

            this.ctx.restore();
        }

        if (this.effect === "thunderstorm") {
            this.ctx.save();
            this.ctx.globalAlpha = this.transitionAlpha;
            this.drawLightning();
            this.ctx.restore();
        }

    }

    private drawAmitabhaBackground() {
        const c = this.ctx;
        const centerX = this.width * 0.5;
        const centerY = this.height * 0.46;
        const viewportScale = this.clamp(
            Math.min(this.width, this.height) / 640,
            0.72,
            1.14
        );

        const breathe =
            0.97 +
            Math.sin(this.timer * 0.72) * 0.015 +
            Math.sin(this.timer * 0.29 + 0.8) * 0.006;

        if (this.amitabhaBackdrop) {
            c.drawImage(
                this.amitabhaBackdrop,
                0,
                0,
                this.width,
                this.height
            );
        }

        if (!this.amitabhaFigure)
            return;

        c.save();
        c.translate(centerX, centerY);
        c.scale(
            viewportScale * breathe,
            viewportScale * breathe
        );
        c.globalCompositeOperation = "screen";

        const logicalWidth =
            this.amitabhaFigure.width /
            this.amitabhaSpriteDpr;
        const logicalHeight =
            this.amitabhaFigure.height /
            this.amitabhaSpriteDpr;

        c.drawImage(
            this.amitabhaFigure,
            -logicalWidth * 0.5,
            -logicalHeight * 0.5,
            logicalWidth,
            logicalHeight
        );

        // One lightweight animated ring keeps the cached center alive
        // without rebuilding its gradients and paths every frame.
        c.rotate(this.timer * 0.018);
        c.strokeStyle = "rgba(254, 243, 199, 0.13)";
        c.lineWidth = 1;
        c.setLineDash([3, 12]);
        c.beginPath();
        c.arc(0, -24, 142, 0, Math.PI * 2);
        c.stroke();
        c.setLineDash([]);

        c.restore();
    }

    private rebuildAmitabhaCaches() {
        this.amitabhaParticleSprites.clear();
        this.amitabhaBackdrop =
            this.createAmitabhaBackdropCache();
        this.amitabhaFigure =
            this.createAmitabhaFigureCache();
    }

    private createAmitabhaBackdropCache() {
        // The backdrop is deliberately rendered below native resolution;
        // it only contains a broad blurred glow and scales cleanly.
        const scale =
            this.width * this.height > 1_400_000
                ? 0.5
                : 0.7;
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(
            1,
            Math.round(this.width * scale)
        );
        canvas.height = Math.max(
            1,
            Math.round(this.height * scale)
        );

        const c = canvas.getContext("2d");
        if (!c)
            return canvas;

        c.setTransform(scale, 0, 0, scale, 0, 0);

        const centerX = this.width * 0.5;
        const centerY = this.height * 0.46;
        const backgroundGlow = c.createRadialGradient(
            centerX,
            centerY,
            0,
            centerX,
            centerY,
            Math.max(this.width, this.height) * 0.58
        );

        backgroundGlow.addColorStop(
            0,
            "rgba(255, 247, 214, 0.12)"
        );
        backgroundGlow.addColorStop(
            0.34,
            "rgba(251, 191, 36, 0.065)"
        );
        backgroundGlow.addColorStop(
            0.72,
            "rgba(244, 114, 182, 0.025)"
        );
        backgroundGlow.addColorStop(
            1,
            "rgba(120, 53, 15, 0)"
        );

        c.fillStyle = backgroundGlow;
        c.fillRect(0, 0, this.width, this.height);

        return canvas;
    }

    private createAmitabhaFigureCache() {
        const logicalWidth = 390;
        const logicalHeight = 430;
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(
            logicalWidth * this.amitabhaSpriteDpr
        );
        canvas.height = Math.round(
            logicalHeight * this.amitabhaSpriteDpr
        );

        const cacheCtx = canvas.getContext("2d");
        if (!cacheCtx)
            return canvas;

        cacheCtx.setTransform(
            this.amitabhaSpriteDpr,
            0,
            0,
            this.amitabhaSpriteDpr,
            0,
            0
        );
        cacheCtx.translate(
            logicalWidth * 0.5,
            logicalHeight * 0.5
        );

        const originalCtx = this.ctx;
        const originalTimer = this.timer;

        this.ctx = cacheCtx;
        this.timer = 0;

        this.drawAmitabhaHalo();
        this.drawAmitabhaLotusBase();
        this.drawAmitabhaFigure();

        this.ctx = originalCtx;
        this.timer = originalTimer;

        return canvas;
    }

    private drawAmitabhaParticlesOptimized() {
        const c = this.ctx;

        c.save();
        c.globalCompositeOperation = "screen";

        for (const p of this.particles) {
            const alpha =
                p.alpha * this.transitionAlpha;

            if (alpha <= 0.003)
                continue;

            const sprite =
                this.getAmitabhaParticleSprite(p);
            const logicalWidth =
                sprite.width / this.amitabhaSpriteDpr;
            const logicalHeight =
                sprite.height / this.amitabhaSpriteDpr;

            c.save();
            c.translate(p.x, p.y);
            c.rotate(p.rotation);
            c.globalAlpha = alpha;
            c.drawImage(
                sprite,
                -logicalWidth * 0.5,
                -logicalHeight * 0.5,
                logicalWidth,
                logicalHeight
            );
            c.restore();
        }

        c.restore();
    }

    private getAmitabhaParticleSprite(p: Particle) {
        const sizeBucket = Math.max(
            2,
            Math.round(p.size / 2) * 2
        );
        const tone = p.depth > 0.55 ? "bright" : "soft";
        const glyphIndex = p.glyphIndex ?? 0;
        const key =
            `${p.kind ?? "light"}:` +
            `${sizeBucket}:${tone}:${glyphIndex}`;

        const cached =
            this.amitabhaParticleSprites.get(key);

        if (cached)
            return cached;

        const sprite = this.createAmitabhaParticleSprite(
            p.kind ?? "light",
            sizeBucket,
            tone,
            glyphIndex
        );

        this.amitabhaParticleSprites.set(key, sprite);
        return sprite;
    }

    private createAmitabhaParticleSprite(
        kind: AmitabhaParticleKind,
        size: number,
        tone: string,
        glyphIndex: number
    ) {
        const logicalSize =
            kind === "glyph"
                ? size * 2.8 + 24
                : kind === "lotus"
                    ? size * 3.8 + 18
                    : size * 5 + 16;
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(
            1,
            Math.ceil(logicalSize * this.amitabhaSpriteDpr)
        );
        canvas.height = canvas.width;

        const c = canvas.getContext("2d");
        if (!c)
            return canvas;

        c.setTransform(
            this.amitabhaSpriteDpr,
            0,
            0,
            this.amitabhaSpriteDpr,
            0,
            0
        );
        c.translate(logicalSize * 0.5, logicalSize * 0.5);

        if (kind === "glyph") {
            const glyph =
                amitabhaGlyphs[
                    glyphIndex % amitabhaGlyphs.length
                ];

            c.fillStyle = "rgba(255, 247, 214, 0.92)";
            c.shadowColor = "rgba(253, 224, 71, 0.56)";
            c.shadowBlur = 7;
            c.font =
                `600 ${size}px ` +
                `"Nirmala UI", "Noto Sans Devanagari", serif`;
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.fillText(glyph, 0, 0);
            return canvas;
        }

        if (kind === "lotus") {
            c.fillStyle =
                tone === "bright"
                    ? "rgba(255, 247, 214, 0.74)"
                    : "rgba(251, 207, 232, 0.68)";
            c.strokeStyle = "rgba(254, 243, 199, 0.32)";
            c.lineWidth = Math.max(0.7, size * 0.08);
            c.shadowColor = "rgba(253, 224, 71, 0.32)";
            c.shadowBlur = 4;

            c.beginPath();
            c.moveTo(0, -size);
            c.bezierCurveTo(
                size * 0.68,
                -size * 0.42,
                size * 0.55,
                size * 0.52,
                0,
                size
            );
            c.bezierCurveTo(
                -size * 0.55,
                size * 0.52,
                -size * 0.68,
                -size * 0.42,
                0,
                -size
            );
            c.fill();
            c.stroke();
            return canvas;
        }

        c.fillStyle =
            tone === "bright"
                ? "rgba(255, 251, 235, 0.92)"
                : "rgba(253, 224, 71, 0.76)";
        c.shadowColor = "rgba(253, 224, 71, 0.45)";
        c.shadowBlur = 5;
        c.beginPath();
        c.arc(0, 0, size, 0, Math.PI * 2);
        c.fill();

        return canvas;
    }

    private drawAmitabhaHalo() {
        const c = this.ctx;
        const pulse =
            0.92 + Math.sin(this.timer * 0.64) * 0.08;

        const outerGlow = c.createRadialGradient(
            0,
            -22,
            24,
            0,
            -22,
            174
        );

        outerGlow.addColorStop(
            0,
            `rgba(255, 251, 235, ${0.2 * pulse})`
        );
        outerGlow.addColorStop(
            0.36,
            `rgba(253, 224, 71, ${0.12 * pulse})`
        );
        outerGlow.addColorStop(
            0.7,
            `rgba(251, 146, 60, ${0.045 * pulse})`
        );
        outerGlow.addColorStop(
            1,
            "rgba(251, 146, 60, 0)"
        );

        c.fillStyle = outerGlow;
        c.beginPath();
        c.arc(0, -22, 174, 0, Math.PI * 2);
        c.fill();

        c.save();
        c.translate(0, -24);
        c.rotate(this.timer * 0.018);
        c.strokeStyle = "rgba(254, 243, 199, 0.22)";
        c.lineWidth = 1.1;

        for (let i = 0; i < 16; i++) {
            const angle = (Math.PI * 2 * i) / 16;
            const inner = 105;
            const outer = 134 + (i % 2) * 10;

            c.beginPath();
            c.moveTo(
                Math.cos(angle) * inner,
                Math.sin(angle) * inner
            );
            c.lineTo(
                Math.cos(angle) * outer,
                Math.sin(angle) * outer
            );
            c.stroke();
        }

        c.restore();

        c.strokeStyle = "rgba(255, 247, 214, 0.5)";
        c.lineWidth = 2;
        c.beginPath();
        c.arc(0, -67, 39, 0, Math.PI * 2);
        c.stroke();

        c.strokeStyle = "rgba(253, 224, 71, 0.22)";
        c.lineWidth = 1.2;
        c.beginPath();
        c.ellipse(0, -20, 92, 142, 0, 0, Math.PI * 2);
        c.stroke();
    }

    private drawAmitabhaFigure() {
        const c = this.ctx;

        c.save();
        c.shadowColor = "rgba(253, 224, 71, 0.48)";
        c.shadowBlur = 18;

        const robe = c.createLinearGradient(
            -64,
            -104,
            68,
            112
        );

        robe.addColorStop(0, "rgba(255, 251, 235, 0.92)");
        robe.addColorStop(0.45, "rgba(254, 240, 138, 0.82)");
        robe.addColorStop(1, "rgba(251, 146, 60, 0.6)");

        c.fillStyle = robe;

        // Head and ushnisha, intentionally stylized without facial detail.
        c.beginPath();
        c.arc(0, -72, 18, 0, Math.PI * 2);
        c.fill();

        c.beginPath();
        c.arc(0, -94, 7, 0, Math.PI * 2);
        c.fill();

        // Seated robe silhouette.
        c.beginPath();
        c.moveTo(0, -50);
        c.bezierCurveTo(-34, -48, -48, -8, -44, 26);
        c.bezierCurveTo(-70, 43, -79, 76, -65, 91);
        c.bezierCurveTo(-34, 111, 34, 111, 65, 91);
        c.bezierCurveTo(79, 76, 70, 43, 44, 26);
        c.bezierCurveTo(48, -8, 34, -48, 0, -50);
        c.closePath();
        c.fill();

        // Robe folds stay subtle so the center remains calm.
        c.strokeStyle = "rgba(255, 255, 255, 0.28)";
        c.lineWidth = 1.25;
        c.beginPath();
        c.moveTo(-31, -19);
        c.quadraticCurveTo(-4, 7, 35, 20);
        c.stroke();

        c.beginPath();
        c.moveTo(-48, 50);
        c.quadraticCurveTo(0, 72, 49, 50);
        c.stroke();

        // Meditation hands.
        c.fillStyle = "rgba(255, 251, 235, 0.9)";
        c.beginPath();
        c.ellipse(-11, 28, 17, 6, 0.14, 0, Math.PI * 2);
        c.ellipse(11, 28, 17, 6, -0.14, 0, Math.PI * 2);
        c.fill();

        c.restore();
    }

    private drawAmitabhaLotusBase() {
        const c = this.ctx;

        c.save();
        c.translate(0, 99);
        c.globalCompositeOperation = "screen";

        const glow = c.createRadialGradient(
            0,
            0,
            0,
            0,
            0,
            82
        );

        glow.addColorStop(0, "rgba(255, 247, 214, 0.18)");
        glow.addColorStop(0.6, "rgba(244, 114, 182, 0.07)");
        glow.addColorStop(1, "rgba(244, 114, 182, 0)");

        c.fillStyle = glow;
        c.beginPath();
        c.ellipse(0, 0, 88, 34, 0, 0, Math.PI * 2);
        c.fill();

        for (let i = 0; i < 9; i++) {
            const x = (i - 4) * 14;
            const scale = 1 - Math.abs(i - 4) * 0.055;

            c.save();
            c.translate(x, -Math.abs(i - 4) * 1.2);
            c.scale(scale, scale);
            c.rotate((i - 4) * 0.075);

            c.fillStyle =
                i % 2 === 0
                    ? "rgba(253, 224, 71, 0.48)"
                    : "rgba(251, 207, 232, 0.42)";

            c.beginPath();
            c.moveTo(0, -17);
            c.bezierCurveTo(11, -8, 10, 8, 0, 16);
            c.bezierCurveTo(-10, 8, -11, -8, 0, -17);
            c.fill();
            c.restore();
        }

        c.restore();
    }

    private drawAmitabhaParticle(p: Particle) {
        const c = this.ctx;

        c.save();
        c.globalCompositeOperation = "screen";

        if (p.kind === "glyph") {
            const glyph =
                amitabhaGlyphs[
                    p.glyphIndex ?? 0
                ];

            c.fillStyle = "rgba(255, 247, 214, 0.92)";
            c.shadowColor = "rgba(253, 224, 71, 0.62)";
            c.shadowBlur = 8 + p.depth * 7;
            c.font =
                `600 ${Math.round(p.size)}px ` +
                `"Nirmala UI", "Noto Sans Devanagari", serif`;
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.fillText(glyph, 0, 0);
            c.restore();
            return;
        }

        if (p.kind === "lotus") {
            c.fillStyle =
                p.depth > 0.55
                    ? "rgba(255, 247, 214, 0.74)"
                    : "rgba(251, 207, 232, 0.68)";
            c.strokeStyle = "rgba(254, 243, 199, 0.36)";
            c.lineWidth = Math.max(0.7, p.size * 0.08);
            c.shadowColor = "rgba(253, 224, 71, 0.38)";
            c.shadowBlur = 3 + p.depth * 5;

            c.beginPath();
            c.moveTo(0, -p.size);
            c.bezierCurveTo(
                p.size * 0.68,
                -p.size * 0.42,
                p.size * 0.55,
                p.size * 0.52,
                0,
                p.size
            );
            c.bezierCurveTo(
                -p.size * 0.55,
                p.size * 0.52,
                -p.size * 0.68,
                -p.size * 0.42,
                0,
                -p.size
            );
            c.fill();
            c.stroke();
            c.restore();
            return;
        }

        c.fillStyle =
            p.depth > 0.62
                ? "rgba(255, 251, 235, 0.92)"
                : "rgba(253, 224, 71, 0.76)";
        c.shadowColor = "rgba(253, 224, 71, 0.52)";
        c.shadowBlur = 4 + p.depth * 7;
        c.beginPath();
        c.arc(0, 0, p.size, 0, Math.PI * 2);
        c.fill();

        c.restore();
    }

    private drawSnowBackground() {
        const c = this.ctx;

        const coldAir = c.createLinearGradient(
            0,
            0,
            0,
            this.height
        );
        coldAir.addColorStop(0, "rgba(224, 242, 254, 0.08)");
        coldAir.addColorStop(0.48, "rgba(239, 246, 255, 0.015)");
        coldAir.addColorStop(1, "rgba(191, 219, 254, 0.055)");
        c.fillStyle = coldAir;
        c.fillRect(0, 0, this.width, this.height);

        c.save();
        c.globalCompositeOperation = "screen";

        for (let i = 0; i < 7; i++) {
            const x =
                (Math.sin(i * 43.17 + 0.5) * 0.5 + 0.5) *
                this.width;
            const y =
                (Math.sin(i * 27.61 + 1.7) * 0.5 + 0.5) *
                this.height;
            const pulse =
                0.7 +
                Math.sin(this.timer * 0.28 + i * 0.9) * 0.3;

            c.fillStyle =
                `rgba(255,255,255,${0.018 + pulse * 0.018})`;
            c.beginPath();
            c.arc(
                x,
                y,
                16 + (i % 3) * 12,
                0,
                Math.PI * 2
            );
            c.fill();
        }

        c.restore();
    }

    private drawSakuraBackground() {
        const c = this.ctx;

        const blush = c.createRadialGradient(
            this.width * 0.88,
            this.height * 0.12,
            0,
            this.width * 0.88,
            this.height * 0.12,
            Math.max(this.width, this.height) * 0.62
        );
        blush.addColorStop(0, "rgba(251, 207, 232, 0.1)");
        blush.addColorStop(0.45, "rgba(253, 230, 238, 0.04)");
        blush.addColorStop(1, "rgba(255, 241, 242, 0)");
        c.fillStyle = blush;
        c.fillRect(0, 0, this.width, this.height);

        c.save();
        c.globalCompositeOperation = "screen";

        const breeze = c.createLinearGradient(
            0,
            this.height * 0.18,
            this.width,
            this.height * 0.66
        );
        breeze.addColorStop(0, "rgba(255,255,255,0)");
        breeze.addColorStop(0.42, "rgba(255,228,230,0.045)");
        breeze.addColorStop(0.68, "rgba(251,207,232,0.07)");
        breeze.addColorStop(1, "rgba(255,255,255,0)");

        c.strokeStyle = breeze;
        c.lineWidth = 14;
        c.lineCap = "round";
        c.beginPath();
        c.moveTo(-60, this.height * 0.38);
        c.bezierCurveTo(
            this.width * 0.22,
            this.height * 0.22,
            this.width * 0.58,
            this.height * 0.72,
            this.width + 60,
            this.height * 0.46
        );
        c.stroke();

        c.restore();
    }

    private drawAuroraBackground() {
        const c = this.ctx;

        c.save();
        c.globalCompositeOperation = "screen";

        const glow = c.createLinearGradient(
            0,
            0,
            this.width,
            this.height
        );

        glow.addColorStop(0, "rgba(17, 94, 89, 0.02)");
        glow.addColorStop(0.45, "rgba(45, 212, 191, 0.08)");
        glow.addColorStop(0.72, "rgba(129, 140, 248, 0.08)");
        glow.addColorStop(1, "rgba(168, 85, 247, 0.02)");

        c.fillStyle = glow;
        c.fillRect(0, 0, this.width, this.height);

        const ribbonColors = [
            ["rgba(45, 212, 191, 0)", "rgba(45, 212, 191, 0.28)"],
            ["rgba(96, 165, 250, 0)", "rgba(96, 165, 250, 0.22)"],
            ["rgba(168, 85, 247, 0)", "rgba(168, 85, 247, 0.2)"],
        ];

        for (let i = 0; i < ribbonColors.length; i++) {
            const phase =
                this.timer * (0.32 + i * 0.04) +
                i * 1.7;

            const centerY =
                this.height * (0.28 + i * 0.16);

            const amplitude =
                Math.min(this.height * 0.08, 58) +
                i * 6;

            const gradient = c.createLinearGradient(
                0,
                centerY,
                this.width,
                centerY
            );

            gradient.addColorStop(0, ribbonColors[i][0]);
            gradient.addColorStop(0.2, ribbonColors[i][1]);
            gradient.addColorStop(0.72, ribbonColors[i][1]);
            gradient.addColorStop(1, ribbonColors[i][0]);

            c.beginPath();
            c.lineWidth = 28 + i * 14;
            c.lineCap = "round";
            c.strokeStyle = gradient;
            c.shadowBlur = 22 + i * 8;
            c.shadowColor = ribbonColors[i][1];

            const segmentCount = 32;

            for (let segment = 0; segment <= segmentCount; segment++) {
                const x =
                    (segment / segmentCount) *
                    this.width;

                const normalizedX = x / Math.max(this.width, 1);

                const y =
                    centerY +
                    Math.sin(
                        normalizedX * Math.PI * 2.1 +
                        phase
                    ) * amplitude +
                    Math.sin(
                        normalizedX * Math.PI * 4.2 -
                        phase * 0.62
                    ) * amplitude * 0.24;

                if (segment === 0)
                    c.moveTo(x, y);
                else
                    c.lineTo(x, y);
            }

            c.stroke();
        }

        c.restore();
    }

    private drawStormBackground() {
        const c = this.ctx;
        const sky = c.createLinearGradient(
            0,
            0,
            0,
            this.height
        );

        sky.addColorStop(0, "rgba(15, 23, 42, 0.2)");
        sky.addColorStop(0.55, "rgba(30, 41, 59, 0.1)");
        sky.addColorStop(1, "rgba(15, 23, 42, 0.03)");

        c.fillStyle = sky;
        c.fillRect(0, 0, this.width, this.height);

        c.save();
        c.globalAlpha = 0.08;
        c.fillStyle = "#94a3b8";

        const cloudOffset =
            (this.timer * 24) %
            (this.width + 420);

        for (let i = -1; i < 4; i++) {
            const x =
                i * 360 +
                cloudOffset -
                260;

            const y = 34 + (i % 2) * 26;

            c.beginPath();
            c.ellipse(x, y, 150, 38, 0, 0, Math.PI * 2);
            c.ellipse(x + 90, y + 8, 120, 32, 0, 0, Math.PI * 2);
            c.ellipse(x - 85, y + 12, 105, 28, 0, 0, Math.PI * 2);
            c.fill();
        }

        c.restore();
    }

    private drawLightning() {
        const c = this.ctx;
        const cycle = this.timer % 8.4;

        const primaryFlash = this.smoothPulse(
            cycle,
            2.15,
            0.11
        );

        const secondaryFlash = this.smoothPulse(
            cycle,
            2.48,
            0.075
        ) * 0.42;

        const flash = Math.min(
            1,
            primaryFlash + secondaryFlash
        );

        if (flash <= 0.002)
            return;

        const flashGradient = c.createRadialGradient(
            this.width * 0.72,
            0,
            0,
            this.width * 0.72,
            0,
            Math.max(this.width, this.height) * 0.9
        );

        flashGradient.addColorStop(
            0,
            `rgba(226, 232, 255, ${0.16 * flash})`
        );
        flashGradient.addColorStop(
            0.45,
            `rgba(191, 219, 254, ${0.08 * flash})`
        );
        flashGradient.addColorStop(1, "rgba(191, 219, 254, 0)");

        c.fillStyle = flashGradient;
        c.fillRect(0, 0, this.width, this.height);
    }

    private smoothPulse(
        value: number,
        center: number,
        width: number
    ) {
        const distance = Math.abs(value - center);

        if (distance >= width)
            return 0;

        const normalized = 1 - distance / width;

        return normalized * normalized * (3 - 2 * normalized);
    }

    private drawAuroraSpark(size: number) {
        const c = this.ctx;

        c.fillStyle = "rgba(240, 253, 250, 0.9)";
        c.shadowColor = "rgba(94, 234, 212, 0.75)";
        c.shadowBlur = size * 4;

        c.beginPath();
        c.arc(0, 0, size, 0, Math.PI * 2);
        c.fill();
    }

    private drawRainDrop(p: Particle) {
        const c = this.ctx;
        const angle = Math.atan2(
            p.vy,
            p.vx
        );

        const endX = Math.cos(angle) * p.length;
        const endY = Math.sin(angle) * p.length;

        c.strokeStyle = "rgba(219, 234, 254, 0.88)";
        c.lineWidth = p.size;
        c.lineCap = "round";

        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(endX, endY);
        c.stroke();
    }

    private drawSnowParticle(p: Particle) {
        const c = this.ctx;
        const variant = p.variant ?? 0;

        if (variant === 0) {
            c.fillStyle = "rgba(255,255,255,0.88)";

            if (p.depth > 0.78) {
                c.shadowColor = "rgba(219,234,254,0.42)";
                c.shadowBlur = p.size * 2.4;
            }

            c.beginPath();
            c.arc(0, 0, p.size, 0, Math.PI * 2);
            c.fill();
            return;
        }

        c.strokeStyle =
            variant === 2
                ? "rgba(255,255,255,0.94)"
                : "rgba(239,246,255,0.86)";
        c.lineWidth = Math.max(
            0.65,
            p.size * (variant === 2 ? 0.12 : 0.14)
        );
        c.lineCap = "round";

        const arms = variant === 2 ? 6 : 4;

        for (let i = 0; i < arms; i++) {
            c.save();
            c.rotate((Math.PI * 2 / arms) * i);

            c.beginPath();
            c.moveTo(0, 0);
            c.lineTo(0, -p.size);

            if (variant === 2) {
                c.moveTo(0, -p.size * 0.52);
                c.lineTo(-p.size * 0.2, -p.size * 0.7);
                c.moveTo(0, -p.size * 0.52);
                c.lineTo(p.size * 0.2, -p.size * 0.7);
            }

            c.stroke();
            c.restore();
        }

        c.fillStyle = "rgba(255,255,255,0.9)";
        c.beginPath();
        c.arc(0, 0, Math.max(0.7, p.size * 0.14), 0, Math.PI * 2);
        c.fill();
    }

    private drawSakuraParticle(p: Particle) {
        const c = this.ctx;
        const variant = p.variant ?? 0;
        const color =
            sakuraColors[
                p.colorIndex ?? 0
            ];

        const flip =
            0.28 +
            Math.abs(Math.cos(p.flutter)) * 0.72;

        c.scale(flip, 1);

        if (variant === 2) {
            for (let i = 0; i < 5; i++) {
                c.save();
                c.rotate((Math.PI * 2 / 5) * i);
                c.translate(0, -p.size * 0.42);
                this.drawSingleSakuraPetal(
                    p.size * 0.58,
                    color
                );
                c.restore();
            }

            c.fillStyle = "rgba(253,230,138,0.8)";
            c.beginPath();
            c.arc(0, 0, p.size * 0.16, 0, Math.PI * 2);
            c.fill();
            return;
        }

        this.drawSingleSakuraPetal(p.size, color);

        if (variant === 1) {
            c.save();
            c.rotate(0.52);
            c.translate(p.size * 0.35, p.size * 0.18);
            c.globalAlpha *= 0.78;
            this.drawSingleSakuraPetal(
                p.size * 0.72,
                sakuraColors[
                    ((p.colorIndex ?? 0) + 1) %
                    sakuraColors.length
                ]
            );
            c.restore();
        }
    }

    private drawSingleSakuraPetal(
        size: number,
        color: string
    ) {
        const c = this.ctx;

        c.fillStyle = color;
        c.beginPath();
        c.moveTo(0, size * 0.92);
        c.bezierCurveTo(
            -size * 0.72,
            size * 0.42,
            -size * 0.62,
            -size * 0.46,
            -size * 0.16,
            -size * 0.78
        );
        c.quadraticCurveTo(
            0,
            -size * 0.58,
            size * 0.16,
            -size * 0.78
        );
        c.bezierCurveTo(
            size * 0.62,
            -size * 0.46,
            size * 0.72,
            size * 0.42,
            0,
            size * 0.92
        );
        c.fill();

        c.strokeStyle = "rgba(255,255,255,0.34)";
        c.lineWidth = Math.max(0.55, size * 0.055);
        c.beginPath();
        c.moveTo(0, size * 0.66);
        c.lineTo(0, -size * 0.46);
        c.stroke();
    }

    private random() {
        this.randomState += 0x6D2B79F5;

        let value = this.randomState;

        value = Math.imul(
            value ^ value >>> 15,
            value | 1
        );

        value ^= value +
            Math.imul(
                value ^ value >>> 7,
                value | 61
            );

        return (
            (value ^ value >>> 14) >>> 0
        ) / 4294967296;
    }

    private clamp(
        value: number,
        min: number,
        max: number
    ) {
        return Math.min(max, Math.max(min, value));
    }
}
