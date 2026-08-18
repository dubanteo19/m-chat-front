export const roomEffectsLabels: { type: RoomEffect; icon: string; label: string }[] = [
    { type: 'snow', icon: '❄️', label: 'Snow' },
    { type: 'sakura', icon: '🌸', label: 'Sakura' },
    { type: 'aurora', icon: '🌌', label: 'Aurora' },
    { type: 'thunderstorm', icon: '🌩️', label: 'Thunderstorm' },
    { type: 'radiance-of-amitabha', icon: '☸️', label: 'Radiance of Amitabha' },
    { type: 'disco-fever', icon: '🎆', label: 'Disco Fever' },
    { type: 'paper-butterfly-dream', icon: '🦋', label: 'Paper Butterfly Dream' },
    { type: 'bioluminescent-tide', icon: '🌊', label: 'Bioluminescent Tide' },
    { type: 'sticker-road-trip', icon: '🚗', label: 'Sticker Road Trip' },
    { type: 'vietnamese-mid-autumn', icon: '🌕', label: 'Vietnamese Mid-Autumn' }
];

export type RoomEffect =
    | "snow"
    | "sakura"
    | "aurora"
    | "thunderstorm"
    | "radiance-of-amitabha"
    | "disco-fever"
    | "paper-butterfly-dream"
    | "bioluminescent-tide"
    | "sticker-road-trip"
    | "vietnamese-mid-autumn";

const discoColors = [
    [236, 72, 153],
    [168, 85, 247],
    [34, 211, 238],
    [59, 130, 246],
    [163, 230, 53],
    [251, 191, 36],
] as const;

interface DiscoBeam {
    baseAngle: number;
    sweep: number;
    speed: number;
    phase: number;
    width: number;
    length: number;
    alpha: number;
    colorIndex: number;
}

interface DiscoLightPool {
    phase: number;
    speed: number;
    radius: number;
    alpha: number;
    colorIndex: number;
    yRatio: number;
}

const paperButterflyDreamColors = [
    [153, 27, 27],
    [190, 24, 93],
    [244, 114, 182],
    [202, 138, 4],
    [165, 243, 252],
    [167, 243, 208],
] as const;

type PaperButterflyDreamParticleKind =
    | "butterfly"
    | "paper-ash"
    | "red-thread"
    | "spirit-light";

interface PaperButterflyDreamFogLayer {
    yRatio: number;
    speed: number;
    phase: number;
    wave: number;
    alpha: number;
    scale: number;
    spriteIndex: number;
}

interface PaperButterflyDreamLantern {
    xRatio: number;
    yRatio: number;
    scale: number;
    phase: number;
    alpha: number;
}

interface PaperButterflyDreamShadow {
    xRatio: number;
    yRatio: number;
    scale: number;
    phase: number;
    cycleDuration: number;
    variant: number;
}

interface PaperButterflyDreamPattern {
    xRatio: number;
    yRatio: number;
    scale: number;
    phase: number;
    cycleDuration: number;
    variant: number;
}

const sakuraColors = [
    "#ffd7e5",
    "#ffc8dc",
    "#ffe7ef",
    "#f7bfd0",
];

const amitabhaGlyphs = ["अ", "मि", "ता", "भ"];

type AmitabhaParticleKind = "light" | "lotus" | "glyph";

type BioluminescentTideSceneEvent = "luminous-high-tide";

interface BioluminescentTideSceneState {
    type: BioluminescentTideSceneEvent | null;
    progress: number;
    strength: number;
    bloom: number;
    tide: number;
    push: number;
    crest: number;
    waterLevel: number;
    amplitude: number;
}

interface BioluminescentTideRipple {
    xRatio: number;
    yRatio: number;
    birthOffset: number;
    duration: number;
    radiusRatio: number;
    phase: number;
    strength: number;
}

interface StickerRoadTripWeather {
    name: string;
    skyTop: [number, number, number];
    skyMid: [number, number, number];
    skyBottom: [number, number, number];
    cloudTint: [number, number, number];
    groundTint: [number, number, number, number];
    overlay: [number, number, number, number];
    sunAlpha: number;
    cloudAlpha: number;
    rain: number;
    fog: number;
    night: number;
    sunset: number;
}

interface StickerRoadTripSceneState {
    cycleTime: number;
    zoomProgress: number;
    cameraZoom: number;
    weatherFrom: number;
    weatherTo: number;
    weatherBlend: number;
    travelFactor: number;
}

const stickerRoadTripWeatherStates: StickerRoadTripWeather[] = [
    {
        name: "Clear Day",
        skyTop: [147, 197, 253],
        skyMid: [219, 234, 254],
        skyBottom: [240, 249, 255],
        cloudTint: [255, 255, 255],
        groundTint: [255, 255, 255, 0],
        overlay: [255, 255, 255, 0],
        sunAlpha: 0.85,
        cloudAlpha: 0.72,
        rain: 0,
        fog: 0,
        night: 0,
        sunset: 0,
    },
    {
        name: "Sunset Glow",
        skyTop: [251, 146, 60],
        skyMid: [253, 186, 116],
        skyBottom: [255, 237, 213],
        cloudTint: [255, 236, 220],
        groundTint: [255, 180, 120, 0.08],
        overlay: [255, 120, 80, 0.08],
        sunAlpha: 0.62,
        cloudAlpha: 0.54,
        rain: 0,
        fog: 0.04,
        night: 0,
        sunset: 1,
    },
    {
        name: "Rainy Blue",
        skyTop: [71, 85, 105],
        skyMid: [148, 163, 184],
        skyBottom: [226, 232, 240],
        cloudTint: [226, 232, 240],
        groundTint: [90, 140, 170, 0.08],
        overlay: [110, 140, 180, 0.08],
        sunAlpha: 0,
        cloudAlpha: 0.88,
        rain: 1,
        fog: 0.08,
        night: 0,
        sunset: 0,
    },
    {
        name: "Moonlit Night",
        skyTop: [15, 23, 42],
        skyMid: [30, 41, 59],
        skyBottom: [51, 65, 85],
        cloudTint: [210, 220, 255],
        groundTint: [30, 40, 70, 0.18],
        overlay: [30, 60, 120, 0.18],
        sunAlpha: 0.35,
        cloudAlpha: 0.22,
        rain: 0,
        fog: 0.12,
        night: 1,
        sunset: 0,
    },
];

type MidAutumnParticleKind =
    | "firefly"
    | "lantern-dust"
    | "paper-fragment"
    | "tiny-star";

type MidAutumnLobbyEvent =
    | "moon-radiance"
    | "lantern-ripple"
    | "firefly-bloom"
    | "golden-breeze"
    | "moon-cloud-reveal"
    | "paper-wish"
    | "lantern-gathering";

type MidAutumnLobbyPhase = "event" | "settle";

interface MidAutumnLantern {
    xRatio: number;
    yRatio: number;
    scale: number;
    tone: number;
    phase: number;
    baseDuration: number;
    index: number;
}

interface MidAutumnLobbyState {
    activeEvent: MidAutumnLobbyEvent | null;
    previousEvent: MidAutumnLobbyEvent | null;
    phase: MidAutumnLobbyPhase;
    eventElapsed: number;
    eventDuration: number;
    settleElapsed: number;
    settleDuration: number;
    idleElapsed: number;
    nextEventDelay: number;
    direction: -1 | 1;
}

interface MidAutumnRenderState {
    moonGlow: number;
    moonBrightness: number;
    moonScale: number;
    dustBoost: number;
    fireflyBoost: number;
    breeze: number;
    lanternSwayBoost: number;
    gatheringGlow: number;
    paperGlow: number;
}

const midAutumnPaperColors = [
    "#b91c1c",
    "#d84d2e",
    "#e5a629",
    "#d6c34a",
    "#39734f",
] as const;

const midAutumnLobbyEventWeights: ReadonlyArray<
    readonly [MidAutumnLobbyEvent, number]
> = [
    ["firefly-bloom", 22],
    ["lantern-ripple", 20],
    ["golden-breeze", 18],
    ["moon-radiance", 16],
    ["paper-wish", 10],
    ["moon-cloud-reveal", 9],
    ["lantern-gathering", 5],
];

const midAutumnLobbyEventDurations: Record<
    MidAutumnLobbyEvent,
    readonly [number, number]
> = {
    "moon-radiance": [6, 7.5],
    "lantern-ripple": [5.8, 7],
    "firefly-bloom": [7.5, 9.5],
    "golden-breeze": [5.8, 7.2],
    "moon-cloud-reveal": [8.5, 10.5],
    "paper-wish": [7.5, 9.5],
    "lantern-gathering": [6.8, 8.4],
};

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
    kind?: AmitabhaParticleKind | PaperButterflyDreamParticleKind | MidAutumnParticleKind;
    glyphIndex?: number;
    variant?: number;
    colorIndex?: number;
    baseAlpha?: number;
    energy?: number;
    sensitivity?: number;
    threshold?: number;
    age?: number;
    life?: number;
    temporary?: boolean;
    attraction?: number;
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


    // Vietnamese Mid-Autumn: ambient particles plus occasional lobby events.
    // Events only modify temporary render targets; they never reset the
    // ambient scene, so transitions return smoothly without visible jumps.
    private midAutumnLanterns: MidAutumnLantern[] = [];
    private midAutumnTemporaryParticles: Particle[] = [];
    private midAutumnReducedMotion = false;
    private midAutumnLobbyState: MidAutumnLobbyState = {
        activeEvent: null,
        previousEvent: null,
        phase: "event",
        eventElapsed: 0,
        eventDuration: 0,
        settleElapsed: 0,
        settleDuration: 1.35,
        idleElapsed: 0,
        nextEventDelay: 30,
        direction: 1,
    };
    private midAutumnRenderState: MidAutumnRenderState = {
        moonGlow: 0,
        moonBrightness: 0,
        moonScale: 0,
        dustBoost: 0,
        fireflyBoost: 0,
        breeze: 0,
        lanternSwayBoost: 0,
        gatheringGlow: 0,
        paperGlow: 0,
    };
    private midAutumnTargetState: MidAutumnRenderState = {
        moonGlow: 0,
        moonBrightness: 0,
        moonScale: 0,
        dustBoost: 0,
        fireflyBoost: 0,
        breeze: 0,
        lanternSwayBoost: 0,
        gatheringGlow: 0,
        paperGlow: 0,
    };

    // Cached layers for the Amitabha effect. The expensive gradients,
    // shadows, vector paths and glyph rendering are rasterized once.
    private amitabhaBackdrop: HTMLCanvasElement | null = null;
    private amitabhaFigure: HTMLCanvasElement | null = null;
    private amitabhaParticleSprites = new Map<string, HTMLCanvasElement>();
    private readonly amitabhaSpriteDpr = 1.5;

    // The disco ball, light pools and glitter sprites are cached so the
    // per-frame work is limited to transforms, simple paths and drawImage.
    private discoBackdrop: HTMLCanvasElement | null = null;
    private discoBall: HTMLCanvasElement | null = null;
    private discoLightPoolSprites: HTMLCanvasElement[] = [];
    private discoParticleSprites = new Map<string, HTMLCanvasElement>();
    private discoBeams: DiscoBeam[] = [];
    private discoLightPools: DiscoLightPool[] = [];
    private discoBallLogicalSize = 168;
    private readonly discoSpriteDpr = 1.35;


    // Static paper-cut artwork, lanterns, fog and particle sprites are cached.
    // Per-frame work is limited to transforms and lightweight paths.
    private paperButterflyDreamBackdrop: HTMLCanvasElement | null = null;
    private paperButterflyDreamMoonlight: HTMLCanvasElement | null = null;
    private paperButterflyDreamFogSprites: HTMLCanvasElement[] = [];
    private paperButterflyDreamLanternSprites: HTMLCanvasElement[] = [];
    private paperButterflyDreamPatternSprites: HTMLCanvasElement[] = [];
    private paperButterflyDreamShadowSprites: HTMLCanvasElement[] = [];
    private paperButterflyDreamParticleSprites = new Map<string, HTMLCanvasElement>();
    private paperButterflyDreamFogLayers: PaperButterflyDreamFogLayer[] = [];
    private paperButterflyDreamLanterns: PaperButterflyDreamLantern[] = [];
    private paperButterflyDreamShadows: PaperButterflyDreamShadow[] = [];
    private paperButterflyDreamPatterns: PaperButterflyDreamPattern[] = [];
    private paperButterflyDreamInversionOffset = 0;
    private readonly paperButterflyDreamSpriteDpr = 1.35;


    // Bioluminescent Tide: continuous layered water, local ripples and
    // organic plankton bloom. No visible flow vectors or luminous wave streak.
    private bioluminescentTideGlowSprite: HTMLCanvasElement | null = null;
    private bioluminescentTideRipples: BioluminescentTideRipple[] = [];
    private bioluminescentTideSceneEvent: BioluminescentTideSceneEvent | null = null;
    private bioluminescentTideSceneElapsed = 0;
    private bioluminescentTideNextSceneDelay = 0;
    private bioluminescentTideSceneState: BioluminescentTideSceneState = {
        type: null,
        progress: 0,
        strength: 0,
        bloom: 0,
        tide: 0,
        push: 0,
        crest: 0,
        waterLevel: 0,
        amplitude: 1,
    };

    // Sticker Road Trip: a continuous side-scrolling paper/sticker landscape.
    // Every 15 seconds the camera pushes into the front quarter of the car;
    // weather transitions during that zoom and remains until the next one.
    private stickerRoadTripDistance = 0;
    private readonly stickerRoadTripDriveDuration = 15;
    private readonly stickerRoadTripZoomDuration = 2.8;
    private readonly stickerRoadTripBaseSpeed = 230;

    constructor(
        canvas: HTMLCanvasElement,
        private effect: RoomEffect,
        seed = Date.now()
    ) {
        this.canvas = canvas;
        this.randomState = seed >>> 0 || 1;
        this.paperButterflyDreamInversionOffset = this.random() * 29;


        this.midAutumnReducedMotion =
            typeof window.matchMedia === "function" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (this.effect === "vietnamese-mid-autumn") {
            this.midAutumnLobbyState.nextEventDelay =
                this.randomMidAutumnEventDelay();
        }

        if (this.effect === "bioluminescent-tide") {
            this.bioluminescentTideNextSceneDelay =
                34 + this.random() * 26;
        }

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
        const isSoftGlowEffect =
            this.effect === "radiance-of-amitabha" ||
            this.effect === "disco-fever" ||
            this.effect === "paper-butterfly-dream" ||
            this.effect === "bioluminescent-tide";
        const isLargeSoftGlowCanvas =
            isSoftGlowEffect &&
            this.width * this.height > 1_400_000;

        // Soft glow effects tolerate a slightly lower DPR and save a large
        // amount of fill-rate on large room canvases.
        const maxDpr =
            isSoftGlowEffect
                ? isLargeSoftGlowCanvas
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

        if (this.effect === "disco-fever") {
            this.rebuildDiscoCaches();
        }

        if (this.effect === "paper-butterfly-dream") {
            this.rebuildPaperButterflyDreamCaches();
        }

        if (this.effect === "bioluminescent-tide") {
            this.bioluminescentTideGlowSprite =
                this.createBioluminescentTideGlowSprite();

            if (!this.bioluminescentTideRipples.length) {
                this.rebuildBioluminescentTideRipples();
            }
        }


        if (this.effect === "vietnamese-mid-autumn") {
            this.rebuildMidAutumnLanterns();
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

        if (this.effect === "sticker-road-trip") {
            this.stickerRoadTripDistance =
                this.timer * this.stickerRoadTripBaseSpeed;
        }

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
        if (this.effect === "bioluminescent-tide") {
            this.updateBioluminescentTideScene(deltaSeconds);
        }

        if (this.effect === "sticker-road-trip") {
            const scene = this.getStickerRoadTripSceneState();
            this.stickerRoadTripDistance +=
                this.stickerRoadTripBaseSpeed *
                scene.travelFactor *
                deltaSeconds;
        }

        if (this.effect === "vietnamese-mid-autumn") {
            this.updateMidAutumnScene(deltaSeconds);
        }

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
                continue;
            }

            if (this.effect === "disco-fever") {
                this.updateDiscoParticle(p, deltaSeconds);
                continue;
            }

            if (this.effect === "paper-butterfly-dream") {
                this.updatePaperButterflyDreamParticle(p, deltaSeconds);
                continue;
            }

            if (this.effect === "bioluminescent-tide") {
                this.updateBioluminescentTideParticle(p, deltaSeconds);
                continue;
            }

            if (this.effect === "vietnamese-mid-autumn") {
                this.updateMidAutumnParticle(p, deltaSeconds);
            }
        }

        if (this.effect === "vietnamese-mid-autumn") {
            this.updateMidAutumnTemporaryParticles(deltaSeconds);
        }
    }

    private updateWind() {
        if (
            this.effect === "bioluminescent-tide" ||
            this.effect === "sticker-road-trip"
        ) {
            this.wind = 0;
            return;
        }

        if (this.effect === "vietnamese-mid-autumn") {
            this.wind =
                Math.sin(this.timer * 0.18) * 0.32 +
                Math.sin(this.timer * 0.071 + 1.4) * 0.17 +
                Math.sin(this.timer * 0.39 + 0.6) * 0.045 +
                this.midAutumnRenderState.breeze * 0.42;
            return;
        }

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

        if (this.effect === "disco-fever") {
            this.wind =
                Math.sin(this.timer * 0.31) * 0.08 +
                Math.sin(this.timer * 0.12 + 1.4) * 0.035;
            return;
        }

        if (this.effect === "paper-butterfly-dream") {
            const inversion = this.getPaperButterflyDreamInversion();

            this.wind =
                Math.sin(this.timer * 0.17 + 0.4) * 0.085 +
                Math.sin(this.timer * 0.061 + 1.8) * 0.045 +
                Math.sin(this.timer * 0.33 + 2.3) * 0.022;

            this.wind *= 1 - inversion * 0.58;
            return;
        }

        this.wind =
            Math.sin(this.timer * 0.45) * 0.38 +
            Math.sin(this.timer * 0.17 + 1.2) * 0.18;
    }


    private updateBioluminescentTideScene(deltaSeconds: number) {
        this.bioluminescentTideSceneElapsed += deltaSeconds;

        if (!this.bioluminescentTideSceneEvent) {
            if (
                this.bioluminescentTideSceneElapsed >=
                this.bioluminescentTideNextSceneDelay
            ) {
                this.bioluminescentTideSceneEvent =
                    "luminous-high-tide";
                this.bioluminescentTideSceneElapsed = 0;
            }
        } else if (this.bioluminescentTideSceneElapsed >= 18) {
            this.bioluminescentTideSceneEvent = null;
            this.bioluminescentTideSceneElapsed = 0;
            this.bioluminescentTideNextSceneDelay =
                58 + this.random() * 38;
        }

        this.bioluminescentTideSceneState =
            this.calculateBioluminescentTideSceneState();
    }

    private calculateBioluminescentTideSceneState(): BioluminescentTideSceneState {
        const type = this.bioluminescentTideSceneEvent;
        const progress = type
            ? this.clamp(
                this.bioluminescentTideSceneElapsed / 18,
                0,
                1
            )
            : 0;

        const strength = type
            ? this.smoothStep(0.05, 0.32, progress) *
                (1 - this.smoothStep(0.78, 1, progress))
            : 0;

        const bloom = type
            ? this.smoothStep(0.28, 0.55, progress) *
                (1 - this.smoothStep(0.78, 1, progress))
            : 0;

        const tide = Math.sin(this.timer * 0.16);
        const eventBoost = strength * 0.36;
        const push =
            Math.cos(this.timer * 0.16) *
            (0.008 + eventBoost * 0.012);
        const crest = Math.pow(Math.max(0, tide), 2);
        const waterLevel =
            tide * this.height * (0.009 + strength * 0.005);
        const amplitude =
            1 + tide * 0.07 + strength * 0.14;

        return {
            type,
            progress,
            strength,
            bloom,
            tide,
            push,
            crest,
            waterLevel,
            amplitude,
        };
    }

    private updateBioluminescentTideParticle(
        p: Particle,
        deltaSeconds: number
    ) {
        const scene = this.bioluminescentTideSceneState;
        const depthResponse = 0.48 + p.depth * 0.52;
        const normalizedX = p.x / Math.max(1, this.width);
        const normalizedY = p.y / Math.max(1, this.height);

        p.wobble += p.wobbleSpeed * deltaSeconds;
        p.flutter += p.flutterSpeed * deltaSeconds;

        const localDrift =
            Math.sin(
                this.timer * 0.18 +
                p.wobble +
                normalizedY * 5.4
            ) * this.width * 0.00055;

        p.vx +=
            (
                scene.push * this.width * 0.38 * depthResponse +
                localDrift
            ) * deltaSeconds;

        p.vy +=
            (
                Math.sin(
                    this.timer * 0.14 +
                    p.flutter +
                    normalizedX * 4.3
                ) * this.height * 0.00042 +
                scene.tide * this.height * 0.00018
            ) * deltaSeconds;

        const drag = Math.exp(-1.75 * deltaSeconds);
        p.vx *= drag;
        p.vy *= drag;

        p.x += p.vx * deltaSeconds;
        p.y += p.vy * deltaSeconds;

        const cluster =
            (
                Math.sin(
                    normalizedX * 12.3 +
                    normalizedY * 8.1 +
                    this.timer * 0.11
                ) +
                Math.sin(
                    normalizedX * 5.6 -
                    normalizedY * 10.4 -
                    this.timer * 0.07 +
                    1.7
                )
            ) * 0.5;
        const cluster01 = 0.5 + cluster * 0.5;
        const sensitivity = p.sensitivity ?? 0.8;
        const threshold = p.threshold ?? 0.32;
        const excitation =
            scene.crest *
            scene.bloom *
            cluster01 *
            sensitivity;

        let energy = p.energy ?? 0;

        if (excitation > threshold) {
            energy +=
                (excitation - threshold) *
                deltaSeconds *
                1.9;
        }

        const ambientPulse = Math.pow(
            Math.max(
                0,
                Math.sin(this.timer * 0.35 + p.flutter)
            ),
            6
        );

        energy += ambientPulse * 0.018 * deltaSeconds;
        energy *= Math.exp(-0.72 * deltaSeconds);
        p.energy = this.clamp(energy, 0, 1.1);

        const depthAlpha = 0.22 + p.depth * 0.68;
        const pulse =
            0.82 +
            Math.sin(this.timer * 0.7 + p.flutter) * 0.18;

        p.alpha =
            ((p.baseAlpha ?? 0.12) + p.energy * 0.62) *
            depthAlpha *
            pulse;

        const margin = 28;

        if (p.x > this.width + margin)
            p.x = -margin;
        else if (p.x < -margin)
            p.x = this.width + margin;

        if (p.y > this.height + margin)
            p.y = -margin;
        else if (p.y < -margin)
            p.y = this.height + margin;
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

    private updateDiscoParticle(
        p: Particle,
        deltaSeconds: number
    ) {
        const sidewaysOscillation =
            Math.sin(
                this.timer * p.wobbleSpeed +
                p.wobble
            ) * (4 + p.depth * 11);

        p.x +=
            (
                p.vx +
                sidewaysOscillation +
                this.wind * (6 + p.depth * 10)
            ) * deltaSeconds;
        p.y += p.vy * deltaSeconds;
        p.rotation += p.rotationSpeed * deltaSeconds;

        const shimmer =
            0.76 +
            Math.sin(
                this.timer * p.flutterSpeed +
                p.flutter
            ) * 0.24;

        const flashDuration =
            4.2 +
            (p.variant ?? 0) * 0.72 +
            p.depth * 1.1;
        const flashCycle =
            (this.timer + p.flutter) % flashDuration;
        const restrainedFlash = this.smoothPulse(
            flashCycle,
            0.12 + (p.variant ?? 0) * 0.035,
            0.075
        );
        const beat = this.getDiscoBeatPulse();

        p.alpha =
            (p.baseAlpha ?? 0.44) *
            (shimmer + restrainedFlash * 0.34) *
            (1 + beat * 0.22);

        if (p.y > this.height + 24) {
            p.y = -24 - this.random() * 36;
            p.x = this.random() * this.width;
            p.rotation = this.random() * Math.PI * 2;
        }

        this.wrapHorizontal(p, 34);
    }

    private updatePaperButterflyDreamParticle(
        p: Particle,
        deltaSeconds: number
    ) {
        p.wobble += p.wobbleSpeed * deltaSeconds;
        p.flutter += p.flutterSpeed * deltaSeconds;

        const inversion = this.getPaperButterflyDreamInversion();
        const baseAlpha = p.baseAlpha ?? 0.3;

        if (p.kind === "butterfly") {
            const slowDown = 1 - inversion * 0.9;
            const pathMotion =
                Math.sin(p.wobble) * (7 + p.depth * 12) +
                Math.sin(p.flutter * 0.48 + p.wobble) * 4;
            const verticalMotion =
                Math.sin(p.flutter) * (3 + p.depth * 6) +
                Math.sin(p.wobble * 0.43) * 2;

            p.x +=
                (
                    p.vx +
                    this.wind * (16 + p.depth * 28) +
                    pathMotion
                ) * deltaSeconds * slowDown;
            p.y +=
                (p.vy + verticalMotion) *
                deltaSeconds *
                (0.34 + slowDown * 0.66);
            p.rotation =
                Math.sin(p.wobble * 0.52) * 0.34 +
                Math.sin(p.flutter * 0.31) * 0.12;

            const dissolve =
                this.getPaperButterflyDreamButterflyDissolve(p);
            const pulse =
                0.84 +
                Math.sin(p.flutter * 0.72 + p.wobble) * 0.16;

            p.alpha =
                baseAlpha *
                pulse *
                (1 - dissolve * 0.72) *
                (1 + inversion * 0.08);

            if (
                p.x > this.width + 70 ||
                p.x < -70 ||
                p.y > this.height + 70 ||
                p.y < -70
            ) {
                p.x = -40 - this.random() * 70;
                p.y =
                    this.height * 0.18 +
                    this.random() * this.height * 0.54;
                p.wobble = this.random() * Math.PI * 2;
                p.flutter = this.random() * Math.PI * 2;
            }

            return;
        }

        if (p.kind === "paper-ash") {
            const reverse = 1 - inversion * 2;
            const sway =
                Math.sin(p.wobble) * (2 + p.depth * 5) +
                Math.sin(p.flutter * 0.61) * 1.8;

            p.x +=
                (
                    p.vx +
                    this.wind * (6 + p.depth * 10) +
                    sway
                ) * deltaSeconds;
            p.y += p.vy * reverse * deltaSeconds;
            p.rotation +=
                (
                    p.rotationSpeed +
                    Math.sin(p.flutter) * 0.08
                ) * deltaSeconds;

            const flicker =
                0.72 +
                Math.sin(p.flutter * 0.83 + p.wobble) * 0.28;

            p.alpha =
                baseAlpha *
                flicker *
                (1 + inversion * 0.22);

            if (p.y < -36) {
                p.y = this.height + 24 + this.random() * 42;
                p.x = this.random() * this.width;
            } else if (p.y > this.height + 48) {
                p.y = -24 - this.random() * 36;
                p.x = this.random() * this.width;
            }

            this.wrapHorizontal(p, 44);
            return;
        }

        if (p.kind === "red-thread") {
            const drift =
                p.vx +
                this.wind * (4 + p.depth * 7) +
                Math.sin(p.wobble) * 1.8;

            p.x += drift * deltaSeconds;
            p.y +=
                (
                    p.vy +
                    Math.sin(p.flutter * 0.46) * 1.4
                ) * deltaSeconds;
            p.rotation =
                Math.sin(p.wobble * 0.4) * 0.14;
            p.alpha =
                baseAlpha *
                (0.78 + Math.sin(p.flutter * 0.31) * 0.22) *
                (1 - inversion * 0.18);

            this.wrapHorizontal(p, p.length + 70);

            if (p.y < -60)
                p.y = this.height + 50;

            if (p.y > this.height + 60)
                p.y = -50;

            return;
        }

        const wanderingX =
            Math.sin(p.wobble) * (4 + p.depth * 8) +
            Math.sin(p.flutter * 0.53 + 1.2) * 2.5;
        const wanderingY =
            Math.sin(p.flutter) * (3 + p.depth * 5) +
            Math.sin(p.wobble * 0.39) * 2;

        p.x +=
            (
                p.vx +
                wanderingX +
                this.wind * 5
            ) * deltaSeconds;
        p.y += (p.vy + wanderingY) * deltaSeconds;
        p.rotation += p.rotationSpeed * deltaSeconds;

        const vanish =
            this.getPaperButterflyDreamButterflyProximity(p);
        const glowPulse =
            0.66 +
            Math.sin(p.flutter * 0.64 + p.wobble) * 0.34;

        p.alpha =
            baseAlpha *
            glowPulse *
            (1 - vanish * 0.72) *
            (1 + inversion * 0.35);

        if (
            p.x < -48 ||
            p.x > this.width + 48 ||
            p.y < -48 ||
            p.y > this.height + 48
        ) {
            p.x = this.random() * this.width;
            p.y =
                this.height * 0.26 +
                this.random() * this.height * 0.5;
        }
    }

    private getPaperButterflyDreamButterflyDissolve(p: Particle) {
        if ((p.variant ?? 0) !== 2)
            return 0;

        const phase =
            (
                this.timer * 0.075 +
                p.flutter / (Math.PI * 2)
            ) % 1;

        if (phase < 0.68)
            return 0;

        const normalized =
            this.clamp((phase - 0.68) / 0.32, 0, 1);

        return normalized * normalized *
            (3 - 2 * normalized);
    }

    private getPaperButterflyDreamButterflyProximity(p: Particle) {
        let checked = 0;
        let proximity = 0;

        for (const butterfly of this.particles) {
            if (butterfly.kind !== "butterfly")
                continue;

            const distance = Math.hypot(
                butterfly.x - p.x,
                butterfly.y - p.y
            );

            proximity = Math.max(
                proximity,
                1 - this.clamp(distance / 62, 0, 1)
            );

            checked++;

            if (checked >= 12 || proximity > 0.92)
                break;
        }

        return proximity;
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

        this.discoBackdrop = null;
        this.discoBall = null;
        this.discoLightPoolSprites = [];
        this.discoParticleSprites.clear();
        this.discoBeams = [];
        this.discoLightPools = [];
    

        this.paperButterflyDreamBackdrop = null;
        this.paperButterflyDreamMoonlight = null;
        this.paperButterflyDreamFogSprites = [];
        this.paperButterflyDreamLanternSprites = [];
        this.paperButterflyDreamPatternSprites = [];
        this.paperButterflyDreamShadowSprites = [];
        this.paperButterflyDreamParticleSprites.clear();
        this.paperButterflyDreamFogLayers = [];
        this.paperButterflyDreamLanterns = [];
        this.paperButterflyDreamShadows = [];
        this.paperButterflyDreamPatterns = [];

        this.bioluminescentTideGlowSprite = null;
        this.bioluminescentTideRipples = [];
        this.bioluminescentTideSceneEvent = null;
        this.bioluminescentTideSceneElapsed = 0;
        this.bioluminescentTideSceneState = {
            type: null,
            progress: 0,
            strength: 0,
            bloom: 0,
            tide: 0,
            push: 0,
            crest: 0,
            waterLevel: 0,
            amplitude: 1,
        };

        this.stickerRoadTripDistance = 0;


        this.midAutumnLanterns = [];
        this.midAutumnTemporaryParticles = [];
        this.midAutumnLobbyState = {
            activeEvent: null,
            previousEvent: null,
            phase: "event",
            eventElapsed: 0,
            eventDuration: 0,
            settleElapsed: 0,
            settleDuration: 1.35,
            idleElapsed: 0,
            nextEventDelay: 30,
            direction: 1,
        };
        this.resetMidAutumnRenderStates();
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

                case "disco-fever":
                    this.particles.push(
                        this.createDiscoParticle(depth)
                    );
                    break;

                case "paper-butterfly-dream":
                    this.particles.push(
                        this.createPaperButterflyDreamParticle(
                            depth,
                            i,
                            count
                        )
                    );
                    break;

                case "bioluminescent-tide":
                    this.particles.push(
                        this.createBioluminescentTideParticle(depth)
                    );
                    break;

                case "sticker-road-trip":
                    break;

                case "vietnamese-mid-autumn":
                    this.particles.push(
                        this.createMidAutumnParticle(
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

            case "disco-fever":
                return this.clamp(
                    Math.floor(area / 13500),
                    42,
                    92
                );

            case "paper-butterfly-dream":
                return this.clamp(
                    Math.floor(area / 14800),
                    42,
                    86
                );

            case "bioluminescent-tide":
                return this.clamp(
                    Math.floor(area / 7200),
                    96,
                    164
                );

            case "sticker-road-trip":
                return 0;

            case "vietnamese-mid-autumn": {
                const baseCount = this.clamp(
                    Math.floor(area / 18000),
                    42,
                    78
                );

                return this.midAutumnReducedMotion
                    ? Math.max(16, Math.floor(baseCount * 0.35))
                    : baseCount;
            }

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

    private createPaperButterflyDreamParticle(
        depth: number,
        index: number,
        total: number
    ): Particle {
        const butterflyCount = this.clamp(
            Math.floor(total * 0.34),
            14,
            28
        );
        const ashCount = this.clamp(
            Math.floor(total * 0.38),
            16,
            34
        );
        const threadCount = this.clamp(
            Math.floor(total * 0.12),
            5,
            10
        );

        const kind: PaperButterflyDreamParticleKind =
            index < butterflyCount
                ? "butterfly"
                : index < butterflyCount + ashCount
                    ? "paper-ash"
                    : index <
                        butterflyCount +
                        ashCount +
                        threadCount
                        ? "red-thread"
                        : "spirit-light";

        const centerBias =
            0.5 +
            (this.random() - 0.5) * 0.92;
        let x = centerBias * this.width;
        let y = this.random() * this.height;

        if (kind === "butterfly") {
            x = -50 + this.random() * (this.width + 100);
            y =
                this.height * 0.16 +
                this.random() * this.height * 0.58;
        }

        if (kind === "red-thread") {
            const left = this.random() < 0.5;
            x = left
                ? -20 + this.random() * this.width * 0.2
                : this.width * 0.8 + this.random() * this.width * 0.2;
            y = this.random() * this.height;
        }

        if (kind === "spirit-light") {
            y =
                this.height * 0.28 +
                this.random() * this.height * 0.48;
        }

        const variant =
            kind === "butterfly"
                ? this.random() < 0.24
                    ? 2
                    : this.random() < 0.5
                        ? 1
                        : 0
                : kind === "paper-ash"
                    ? Math.floor(this.random() * 3)
                    : kind === "red-thread"
                        ? Math.floor(this.random() * 2)
                        : 0;

        const baseAlpha =
            kind === "butterfly"
                ? 0.34 + depth * 0.34
                : kind === "paper-ash"
                    ? 0.12 + depth * 0.28
                    : kind === "red-thread"
                        ? 0.035 + depth * 0.055
                        : 0.17 + depth * 0.26;

        return {
            originX: x,
            originY: y,
            x,
            y,

            vx:
                kind === "butterfly"
                    ? 12 + depth * 22 + this.random() * 10
                    : kind === "paper-ash"
                        ? (this.random() - 0.5) * 7
                        : kind === "red-thread"
                            ? 2 + depth * 5
                            : (this.random() - 0.5) * 3,
            vy:
                kind === "butterfly"
                    ? (this.random() - 0.5) * 4
                    : kind === "paper-ash"
                        ? -(8 + depth * 22 + this.random() * 8)
                        : kind === "red-thread"
                            ? (this.random() - 0.5) * 2.4
                            : (this.random() - 0.5) * 2.8,

            size:
                kind === "butterfly"
                    ? 4.2 + depth * 7.2
                    : kind === "paper-ash"
                        ? 0.9 + depth * 3.1
                        : kind === "red-thread"
                            ? 0.42 + depth * 0.58
                            : 2 + depth * 3.8,
            length:
                kind === "red-thread"
                    ? 52 + depth * 92
                    : kind === "butterfly"
                        ? 16 + depth * 22
                        : 0,
            alpha: baseAlpha,

            rotation: this.random() * Math.PI * 2,
            rotationSpeed:
                (this.random() - 0.5) *
                (kind === "paper-ash" ? 0.78 : 0.34),

            wobble: this.random() * Math.PI * 2,
            wobbleSpeed:
                kind === "butterfly"
                    ? 0.5 + this.random() * 0.72
                    : 0.24 + this.random() * 0.54,

            flutter: this.random() * Math.PI * 2,
            flutterSpeed:
                kind === "butterfly"
                    ? 2.1 + this.random() * 2.2
                    : kind === "spirit-light"
                        ? 0.52 + this.random() * 0.72
                        : 0.28 + this.random() * 0.6,

            depth,
            kind,
            variant,
            colorIndex:
                kind === "spirit-light"
                    ? 4 + Math.floor(this.random() * 2)
                    : Math.floor(this.random() * 4),
            baseAlpha,
        };
    }


    private createBioluminescentTideParticle(depth: number): Particle {
        const x = this.random() * this.width;
        const y =
            this.height * 0.08 +
            this.random() * this.height * 0.84;
        const baseAlpha = 0.08 + this.random() * 0.18;

        return {
            originX: x,
            originY: y,
            x,
            y,

            vx: (this.random() - 0.5) * 1.2,
            vy: (this.random() - 0.5) * 0.7,

            size: 0.8 + depth * 2.2 + this.random() * 0.55,
            length: 0,
            alpha: baseAlpha,

            rotation: 0,
            rotationSpeed: 0,

            wobble: this.random() * Math.PI * 2,
            wobbleSpeed: 0.13 + this.random() * 0.12,

            flutter: this.random() * Math.PI * 2,
            flutterSpeed: 0.26 + this.random() * 0.24,

            depth,
            baseAlpha,
            energy: this.random() * 0.12,
            sensitivity: 0.55 + this.random() * 0.75,
            threshold: 0.18 + this.random() * 0.42,
        };
    }

    private createDiscoParticle(depth: number): Particle {
        const x = this.random() * this.width;
        const y = this.random() * this.height;
        const variantSelector = this.random();
        const variant =
            variantSelector < 0.7
                ? 0
                : variantSelector < 0.92
                    ? 1
                    : 2;
        const baseAlpha = 0.18 + depth * 0.46;

        return {
            originX: x,
            originY: y,
            x,
            y,

            vx: (this.random() - 0.5) * 5,
            vy: 10 + depth * 34 + this.random() * 10,

            size: 0.8 + depth * 2.8,
            length: 0,
            alpha: baseAlpha,

            rotation: this.random() * Math.PI * 2,
            rotationSpeed:
                (this.random() - 0.5) *
                (1.1 + depth * 1.9),

            wobble: this.random() * Math.PI * 2,
            wobbleSpeed: 0.35 + this.random() * 0.75,

            flutter: this.random() * Math.PI * 2,
            flutterSpeed: 0.55 + this.random() * 1.05,

            depth,
            variant,
            colorIndex: Math.floor(
                this.random() * discoColors.length
            ),
            baseAlpha,
        };
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

        if (this.effect === "disco-fever") {
            this.drawDiscoBackground();
            this.drawDiscoBeams();
        }

        if (this.effect === "paper-butterfly-dream") {
            this.drawPaperButterflyDreamBackground();
            this.drawPaperButterflyDreamMoonlight();
            this.drawPaperButterflyDreamLanterns();
            this.drawPaperButterflyDreamPaperPatterns();
            this.drawPaperButterflyDreamSilhouette();
            this.drawPaperButterflyDreamFog();
            this.drawPaperButterflyDreamMirror();
        }

        if (this.effect === "bioluminescent-tide") {
            this.drawBioluminescentTideBackground();
            this.drawBioluminescentTideWaterLayers();
            this.drawBioluminescentTideCaustics();
            this.drawBioluminescentTideLocalRipples();
        }

        if (this.effect === "sticker-road-trip") {
            this.drawStickerRoadTripScene();
        }

        if (this.effect === "vietnamese-mid-autumn") {
            this.drawMidAutumnBackground();
        }

        this.ctx.restore();

        if (this.effect === "radiance-of-amitabha") {
            this.drawAmitabhaParticlesOptimized();
            return;
        }

        if (this.effect === "sticker-road-trip") {
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

                case "disco-fever":
                    this.drawDiscoParticle(p);
                    break;

                case "paper-butterfly-dream":
                    this.drawPaperButterflyDreamParticle(p);
                    break;

                case "bioluminescent-tide":
                    this.drawBioluminescentTideParticle(p);
                    break;

                case "vietnamese-mid-autumn":
                    this.drawMidAutumnParticle(p);
                    break;
            }

            this.ctx.restore();
        }

        if (this.effect === "vietnamese-mid-autumn") {
            this.ctx.save();
            this.ctx.globalAlpha = this.transitionAlpha;
            this.drawMidAutumnLanterns();
            this.drawMidAutumnTemporaryParticles();
            this.drawMidAutumnVignette();
            this.ctx.restore();
        }

        if (this.effect === "thunderstorm") {
            this.ctx.save();
            this.ctx.globalAlpha = this.transitionAlpha;
            this.drawLightning();
            this.ctx.restore();
        }

        if (this.effect === "disco-fever") {
            this.ctx.save();
            this.ctx.globalAlpha = this.transitionAlpha;
            this.drawDiscoBall();
            this.ctx.restore();
        }

        if (this.effect === "paper-butterfly-dream") {
            this.ctx.save();
            this.ctx.globalAlpha = this.transitionAlpha;
            this.drawPaperButterflyDreamReflections();
            this.ctx.restore();
        }

        if (this.effect === "bioluminescent-tide") {
            this.ctx.save();
            this.ctx.globalAlpha = this.transitionAlpha;
            this.drawBioluminescentTideSurfaceHaze();
            this.ctx.restore();
        }
    }


    private rebuildBioluminescentTideRipples() {
        this.bioluminescentTideRipples = Array.from(
            { length: 18 },
            () => ({
                xRatio: 0.05 + this.random() * 0.9,
                yRatio: 0.16 + this.random() * 0.7,
                birthOffset: this.random() * 10,
                duration: 4.4 + this.random() * 3.2,
                radiusRatio: 0.028 + this.random() * 0.035,
                phase: this.random() * Math.PI * 2,
                strength: 0.45 + this.random() * 0.55,
            })
        );
    }

    private createBioluminescentTideGlowSprite() {
        const size = 96;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const c = canvas.getContext("2d");

        if (!c)
            return canvas;

        const center = size * 0.5;
        const glow = c.createRadialGradient(
            center,
            center,
            0,
            center,
            center,
            center
        );

        glow.addColorStop(0, "rgba(103, 232, 249, 0.82)");
        glow.addColorStop(0.2, "rgba(34, 211, 238, 0.34)");
        glow.addColorStop(0.55, "rgba(6, 182, 212, 0.1)");
        glow.addColorStop(1, "rgba(6, 182, 212, 0)");

        c.fillStyle = glow;
        c.fillRect(0, 0, size, size);

        return canvas;
    }

    private drawBioluminescentTideBackground() {
        const c = this.ctx;
        const scene = this.bioluminescentTideSceneState;
        const background = c.createLinearGradient(
            0,
            0,
            0,
            this.height
        );

        background.addColorStop(0, "rgba(4, 23, 34, 0.98)");
        background.addColorStop(0.38, "rgba(3, 19, 29, 0.98)");
        background.addColorStop(1, "rgba(1, 7, 13, 0.99)");

        c.fillStyle = background;
        c.fillRect(0, 0, this.width, this.height);

        const deepGlow = c.createRadialGradient(
            this.width * 0.5,
            this.height * 0.2 + scene.waterLevel,
            0,
            this.width * 0.5,
            this.height * 0.2 + scene.waterLevel,
            Math.max(this.width, this.height) * 0.9
        );

        deepGlow.addColorStop(
            0,
            `rgba(34, 211, 238, ${0.018 + scene.strength * 0.018})`
        );
        deepGlow.addColorStop(0.52, "rgba(8, 145, 178, 0.008)");
        deepGlow.addColorStop(1, "rgba(0, 0, 0, 0)");

        c.fillStyle = deepGlow;
        c.fillRect(0, 0, this.width, this.height);
    }

    private drawBioluminescentTideWaterLayers() {
        const c = this.ctx;

        c.save();
        c.globalCompositeOperation = "screen";

        this.drawBioluminescentTideWaterLayer(0.31, 0, 10, 0.15, 6.2);
        this.drawBioluminescentTideWaterLayer(0.46, 0.42, 8.4, 0.13, 6.8);
        this.drawBioluminescentTideWaterLayer(0.61, 0.78, 6.6, 0.11, 7.4);
        this.drawBioluminescentTideWaterLayer(0.74, 1.08, 4.6, 0.09, 8.1);

        c.restore();
    }

    private drawBioluminescentTideWaterLayer(
        baseRatio: number,
        phaseLag: number,
        baseAmplitude: number,
        alpha: number,
        frequency: number
    ) {
        const c = this.ctx;
        const scene = this.bioluminescentTideSceneState;
        const points: Array<{ x: number; y: number }> = [];
        const step = Math.max(18, this.width / 50);
        const phase = this.timer * 0.16 - phaseLag;

        for (
            let x = -step;
            x <= this.width + step;
            x += step
        ) {
            const normalizedX = x / Math.max(1, this.width);
            const macro =
                Math.sin(normalizedX * frequency + phase) *
                baseAmplitude *
                scene.amplitude;
            const meso =
                Math.sin(
                    normalizedX * (frequency * 1.92) -
                    this.timer * 0.23 +
                    phaseLag * 0.8
                ) *
                baseAmplitude *
                0.34;
            const micro =
                Math.sin(
                    normalizedX * (frequency * 3.8) +
                    this.timer * 0.41 +
                    phaseLag * 1.7
                ) *
                baseAmplitude *
                0.11;
            const localDeform =
                1 +
                Math.sin(
                    normalizedX * 3.1 +
                    this.timer * 0.09 +
                    phaseLag
                ) * 0.09;

            points.push({
                x,
                y:
                    this.height * baseRatio +
                    scene.waterLevel * (1 - baseRatio * 0.45) +
                    (macro + meso + micro) * localDeform,
            });
        }

        const stroke = (lineWidth: number, opacity: number) => {
            c.beginPath();
            c.moveTo(points[0].x, points[0].y);

            for (let i = 1; i < points.length - 1; i++) {
                const middleX = (points[i].x + points[i + 1].x) * 0.5;
                const middleY = (points[i].y + points[i + 1].y) * 0.5;

                c.quadraticCurveTo(
                    points[i].x,
                    points[i].y,
                    middleX,
                    middleY
                );
            }

            c.strokeStyle = `rgba(103, 232, 249, ${opacity})`;
            c.lineWidth = lineWidth;
            c.lineCap = "round";
            c.stroke();
        };

        stroke(30, alpha * 0.1);
        stroke(14, alpha * 0.18);
        stroke(2.1, alpha * 0.48);
    }

    private drawBioluminescentTideLocalRipples() {
        const c = this.ctx;
        const scene = this.bioluminescentTideSceneState;

        c.save();
        c.globalCompositeOperation = "screen";

        for (const ripple of this.bioluminescentTideRipples) {
            const age =
                (this.timer + ripple.birthOffset) % ripple.duration;
            const progress = age / ripple.duration;
            const envelope = Math.sin(Math.PI * progress);

            if (envelope <= 0.02)
                continue;

            const radius =
                this.width *
                ripple.radiusRatio *
                (0.45 + progress * 1.75) *
                (1 + scene.tide * 0.04);
            const x =
                ripple.xRatio * this.width +
                Math.sin(this.timer * 0.11 + ripple.phase) * 8;
            const y =
                ripple.yRatio * this.height +
                scene.waterLevel * 0.35 +
                Math.cos(this.timer * 0.09 + ripple.phase) * 4;
            const alpha =
                envelope *
                ripple.strength *
                (0.018 + scene.strength * 0.006);

            c.strokeStyle = `rgba(165, 243, 252, ${alpha})`;
            c.lineWidth = 1.1;
            c.beginPath();
            c.ellipse(
                x,
                y,
                radius,
                radius * 0.26,
                Math.sin(this.timer * 0.07 + ripple.phase) * 0.08,
                0,
                Math.PI * 2
            );
            c.stroke();
        }

        c.restore();
    }

    private drawBioluminescentTideCaustics() {
        const c = this.ctx;
        const scene = this.bioluminescentTideSceneState;
        const scaleX = 1 + scene.tide * 0.035;
        const scaleY = 1 - scene.tide * 0.018;

        c.save();
        c.globalCompositeOperation = "screen";
        c.translate(this.width * 0.5, this.height * 0.5);
        c.scale(scaleX, scaleY);
        c.translate(-this.width * 0.5, -this.height * 0.5);

        for (let layer = 0; layer < 2; layer++) {
            const phase = layer === 0 ? 0.4 : 2.3;
            const alpha =
                (layer === 0 ? 0.027 : 0.018) *
                (1 + scene.strength * 0.55);

            c.strokeStyle = `rgba(165, 243, 252, ${alpha})`;
            c.lineWidth = layer === 0 ? 1.15 : 1.55;
            c.lineCap = "round";

            for (let row = 0; row < 5; row++) {
                c.beginPath();

                for (let i = 0; i <= 26; i++) {
                    const normalizedX = i / 26;
                    const x = normalizedX * this.width;
                    const y =
                        this.height * (0.14 + row * 0.165) +
                        Math.sin(
                            normalizedX * 10.6 +
                            this.timer * (layer === 0 ? 0.22 : -0.16) +
                            phase +
                            row * 0.62
                        ) * 9 +
                        Math.sin(
                            normalizedX * 4.1 -
                            this.timer * 0.12 +
                            row
                        ) * 5 +
                        scene.waterLevel * 0.22;

                    if (i === 0)
                        c.moveTo(x, y);
                    else
                        c.lineTo(x, y);
                }

                c.stroke();
            }
        }

        c.restore();
    }

    private drawBioluminescentTideParticle(p: Particle) {
        const c = this.ctx;
        const energy = this.clamp(p.energy ?? 0, 0, 1);
        const radius = p.size * (1 + energy * 0.28);
        const glowSprite = this.bioluminescentTideGlowSprite;

        if (glowSprite && energy > 0.22) {
            const glowSize = radius * (8.4 + energy * 4.8);

            c.save();
            c.globalAlpha *= 0.18 + energy * 0.24;
            c.drawImage(
                glowSprite,
                -glowSize * 0.5,
                -glowSize * 0.5,
                glowSize,
                glowSize
            );
            c.restore();
        }

        c.fillStyle = "rgba(103, 232, 249, 0.94)";
        c.beginPath();
        c.arc(0, 0, radius, 0, Math.PI * 2);
        c.fill();
    }

    private drawBioluminescentTideSurfaceHaze() {
        const c = this.ctx;
        const scene = this.bioluminescentTideSceneState;
        const haze = c.createLinearGradient(
            0,
            0,
            0,
            this.height * 0.31
        );

        haze.addColorStop(
            0,
            `rgba(165, 243, 252, ${0.018 + scene.strength * 0.01})`
        );
        haze.addColorStop(0.5, "rgba(34, 211, 238, 0.006)");
        haze.addColorStop(1, "rgba(34, 211, 238, 0)");

        c.fillStyle = haze;
        c.fillRect(
            0,
            scene.waterLevel * 0.1,
            this.width,
            this.height * 0.32
        );
    }

    private getStickerRoadTripSceneState(): StickerRoadTripSceneState {
        const cycleDuration =
            this.stickerRoadTripDriveDuration +
            this.stickerRoadTripZoomDuration;
        const cycleIndex = Math.floor(this.timer / cycleDuration);
        const cycleTime = this.timer % cycleDuration;
        const zoomTime = this.clamp(
            cycleTime - this.stickerRoadTripDriveDuration,
            0,
            this.stickerRoadTripZoomDuration
        );
        const zoomT = zoomTime / this.stickerRoadTripZoomDuration;

        let zoomProgress = 0;

        if (cycleTime >= this.stickerRoadTripDriveDuration) {
            if (zoomT < 0.38) {
                zoomProgress = this.smoothStep(0, 1, zoomT / 0.38);
            } else if (zoomT < 0.64) {
                zoomProgress = 1;
            } else {
                zoomProgress =
                    1 - this.smoothStep(0, 1, (zoomT - 0.64) / 0.36);
            }
        }

        const weatherFrom =
            cycleIndex % stickerRoadTripWeatherStates.length;
        const weatherTo =
            (weatherFrom + 1) % stickerRoadTripWeatherStates.length;
        const weatherBlend =
            cycleTime < this.stickerRoadTripDriveDuration
                ? 0
                : this.smoothStep(0, 1, zoomT);

        return {
            cycleTime,
            zoomProgress,
            cameraZoom: 1 + zoomProgress * 0.46,
            weatherFrom,
            weatherTo,
            weatherBlend,
            travelFactor:
                cycleTime < this.stickerRoadTripDriveDuration
                    ? 1
                    : 1 - zoomProgress * 0.62,
        };
    }

    private mixStickerRoadTripWeather(
        fromIndex: number,
        toIndex: number,
        amount: number
    ): StickerRoadTripWeather {
        const from = stickerRoadTripWeatherStates[fromIndex];
        const to = stickerRoadTripWeatherStates[toIndex];
        const mix3 = (
            a: [number, number, number],
            b: [number, number, number]
        ): [number, number, number] => [
            this.lerp(a[0], b[0], amount),
            this.lerp(a[1], b[1], amount),
            this.lerp(a[2], b[2], amount),
        ];
        const mix4 = (
            a: [number, number, number, number],
            b: [number, number, number, number]
        ): [number, number, number, number] => [
            this.lerp(a[0], b[0], amount),
            this.lerp(a[1], b[1], amount),
            this.lerp(a[2], b[2], amount),
            this.lerp(a[3], b[3], amount),
        ];

        return {
            name: amount < 0.5 ? from.name : to.name,
            skyTop: mix3(from.skyTop, to.skyTop),
            skyMid: mix3(from.skyMid, to.skyMid),
            skyBottom: mix3(from.skyBottom, to.skyBottom),
            cloudTint: mix3(from.cloudTint, to.cloudTint),
            groundTint: mix4(from.groundTint, to.groundTint),
            overlay: mix4(from.overlay, to.overlay),
            sunAlpha: this.lerp(from.sunAlpha, to.sunAlpha, amount),
            cloudAlpha: this.lerp(from.cloudAlpha, to.cloudAlpha, amount),
            rain: this.lerp(from.rain, to.rain, amount),
            fog: this.lerp(from.fog, to.fog, amount),
            night: this.lerp(from.night, to.night, amount),
            sunset: this.lerp(from.sunset, to.sunset, amount),
        };
    }

    private drawStickerRoadTripScene() {
        const scene = this.getStickerRoadTripSceneState();
        const weather = this.mixStickerRoadTripWeather(
            scene.weatherFrom,
            scene.weatherTo,
            scene.weatherBlend
        );
        const c = this.ctx;
        const focusX = this.width * 0.59;
        const focusY = this.height * 0.765;

        c.save();
        c.translate(focusX, focusY);
        c.scale(scene.cameraZoom, scene.cameraZoom);
        c.translate(-focusX, -focusY);

        this.drawStickerRoadTripSky(weather);
        this.drawStickerRoadTripMountainLayer(
            this.stickerRoadTripDistance,
            0.08,
            this.height * 0.57,
            390,
            92,
            weather.night > 0.4 ? "#475569" : "#86efac",
            weather.night > 0.4 ? "#334155" : "#22c55e"
        );
        this.drawStickerRoadTripMountainLayer(
            this.stickerRoadTripDistance,
            0.15,
            this.height * 0.63,
            330,
            68,
            weather.night > 0.4 ? "#64748b" : "#4ade80",
            weather.night > 0.4 ? "#475569" : "#16a34a"
        );
        this.drawStickerRoadTripTreeLayer(
            this.stickerRoadTripDistance,
            0.3,
            this.height * 0.665,
            166,
            1.02,
            0.8,
            0,
            weather.night
        );
        this.drawStickerRoadTripTreeLayer(
            this.stickerRoadTripDistance,
            0.58,
            this.height * 0.7,
            128,
            0.84,
            0.92,
            1,
            weather.night
        );
        this.drawStickerRoadTripRoad(weather);
        this.drawStickerRoadTripBushes(weather);
        this.drawStickerRoadTripCar(weather);
        this.drawStickerRoadTripFog(weather.fog);
        this.drawStickerRoadTripRain(weather.rain);
        this.drawStickerRoadTripWeatherOverlay(weather);

        c.restore();
    }

    private drawStickerRoadTripSky(weather: StickerRoadTripWeather) {
        const c = this.ctx;
        const sky = c.createLinearGradient(0, 0, 0, this.height);
        sky.addColorStop(0, this.rgb(weather.skyTop));
        sky.addColorStop(0.56, this.rgb(weather.skyMid));
        sky.addColorStop(1, this.rgb(weather.skyBottom));
        c.fillStyle = sky;
        c.fillRect(0, 0, this.width, this.height);

        const sunX = this.width * 0.82;
        const sunY = this.height * 0.16;
        const radius = this.height * 0.18;
        const sun = c.createRadialGradient(
            sunX,
            sunY,
            0,
            sunX,
            sunY,
            radius
        );

        if (weather.night > 0.5) {
            sun.addColorStop(
                0,
                `rgba(241, 245, 249, ${weather.sunAlpha})`
            );
            sun.addColorStop(
                0.32,
                `rgba(226, 232, 240, ${weather.sunAlpha * 0.25})`
            );
            sun.addColorStop(1, "rgba(226, 232, 240, 0)");
        } else if (weather.sunset > 0.4) {
            sun.addColorStop(
                0,
                `rgba(255, 237, 213, ${weather.sunAlpha})`
            );
            sun.addColorStop(
                0.28,
                `rgba(251, 191, 36, ${weather.sunAlpha * 0.3})`
            );
            sun.addColorStop(1, "rgba(251, 191, 36, 0)");
        } else {
            sun.addColorStop(
                0,
                `rgba(254, 240, 138, ${weather.sunAlpha})`
            );
            sun.addColorStop(
                0.35,
                `rgba(253, 224, 71, ${weather.sunAlpha * 0.28})`
            );
            sun.addColorStop(1, "rgba(253, 224, 71, 0)");
        }

        c.fillStyle = sun;
        c.fillRect(
            sunX - radius,
            sunY - radius,
            radius * 2,
            radius * 2
        );

        this.drawStickerRoadTripCloud(
            this.width * 0.16,
            this.height * 0.12,
            0.86,
            weather
        );
        this.drawStickerRoadTripCloud(
            this.width * 0.52,
            this.height * 0.16,
            0.64,
            weather
        );
        this.drawStickerRoadTripCloud(
            this.width * 0.73,
            this.height * 0.1,
            0.54,
            weather
        );

        if (weather.night > 0.25) {
            c.save();
            c.globalAlpha *= weather.night * 0.7;
            c.fillStyle = "#f8fafc";

            for (let i = 0; i < 28; i++) {
                const x = (i * 137.13) % this.width;
                const y =
                    24 +
                    ((i * 71.9) % Math.max(1, this.height * 0.32));
                const starRadius = i % 4 === 0 ? 1.8 : 1.1;
                c.beginPath();
                c.arc(x, y, starRadius, 0, Math.PI * 2);
                c.fill();
            }

            c.restore();
        }
    }

    private drawStickerRoadTripCloud(
        x: number,
        y: number,
        scale: number,
        weather: StickerRoadTripWeather
    ) {
        const c = this.ctx;
        const color = weather.cloudTint;

        c.save();
        c.translate(x, y);
        c.scale(scale, scale);
        c.fillStyle =
            `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${weather.cloudAlpha})`;
        c.beginPath();
        c.arc(-34, 3, 21, 0, Math.PI * 2);
        c.arc(-4, -8, 30, 0, Math.PI * 2);
        c.arc(32, 1, 23, 0, Math.PI * 2);
        c.arc(3, 8, 26, 0, Math.PI * 2);
        c.fill();
        c.restore();
    }

    private drawStickerRoadTripMountainLayer(
        distance: number,
        ratio: number,
        baseY: number,
        tileWidth: number,
        amplitude: number,
        fill: string,
        stroke: string
    ) {
        const c = this.ctx;
        const offset = (distance * ratio) % tileWidth;
        const start = -tileWidth - offset;

        c.save();
        c.beginPath();
        c.moveTo(start, baseY);

        for (
            let x = start;
            x < this.width + tileWidth * 2;
            x += tileWidth
        ) {
            c.quadraticCurveTo(
                x + tileWidth * 0.22,
                baseY - amplitude * 0.68,
                x + tileWidth * 0.42,
                baseY - amplitude
            );
            c.quadraticCurveTo(
                x + tileWidth * 0.62,
                baseY - amplitude * 0.28,
                x + tileWidth,
                baseY
            );
        }

        c.lineTo(this.width + tileWidth * 2, this.height);
        c.lineTo(start, this.height);
        c.closePath();
        c.fillStyle = fill;
        c.fill();
        c.strokeStyle = stroke;
        c.lineWidth = 2.5;
        c.stroke();
        c.restore();
    }

    private drawStickerRoadTripTreeLayer(
        distance: number,
        ratio: number,
        baseY: number,
        gap: number,
        scale: number,
        alpha: number,
        phase: number,
        night: number
    ) {
        const offset = (distance * ratio) % gap;
        const count = Math.ceil(this.width / gap) + 5;
        const logicalOffset = Math.floor(distance * ratio / gap);

        for (let i = -3; i < count; i++) {
            const logical = i + logicalOffset;
            const x = i * gap - offset;
            const variant = ((logical + phase) % 3 + 3) % 3;
            const wobble = Math.sin(logical * 1.73) * 4;

            this.drawStickerRoadTripTree(
                x,
                baseY + wobble,
                scale * (variant === 2 ? 0.9 : 1),
                variant,
                alpha,
                night
            );
        }
    }

    private drawStickerRoadTripTree(
        x: number,
        baseY: number,
        scale: number,
        variant: number,
        alpha: number,
        night: number
    ) {
        const c = this.ctx;

        c.save();
        c.globalAlpha *= alpha;
        c.translate(x, baseY);
        c.scale(scale, scale);

        c.fillStyle = night > 0.3 ? "#5b4633" : "#8b5a2b";
        c.strokeStyle = "rgba(31, 41, 55, 0.18)";
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(-8, 20);
        c.lineTo(-6, -25);
        c.lineTo(6, -25);
        c.lineTo(8, 20);
        c.closePath();
        c.fill();
        c.stroke();

        const palette = night > 0.3
            ? [
                ["#3f6212", "#1a2e05"],
                ["#4d7c0f", "#22340b"],
                ["#166534", "#0b3128"],
            ]
            : [
                ["#22c55e", "#166534"],
                ["#4ade80", "#15803d"],
                ["#84cc16", "#3f6212"],
            ];
        const colors = palette[variant % 3];
        c.fillStyle = colors[0];
        c.strokeStyle = colors[1];
        c.lineWidth = 4;

        if (variant % 3 === 0) {
            this.drawStickerRoadTripTreeBlob(-22, -28, 26);
            this.drawStickerRoadTripTreeBlob(8, -43, 31);
            this.drawStickerRoadTripTreeBlob(31, -20, 23);
            this.drawStickerRoadTripTreeBlob(-2, -12, 27);
        } else if (variant % 3 === 1) {
            c.beginPath();
            c.moveTo(0, -90);
            c.quadraticCurveTo(-40, -35, -28, -7);
            c.quadraticCurveTo(0, -18, 28, -7);
            c.quadraticCurveTo(40, -35, 0, -90);
            c.fill();
            c.stroke();
        } else {
            this.drawStickerRoadTripTreeBlob(0, -38, 32);
            this.drawStickerRoadTripTreeBlob(-27, -27, 20);
            this.drawStickerRoadTripTreeBlob(26, -26, 22);
            this.drawStickerRoadTripTreeBlob(-10, -56, 21);
            this.drawStickerRoadTripTreeBlob(18, -58, 20);
        }

        c.restore();
    }

    private drawStickerRoadTripTreeBlob(
        x: number,
        y: number,
        radius: number
    ) {
        const c = this.ctx;
        c.beginPath();
        c.arc(x, y, radius, 0, Math.PI * 2);
        c.fill();
        c.stroke();
    }

    private drawStickerRoadTripRoad(weather: StickerRoadTripWeather) {
        const c = this.ctx;
        const roadTop = this.height * 0.71;
        const roadBottom = this.height * 0.94;

        c.fillStyle = weather.night > 0.4 ? "#334155" : "#475569";
        c.fillRect(0, roadTop, this.width, roadBottom - roadTop);
        c.fillStyle = weather.night > 0.4 ? "#1e293b" : "#334155";
        c.fillRect(0, roadBottom, this.width, this.height - roadBottom);
        c.fillStyle = weather.night > 0.4 ? "#4d7c0f" : "#65a30d";
        c.fillRect(0, roadTop - 18, this.width, 18);

        const unit = 160;
        const offset = (this.stickerRoadTripDistance * 1.5) % unit;

        for (
            let x = -unit;
            x < this.width + unit;
            x += unit
        ) {
            c.fillStyle = weather.night > 0.4
                ? "rgba(255, 255, 255, 0.68)"
                : "#f8fafc";
            this.roundRectPath(
                c,
                x - offset,
                roadTop + 58,
                92,
                11,
                6
            );
            c.fill();
        }

        c.strokeStyle = "rgba(255, 255, 255, 0.45)";
        c.lineWidth = 4;
        c.beginPath();
        c.moveTo(0, roadTop + 6);
        c.lineTo(this.width, roadTop + 6);
        c.moveTo(0, roadBottom - 12);
        c.lineTo(this.width, roadBottom - 12);
        c.stroke();
    }

    private drawStickerRoadTripBushes(weather: StickerRoadTripWeather) {
        const c = this.ctx;
        const gap = 96;
        const offset = (this.stickerRoadTripDistance * 1.22) % gap;

        for (
            let i = -2;
            i < Math.ceil(this.width / gap) + 3;
            i++
        ) {
            const x = i * gap - offset;
            const y = this.height * 0.713;
            c.fillStyle = weather.night > 0.4 ? "#65a30d" : "#84cc16";
            c.beginPath();
            c.arc(x, y, 17, 0, Math.PI * 2);
            c.arc(x + 18, y + 4, 13, 0, Math.PI * 2);
            c.fill();
        }
    }

    private drawStickerRoadTripCar(weather: StickerRoadTripWeather) {
        const c = this.ctx;
        const x = this.width * 0.47;
        const y =
            this.height * 0.785 +
            Math.sin(this.timer * 4.1) * 1.1;
        const spin = this.stickerRoadTripDistance * 0.038;

        c.save();
        c.translate(x, y);

        c.fillStyle = "rgba(15, 23, 42, 0.2)";
        c.beginPath();
        c.ellipse(0, 34, 128, 15, 0, 0, Math.PI * 2);
        c.fill();

        // Side profile faces RIGHT. Rear is left; hood/headlight/grille are right.
        c.fillStyle = weather.night > 0.45 ? "#dc2626" : "#ef4444";
        c.strokeStyle = "#7f1d1d";
        c.lineWidth = 4;
        c.beginPath();
        c.moveTo(-146, 17);
        c.lineTo(-146, -4);
        c.quadraticCurveTo(-142, -18, -122, -20);
        c.lineTo(-86, -24);
        c.quadraticCurveTo(-58, -62, -10, -66);
        c.lineTo(34, -66);
        c.quadraticCurveTo(58, -63, 82, -34);
        c.lineTo(96, -18);
        c.lineTo(143, -18);
        c.quadraticCurveTo(166, -16, 174, -4);
        c.lineTo(174, 15);
        c.quadraticCurveTo(174, 26, 160, 28);
        c.lineTo(-126, 28);
        c.quadraticCurveTo(-146, 26, -146, 17);
        c.closePath();
        c.fill();
        c.stroke();

        c.fillStyle = weather.night > 0.45 ? "#93c5fd" : "#bfdbfe";
        c.strokeStyle = "#1e293b";
        c.lineWidth = 3;

        c.beginPath();
        c.moveTo(-72, -24);
        c.quadraticCurveTo(-50, -52, -12, -54);
        c.lineTo(5, -54);
        c.lineTo(4, -24);
        c.closePath();
        c.fill();
        c.stroke();

        c.beginPath();
        c.moveTo(10, -54);
        c.lineTo(34, -54);
        c.quadraticCurveTo(53, -51, 72, -29);
        c.lineTo(82, -18);
        c.lineTo(10, -18);
        c.closePath();
        c.fill();
        c.stroke();

        c.strokeStyle = "rgba(127, 29, 29, 0.75)";
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(88, -15);
        c.lineTo(150, -15);
        c.moveTo(5, -16);
        c.lineTo(5, 18);
        c.stroke();

        c.fillStyle = "#fde68a";
        this.roundRectPath(c, 155, -10, 18, 11, 5);
        c.fill();

        c.strokeStyle = "#334155";
        c.lineWidth = 2;
        for (let yLine = 5; yLine <= 17; yLine += 4) {
            c.beginPath();
            c.moveTo(162, yLine);
            c.lineTo(174, yLine);
            c.stroke();
        }

        c.fillStyle = "#991b1b";
        this.roundRectPath(c, -146, -4, 10, 13, 3);
        c.fill();

        this.drawStickerRoadTripWheel(-88, 28, spin, weather);
        this.drawStickerRoadTripWheel(103, 28, spin, weather);

        if (weather.night > 0.4) {
            const beam = c.createLinearGradient(170, -4, 250, -22);
            beam.addColorStop(0, "rgba(254, 240, 138, 0.18)");
            beam.addColorStop(1, "rgba(254, 240, 138, 0)");
            c.fillStyle = beam;
            c.beginPath();
            c.moveTo(172, -2);
            c.lineTo(255, -22);
            c.lineTo(255, 18);
            c.lineTo(172, 8);
            c.closePath();
            c.fill();
        }

        c.restore();
    }

    private drawStickerRoadTripWheel(
        x: number,
        y: number,
        spin: number,
        weather: StickerRoadTripWeather
    ) {
        const c = this.ctx;

        c.save();
        c.translate(x, y);
        c.fillStyle = "#0f172a";
        c.beginPath();
        c.arc(0, 0, 27, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = weather.night > 0.4 ? "#94a3b8" : "#64748b";
        c.beginPath();
        c.arc(0, 0, 14, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = "#e2e8f0";
        c.lineWidth = 2;
        c.rotate(spin);

        for (let i = 0; i < 6; i++) {
            c.beginPath();
            c.moveTo(0, 0);
            c.lineTo(0, -11);
            c.stroke();
            c.rotate(Math.PI / 3);
        }

        c.restore();
    }

    private drawStickerRoadTripFog(amount: number) {
        if (amount <= 0.01)
            return;

        const c = this.ctx;
        c.save();
        c.globalAlpha *= amount;

        for (let i = 0; i < 3; i++) {
            const y =
                this.height * (0.62 + i * 0.08) +
                Math.sin(this.timer * 0.17 + i) * 8;
            const fog = c.createLinearGradient(0, y, 0, y + 60);
            fog.addColorStop(0, "rgba(255, 255, 255, 0)");
            fog.addColorStop(0.45, "rgba(255, 255, 255, 0.22)");
            fog.addColorStop(1, "rgba(255, 255, 255, 0)");
            c.fillStyle = fog;
            c.fillRect(0, y - 20, this.width, 90);
        }

        c.restore();
    }

    private drawStickerRoadTripRain(amount: number) {
        if (amount <= 0.01)
            return;

        const c = this.ctx;
        c.save();
        c.globalAlpha *= 0.22 * amount;
        c.strokeStyle = "#e0f2fe";
        c.lineWidth = 1.5;

        for (let i = 0; i < 90; i++) {
            const xSeed = this.hash01(i * 13.7 + 1.1);
            const ySeed = this.hash01(i * 7.3 + 4.8);
            const speed = 1.2 + this.hash01(i * 5.9 + 8.2) * 1.8;
            const length =
                0.03 + this.hash01(i * 9.1 + 2.6) * 0.045;
            const x =
                xSeed * this.width +
                ((this.timer * 120 * speed) % 40);
            const y =
                (
                    ySeed * this.height +
                    this.timer * 360 * speed
                ) % (this.height + 80) - 40;

            c.beginPath();
            c.moveTo(x, y);
            c.lineTo(x - 9, y + length * this.height);
            c.stroke();
        }

        c.restore();
    }

    private drawStickerRoadTripWeatherOverlay(
        weather: StickerRoadTripWeather
    ) {
        const c = this.ctx;

        if (weather.overlay[3] > 0.001) {
            c.fillStyle = this.rgba(weather.overlay);
            c.fillRect(0, 0, this.width, this.height);
        }

        if (weather.groundTint[3] > 0.001) {
            c.fillStyle = this.rgba(weather.groundTint);
            c.fillRect(
                0,
                this.height * 0.58,
                this.width,
                this.height * 0.42
            );
        }
    }

    private rgb(color: [number, number, number]) {
        return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    }

    private rgba(color: [number, number, number, number]) {
        return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`;
    }

    private roundRectPath(
        c: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number
    ) {
        const r = Math.min(radius, width * 0.5, height * 0.5);
        c.beginPath();
        c.moveTo(x + r, y);
        c.lineTo(x + width - r, y);
        c.quadraticCurveTo(x + width, y, x + width, y + r);
        c.lineTo(x + width, y + height - r);
        c.quadraticCurveTo(
            x + width,
            y + height,
            x + width - r,
            y + height
        );
        c.lineTo(x + r, y + height);
        c.quadraticCurveTo(x, y + height, x, y + height - r);
        c.lineTo(x, y + r);
        c.quadraticCurveTo(x, y, x + r, y);
        c.closePath();
    }

    private rebuildDiscoCaches() {
        this.discoParticleSprites.clear();
        this.discoBallLogicalSize = this.clamp(
            Math.min(this.width, this.height) * 0.25,
            128,
            184
        );
        this.discoBackdrop = this.createDiscoBackdropCache();
        this.discoBall = this.createDiscoBallCache();
        this.discoLightPoolSprites = discoColors.map(
            (_, index) => this.createDiscoLightPoolSprite(index)
        );
        this.rebuildDiscoScene();
    }

    private rebuildDiscoScene() {
        const beamCount = this.width < 640 ? 7 : 9;

        this.discoBeams = Array.from(
            { length: beamCount },
            (_, index): DiscoBeam => {
                const side = index % 2 === 0 ? -1 : 1;
                const sideAngle =
                    side < 0
                        ? Math.PI * (0.59 + this.random() * 0.27)
                        : Math.PI * (0.14 + this.random() * 0.27);

                return {
                    baseAngle: sideAngle,
                    sweep: 0.1 + this.random() * 0.2,
                    speed: 0.08 + this.random() * 0.15,
                    phase: this.random() * Math.PI * 2,
                    width: 0.075 + this.random() * 0.085,
                    length: 0.86 + this.random() * 0.24,
                    alpha: 0.026 + this.random() * 0.035,
                    colorIndex: index % discoColors.length,
                };
            }
        );

        this.discoLightPools = Array.from(
            { length: 3 },
            (_, index): DiscoLightPool => ({
                phase: this.random() * Math.PI * 2,
                speed: 0.045 + this.random() * 0.06,
                radius: 0.2 + this.random() * 0.13,
                alpha: 0.022 + this.random() * 0.02,
                colorIndex: (index * 2 + 1) % discoColors.length,
                yRatio: 0.52 + this.random() * 0.32,
            })
        );
    }

    private createDiscoBackdropCache() {
        const scale =
            this.width * this.height > 1_400_000
                ? 0.5
                : 0.68;
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

        const tint = c.createLinearGradient(
            0,
            0,
            0,
            this.height
        );
        tint.addColorStop(0, "rgba(30, 27, 75, 0.11)");
        tint.addColorStop(0.48, "rgba(49, 46, 129, 0.055)");
        tint.addColorStop(1, "rgba(15, 23, 42, 0.08)");

        c.fillStyle = tint;
        c.fillRect(0, 0, this.width, this.height);

        const topGlow = c.createRadialGradient(
            this.width * 0.5,
            0,
            0,
            this.width * 0.5,
            0,
            Math.max(this.width, this.height) * 0.58
        );
        topGlow.addColorStop(0, "rgba(196, 181, 253, 0.07)");
        topGlow.addColorStop(0.44, "rgba(59, 130, 246, 0.028)");
        topGlow.addColorStop(1, "rgba(30, 27, 75, 0)");

        c.fillStyle = topGlow;
        c.fillRect(0, 0, this.width, this.height);

        return canvas;
    }

    private createDiscoBallCache() {
        const logicalSize = this.discoBallLogicalSize;
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(
            logicalSize * this.discoSpriteDpr
        );
        canvas.height = canvas.width;

        const c = canvas.getContext("2d");
        if (!c)
            return canvas;

        c.setTransform(
            this.discoSpriteDpr,
            0,
            0,
            this.discoSpriteDpr,
            0,
            0
        );

        const center = logicalSize * 0.5;
        const radius = logicalSize * 0.37;

        c.save();
        c.translate(center, center);
        c.beginPath();
        c.arc(0, 0, radius, 0, Math.PI * 2);
        c.clip();

        const chrome = c.createRadialGradient(
            -radius * 0.28,
            -radius * 0.34,
            radius * 0.06,
            0,
            0,
            radius * 1.12
        );
        chrome.addColorStop(0, "rgba(255, 255, 255, 0.98)");
        chrome.addColorStop(0.22, "rgba(226, 232, 240, 0.94)");
        chrome.addColorStop(0.56, "rgba(148, 163, 184, 0.9)");
        chrome.addColorStop(0.82, "rgba(109, 90, 146, 0.88)");
        chrome.addColorStop(1, "rgba(30, 27, 75, 0.95)");

        c.fillStyle = chrome;
        c.fillRect(
            -radius,
            -radius,
            radius * 2,
            radius * 2
        );

        const tileSize = this.clamp(logicalSize * 0.047, 6, 8);
        const tileGap = 1.05;

        for (
            let y = -radius;
            y < radius;
            y += tileSize
        ) {
            const normalizedY = y / radius;
            const halfRow =
                Math.sqrt(
                    Math.max(0, 1 - normalizedY * normalizedY)
                ) * radius;

            for (
                let x = -halfRow;
                x < halfRow;
                x += tileSize
            ) {
                const normalizedX = x / radius;
                const shine = this.clamp(
                    0.3 +
                    (1 - Math.abs(normalizedX)) * 0.42 +
                    Math.sin(x * 0.21 + y * 0.17) * 0.18,
                    0.18,
                    0.92
                );
                const alternate =
                    (
                        Math.floor((x + y) / tileSize)
                    ) % 2 === 0;

                c.fillStyle = alternate
                    ? `rgba(240, 249, 255, ${shine})`
                    : `rgba(216, 180, 254, ${shine * 0.72})`;
                c.fillRect(
                    x + tileGap * 0.5,
                    y + tileGap * 0.5,
                    tileSize - tileGap,
                    tileSize - tileGap
                );
            }
        }

        c.restore();

        c.strokeStyle = "rgba(255, 255, 255, 0.68)";
        c.lineWidth = 1.1;
        c.beginPath();
        c.arc(center, center, radius, 0, Math.PI * 2);
        c.stroke();

        return canvas;
    }

    private createDiscoLightPoolSprite(colorIndex: number) {
        const logicalSize = 220;
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(
            logicalSize * this.discoSpriteDpr
        );
        canvas.height = canvas.width;

        const c = canvas.getContext("2d");
        if (!c)
            return canvas;

        c.setTransform(
            this.discoSpriteDpr,
            0,
            0,
            this.discoSpriteDpr,
            0,
            0
        );

        const center = logicalSize * 0.5;
        const gradient = c.createRadialGradient(
            center,
            center,
            0,
            center,
            center,
            center
        );
        gradient.addColorStop(
            0,
            this.getDiscoColor(colorIndex, 0.82)
        );
        gradient.addColorStop(0.46, this.getDiscoColor(colorIndex, 0.22));
        gradient.addColorStop(1, this.getDiscoColor(colorIndex, 0));

        c.fillStyle = gradient;
        c.fillRect(0, 0, logicalSize, logicalSize);

        return canvas;
    }

    private getDiscoBeatPulse() {
        const cycle = this.timer % 3.55;
        const primary = this.smoothPulse(
            cycle,
            0.18,
            0.12
        );
        const secondary = this.smoothPulse(
            cycle,
            0.48,
            0.085
        ) * 0.34;

        return this.clamp(primary + secondary, 0, 1);
    }

    private drawDiscoBackground() {
        const c = this.ctx;
        const beat = this.getDiscoBeatPulse();

        if (this.discoBackdrop) {
            c.drawImage(
                this.discoBackdrop,
                0,
                0,
                this.width,
                this.height
            );
        }

        if (!this.discoLightPoolSprites.length)
            return;

        c.save();
        c.globalCompositeOperation = "screen";

        for (const pool of this.discoLightPools) {
            const centerX =
                (
                    0.5 +
                    Math.sin(
                        this.timer * pool.speed +
                        pool.phase
                    ) * 0.47
                ) * this.width;
            const centerY =
                pool.yRatio * this.height +
                Math.sin(
                    this.timer * pool.speed * 0.73 +
                    pool.phase
                ) * this.height * 0.045;
            const diameter =
                Math.max(this.width, this.height) *
                pool.radius *
                2;
            const sprite =
                this.discoLightPoolSprites[pool.colorIndex];

            c.globalAlpha =
                pool.alpha *
                (1 + beat * 0.55);
            c.drawImage(
                sprite,
                centerX - diameter * 0.5,
                centerY - diameter * 0.5,
                diameter,
                diameter
            );
        }

        c.restore();
    }

    private drawDiscoBeams() {
        const c = this.ctx;
        const beat = this.getDiscoBeatPulse();
        const centerX = this.width * 0.5;
        const centerY = this.clamp(
            this.height * 0.14,
            70,
            108
        );
        const ballRadius = this.discoBallLogicalSize * 0.37;
        const maxLength =
            Math.hypot(this.width, this.height) * 1.08;

        c.save();
        c.globalCompositeOperation = "screen";

        for (const beam of this.discoBeams) {
            const angle =
                beam.baseAngle +
                Math.sin(
                    this.timer * beam.speed +
                    beam.phase
                ) * beam.sweep +
                Math.sin(
                    this.timer * beam.speed * 0.43 +
                    beam.phase * 0.7
                ) * beam.sweep * 0.28;
            const halfWidth =
                beam.width * (1 + beat * 0.28);
            const length = maxLength * beam.length;
            const startRadius = ballRadius * 0.55;
            const startX =
                centerX + Math.cos(angle) * startRadius;
            const startY =
                centerY + Math.sin(angle) * startRadius;
            const firstAngle = angle - halfWidth;
            const secondAngle = angle + halfWidth;
            const edgeBias =
                0.5 +
                Math.abs(Math.cos(angle)) * 0.5;
            const alpha =
                beam.alpha *
                edgeBias *
                (1 + beat * 0.66);

            c.fillStyle = this.getDiscoColor(
                beam.colorIndex,
                alpha
            );
            c.beginPath();
            c.moveTo(startX, startY);
            c.lineTo(
                startX + Math.cos(firstAngle) * length,
                startY + Math.sin(firstAngle) * length
            );
            c.lineTo(
                startX + Math.cos(secondAngle) * length,
                startY + Math.sin(secondAngle) * length
            );
            c.closePath();
            c.fill();
        }

        c.restore();
    }

    private drawDiscoBall() {
        if (!this.discoBall)
            return;

        const c = this.ctx;
        const beat = this.getDiscoBeatPulse();
        const centerX = this.width * 0.5;
        const centerY = this.clamp(
            this.height * 0.14,
            70,
            108
        );
        const logicalWidth =
            this.discoBall.width / this.discoSpriteDpr;
        const logicalHeight =
            this.discoBall.height / this.discoSpriteDpr;
        const glowDiameter =
            this.discoBallLogicalSize *
            (1.8 + beat * 0.28);

        c.save();
        c.globalCompositeOperation = "screen";

        const violetGlow = this.discoLightPoolSprites[1];
        const cyanGlow = this.discoLightPoolSprites[2];

        if (violetGlow && cyanGlow) {
            const colorBlend =
                Math.sin(this.timer * 0.34) * 0.5 + 0.5;

            c.globalAlpha = 0.12 + beat * 0.07;
            c.drawImage(
                violetGlow,
                centerX - glowDiameter * 0.5,
                centerY - glowDiameter * 0.5,
                glowDiameter,
                glowDiameter
            );
            c.globalAlpha = 0.04 + colorBlend * 0.055;
            c.drawImage(
                cyanGlow,
                centerX - glowDiameter * 0.46,
                centerY - glowDiameter * 0.46,
                glowDiameter * 0.92,
                glowDiameter * 0.92
            );
        }

        c.translate(centerX, centerY);
        c.rotate(this.timer * 0.062);
        c.scale(
            1 + beat * 0.012,
            1 + beat * 0.012
        );
        c.globalAlpha = 0.93 + beat * 0.07;
        c.drawImage(
            this.discoBall,
            -logicalWidth * 0.5,
            -logicalHeight * 0.5,
            logicalWidth,
            logicalHeight
        );
        c.restore();

        c.save();
        c.strokeStyle = "rgba(226, 232, 240, 0.28)";
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(centerX, 0);
        c.lineTo(
            centerX,
            centerY - this.discoBallLogicalSize * 0.36
        );
        c.stroke();
        c.restore();
    }

    private drawDiscoParticle(p: Particle) {
        const sprite = this.getDiscoParticleSprite(p);
        const logicalWidth =
            sprite.width / this.discoSpriteDpr;
        const logicalHeight =
            sprite.height / this.discoSpriteDpr;

        this.ctx.globalCompositeOperation = "screen";
        this.ctx.drawImage(
            sprite,
            -logicalWidth * 0.5,
            -logicalHeight * 0.5,
            logicalWidth,
            logicalHeight
        );
    }

    private getDiscoParticleSprite(p: Particle) {
        const sizeBucket = Math.max(
            1,
            Math.round(p.size)
        );
        const variant = p.variant ?? 0;
        const colorIndex = p.colorIndex ?? 0;
        const key =
            `${variant}:${sizeBucket}:${colorIndex}`;
        const cached = this.discoParticleSprites.get(key);

        if (cached)
            return cached;

        const sprite = this.createDiscoParticleSprite(
            variant,
            sizeBucket,
            colorIndex
        );
        this.discoParticleSprites.set(key, sprite);

        return sprite;
    }

    private createDiscoParticleSprite(
        variant: number,
        size: number,
        colorIndex: number
    ) {
        const logicalSize = size * 7 + 14;
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(
            1,
            Math.ceil(logicalSize * this.discoSpriteDpr)
        );
        canvas.height = canvas.width;

        const c = canvas.getContext("2d");
        if (!c)
            return canvas;

        c.setTransform(
            this.discoSpriteDpr,
            0,
            0,
            this.discoSpriteDpr,
            0,
            0
        );
        c.translate(logicalSize * 0.5, logicalSize * 0.5);
        c.fillStyle = this.getDiscoColor(colorIndex, 0.94);
        c.shadowColor = this.getDiscoColor(colorIndex, 0.7);
        c.shadowBlur = 3 + size * 1.4;

        if (variant === 1) {
            c.fillRect(
                -size * 0.95,
                -size * 0.22,
                size * 1.9,
                size * 0.44
            );
            return canvas;
        }

        c.beginPath();
        c.moveTo(0, -size);
        c.lineTo(size * 0.62, 0);
        c.lineTo(0, size);
        c.lineTo(-size * 0.62, 0);
        c.closePath();
        c.fill();

        if (variant === 2) {
            c.globalAlpha = 0.54;
            c.fillStyle = "rgba(255, 255, 255, 0.9)";
            c.fillRect(
                -size * 1.7,
                -0.4,
                size * 3.4,
                0.8
            );
            c.fillRect(
                -0.4,
                -size * 1.7,
                0.8,
                size * 3.4
            );
        }

        return canvas;
    }

    private getDiscoColor(
        colorIndex: number,
        alpha: number
    ) {
        const [red, green, blue] =
            discoColors[
                colorIndex % discoColors.length
            ];

        return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    }

    private rebuildPaperButterflyDreamCaches() {
        this.paperButterflyDreamParticleSprites.clear();
        this.paperButterflyDreamBackdrop = this.createPaperButterflyDreamBackdropCache();
        this.paperButterflyDreamMoonlight = this.createPaperButterflyDreamMoonlightCache();
        this.paperButterflyDreamFogSprites = [0, 1, 2].map(
            variant => this.createPaperButterflyDreamFogSprite(variant)
        );
        this.paperButterflyDreamLanternSprites = [0, 1].map(
            variant => this.createPaperButterflyDreamLanternSprite(variant)
        );
        this.paperButterflyDreamPatternSprites = [0, 1].map(
            variant => this.createPaperButterflyDreamPatternSprite(variant)
        );
        this.paperButterflyDreamShadowSprites = [0, 1].map(
            variant => this.createPaperButterflyDreamShadowSprite(variant)
        );
        this.rebuildPaperButterflyDreamScene();
    }

    private rebuildPaperButterflyDreamScene() {
        this.paperButterflyDreamFogLayers = [
            {
                yRatio: 0.54,
                speed: 7.5,
                phase: this.random() * 640,
                wave: 7,
                alpha: 0.11,
                scale: 0.94,
                spriteIndex: 0,
            },
            {
                yRatio: 0.69,
                speed: -10.5,
                phase: this.random() * 720,
                wave: 10,
                alpha: 0.14,
                scale: 1.08,
                spriteIndex: 1,
            },
            {
                yRatio: 0.84,
                speed: 13.5,
                phase: this.random() * 820,
                wave: 13,
                alpha: 0.16,
                scale: 1.22,
                spriteIndex: 2,
            },
        ];

        this.paperButterflyDreamLanterns = [
            {
                xRatio: 0.08,
                yRatio: 0.1,
                scale: 0.82,
                phase: this.random() * Math.PI * 2,
                alpha: 0.42,
            },
            {
                xRatio: 0.91,
                yRatio: 0.14,
                scale: 0.72,
                phase: this.random() * Math.PI * 2,
                alpha: 0.34,
            },
            {
                xRatio: 0.17,
                yRatio: 0.25,
                scale: 0.5,
                phase: this.random() * Math.PI * 2,
                alpha: 0.2,
            },
        ];

        this.paperButterflyDreamShadows = [0, 1, 2].map(index => ({
            xRatio:
                index === 0
                    ? 0.12
                    : index === 1
                        ? 0.84
                        : 0.67,
            yRatio: 0.68 + index * 0.055,
            scale: 0.7 + this.random() * 0.34,
            phase: this.random(),
            cycleDuration: 18 + this.random() * 9,
            variant: index % 2,
        }));

        this.paperButterflyDreamPatterns = [0, 1, 2].map(index => ({
            xRatio:
                index === 0
                    ? 0.12
                    : index === 1
                        ? 0.88
                        : 0.72,
            yRatio: 0.56 + index * 0.11,
            scale: 0.56 + this.random() * 0.42,
            phase: this.random(),
            cycleDuration: 13 + this.random() * 9,
            variant: index === 2 ? 1 : 0,
        }));
    }

    private createPaperButterflyDreamBackdropCache() {
        const scale =
            this.width * this.height > 1_400_000
                ? 0.5
                : 0.68;
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

        const background = c.createLinearGradient(
            0,
            0,
            0,
            this.height
        );
        background.addColorStop(0, "rgba(5, 8, 25, 0.98)");
        background.addColorStop(0.48, "rgba(9, 9, 25, 0.96)");
        background.addColorStop(1, "rgba(3, 5, 14, 0.99)");
        c.fillStyle = background;
        c.fillRect(0, 0, this.width, this.height);

        const agedRed = c.createRadialGradient(
            this.width * 0.12,
            this.height * 0.28,
            0,
            this.width * 0.12,
            this.height * 0.28,
            Math.max(this.width, this.height) * 0.64
        );
        agedRed.addColorStop(0, "rgba(127, 29, 29, 0.075)");
        agedRed.addColorStop(0.52, "rgba(76, 29, 149, 0.026)");
        agedRed.addColorStop(1, "rgba(15, 23, 42, 0)");
        c.fillStyle = agedRed;
        c.fillRect(0, 0, this.width, this.height);

        this.drawPaperButterflyDreamCachedEdges(c);

        return canvas;
    }

    private drawPaperButterflyDreamCachedEdges(c: CanvasRenderingContext2D) {
        c.save();
        c.strokeStyle = "rgba(2, 6, 23, 0.45)";
        c.lineCap = "round";

        for (const side of [-1, 1]) {
            const baseX = side < 0 ? 0 : this.width;
            const direction = side < 0 ? 1 : -1;
            const baseY = this.height * 0.72;

            c.lineWidth = Math.max(2.6, this.width * 0.0035);
            c.beginPath();
            c.moveTo(baseX, baseY);
            c.bezierCurveTo(
                baseX + direction * this.width * 0.04,
                this.height * 0.55,
                baseX + direction * this.width * 0.085,
                this.height * 0.39,
                baseX + direction * this.width * 0.14,
                this.height * 0.25
            );
            c.stroke();

            for (let branch = 0; branch < 5; branch++) {
                const startX =
                    baseX +
                    direction * this.width *
                    (0.03 + branch * 0.019);
                const startY =
                    baseY -
                    this.height * (0.06 + branch * 0.06);

                c.lineWidth = Math.max(0.9, this.width * 0.0012);
                c.beginPath();
                c.moveTo(startX, startY);
                c.quadraticCurveTo(
                    startX + direction * this.width * 0.055,
                    startY - this.height * 0.035,
                    startX + direction * this.width *
                    (0.085 + branch * 0.01),
                    startY - this.height *
                    (0.065 + branch * 0.012)
                );
                c.stroke();
            }
        }

        c.restore();
    }


    private createPaperButterflyDreamMoonlightCache() {
        const logicalSize = 420;
        const moonRadius = 52;
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(
            logicalSize * this.paperButterflyDreamSpriteDpr
        );
        canvas.height = canvas.width;

        const c = canvas.getContext("2d");
        if (!c)
            return canvas;

        c.setTransform(
            this.paperButterflyDreamSpriteDpr,
            0,
            0,
            this.paperButterflyDreamSpriteDpr,
            0,
            0
        );

        const center = logicalSize * 0.5;
        const glow = c.createRadialGradient(
            center,
            center,
            moonRadius * 0.36,
            center,
            center,
            logicalSize * 0.5
        );

        glow.addColorStop(0, "rgba(224, 242, 254, 0.34)");
        glow.addColorStop(0.18, "rgba(165, 243, 252, 0.18)");
        glow.addColorStop(0.48, "rgba(129, 140, 248, 0.075)");
        glow.addColorStop(1, "rgba(76, 29, 149, 0)");

        c.fillStyle = glow;
        c.fillRect(0, 0, logicalSize, logicalSize);

        c.save();
        c.translate(center, center);
        c.shadowColor = "rgba(186, 230, 253, 0.32)";
        c.shadowBlur = 16;

        const moonGradient = c.createRadialGradient(
            -moonRadius * 0.3,
            -moonRadius * 0.34,
            moonRadius * 0.06,
            0,
            0,
            moonRadius
        );

        moonGradient.addColorStop(0, "rgba(248, 250, 252, 0.98)");
        moonGradient.addColorStop(0.38, "rgba(226, 232, 240, 0.95)");
        moonGradient.addColorStop(0.72, "rgba(186, 200, 216, 0.92)");
        moonGradient.addColorStop(1, "rgba(100, 116, 139, 0.88)");

        c.fillStyle = moonGradient;
        c.beginPath();
        c.arc(0, 0, moonRadius, 0, Math.PI * 2);
        c.fill();

        c.save();
        c.beginPath();
        c.arc(0, 0, moonRadius, 0, Math.PI * 2);
        c.clip();

        const surfaceShade = c.createLinearGradient(
            -moonRadius,
            -moonRadius,
            moonRadius,
            moonRadius
        );

        surfaceShade.addColorStop(0, "rgba(255, 255, 255, 0.12)");
        surfaceShade.addColorStop(0.55, "rgba(148, 163, 184, 0.04)");
        surfaceShade.addColorStop(1, "rgba(30, 41, 59, 0.22)");

        c.fillStyle = surfaceShade;
        c.fillRect(
            -moonRadius,
            -moonRadius,
            moonRadius * 2,
            moonRadius * 2
        );

        const craters: Array<
            [number, number, number, number]
        > = [
            [-20, -14, 9, 0.11],
            [14, -20, 7, 0.09],
            [23, 8, 11, 0.12],
            [-10, 20, 6, 0.08],
            [-29, 13, 5, 0.07],
            [7, 25, 4, 0.06],
            [3, -4, 13, 0.07],
        ];

        for (const [x, y, radius, alpha] of craters) {
            const crater = c.createRadialGradient(
                x - radius * 0.24,
                y - radius * 0.24,
                radius * 0.08,
                x,
                y,
                radius
            );

            crater.addColorStop(
                0,
                `rgba(71, 85, 105, ${alpha * 0.3})`
            );
            crater.addColorStop(
                0.58,
                `rgba(71, 85, 105, ${alpha})`
            );
            crater.addColorStop(
                1,
                "rgba(255, 255, 255, 0)"
            );

            c.fillStyle = crater;
            c.beginPath();
            c.arc(x, y, radius, 0, Math.PI * 2);
            c.fill();
        }

        c.fillStyle = "rgba(255, 255, 255, 0.08)";
        c.beginPath();
        c.ellipse(
            -17,
            -23,
            20,
            8,
            -0.45,
            0,
            Math.PI * 2
        );
        c.fill();

        c.restore();

        c.strokeStyle = "rgba(224, 242, 254, 0.34)";
        c.lineWidth = 1;
        c.beginPath();
        c.arc(
            0,
            0,
            moonRadius - 0.5,
            0,
            Math.PI * 2
        );
        c.stroke();

        c.restore();

        return canvas;
    }

    private createPaperButterflyDreamFogSprite(variant: number) {
        const logicalWidth = 720;
        const logicalHeight = 180;
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(
            logicalWidth * this.paperButterflyDreamSpriteDpr
        );
        canvas.height = Math.round(
            logicalHeight * this.paperButterflyDreamSpriteDpr
        );

        const c = canvas.getContext("2d");
        if (!c)
            return canvas;

        c.setTransform(
            this.paperButterflyDreamSpriteDpr,
            0,
            0,
            this.paperButterflyDreamSpriteDpr,
            0,
            0
        );

        const gradient = c.createLinearGradient(
            0,
            0,
            0,
            logicalHeight
        );
        gradient.addColorStop(0, "rgba(186, 230, 253, 0)");
        gradient.addColorStop(
            0.48,
            variant === 1
                ? "rgba(148, 163, 184, 0.2)"
                : "rgba(165, 243, 252, 0.17)"
        );
        gradient.addColorStop(1, "rgba(100, 116, 139, 0)");
        c.fillStyle = gradient;

        for (let lobe = -2; lobe < 15; lobe++) {
            const x = lobe * 58 + variant * 23;
            const y =
                logicalHeight * 0.58 +
                Math.sin(lobe * 1.37 + variant) * 16;
            const radiusX = 72 + (lobe % 3) * 16;
            const radiusY = 29 + ((lobe + variant) % 4) * 7;

            c.beginPath();
            c.ellipse(
                x,
                y,
                radiusX,
                radiusY,
                0,
                0,
                Math.PI * 2
            );
            c.fill();
        }

        return canvas;
    }

    private createPaperButterflyDreamLanternSprite(variant: number) {
        const logicalWidth = 150;
        const logicalHeight = 210;
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(
            logicalWidth * this.paperButterflyDreamSpriteDpr
        );
        canvas.height = Math.round(
            logicalHeight * this.paperButterflyDreamSpriteDpr
        );

        const c = canvas.getContext("2d");
        if (!c)
            return canvas;

        c.setTransform(
            this.paperButterflyDreamSpriteDpr,
            0,
            0,
            this.paperButterflyDreamSpriteDpr,
            0,
            0
        );
        c.translate(logicalWidth * 0.5, logicalHeight * 0.5);

        const glowColor =
            variant === 0
                ? [220, 38, 38]
                : [165, 243, 252];
        const glow = c.createRadialGradient(
            0,
            2,
            0,
            0,
            2,
            72
        );
        glow.addColorStop(
            0,
            `rgba(${glowColor[0]}, ${glowColor[1]}, ${glowColor[2]}, 0.42)`
        );
        glow.addColorStop(
            1,
            `rgba(${glowColor[0]}, ${glowColor[1]}, ${glowColor[2]}, 0)`
        );
        c.fillStyle = glow;
        c.fillRect(-75, -75, 150, 150);

        c.fillStyle =
            variant === 0
                ? "rgba(127, 29, 29, 0.68)"
                : "rgba(71, 85, 105, 0.58)";
        c.beginPath();
        c.ellipse(0, 0, 26, 37, 0, 0, Math.PI * 2);
        c.fill();

        c.strokeStyle = "rgba(15, 23, 42, 0.72)";
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(-21, -34);
        c.lineTo(21, -34);
        c.moveTo(-21, 34);
        c.lineTo(21, 34);
        c.stroke();

        c.lineWidth = 1.4;
        c.beginPath();
        c.moveTo(-9, 37);
        c.lineTo(-5, 60);
        c.moveTo(0, 37);
        c.lineTo(0, 66);
        c.moveTo(9, 37);
        c.lineTo(5, 60);
        c.stroke();

        return canvas;
    }

    private createPaperButterflyDreamPatternSprite(variant: number) {
        const logicalSize = 170;
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(
            logicalSize * this.paperButterflyDreamSpriteDpr
        );
        canvas.height = canvas.width;

        const c = canvas.getContext("2d");
        if (!c)
            return canvas;

        c.setTransform(
            this.paperButterflyDreamSpriteDpr,
            0,
            0,
            this.paperButterflyDreamSpriteDpr,
            0,
            0
        );
        c.translate(logicalSize * 0.5, logicalSize * 0.5);

        c.strokeStyle = "rgba(153, 27, 27, 0.46)";
        c.fillStyle = "rgba(153, 27, 27, 0.28)";
        c.lineWidth = 1.2;

        if (variant === 1) {
            c.font = "600 68px serif";
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.fillText("囍", 0, 1);
            return canvas;
        }

        for (let ring = 0; ring < 3; ring++) {
            const radius = 25 + ring * 19;

            for (let petal = 0; petal < 8; petal++) {
                const angle = petal * Math.PI * 0.25;
                c.save();
                c.rotate(angle);
                c.translate(0, -radius);
                c.rotate(Math.PI * 0.25);
                c.strokeRect(-7, -7, 14, 14);
                c.restore();
            }
        }

        return canvas;
    }

    private createPaperButterflyDreamShadowSprite(variant: number) {
        const logicalWidth = 150;
        const logicalHeight = 240;
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(
            logicalWidth * this.paperButterflyDreamSpriteDpr
        );
        canvas.height = Math.round(
            logicalHeight * this.paperButterflyDreamSpriteDpr
        );

        const c = canvas.getContext("2d");
        if (!c)
            return canvas;

        c.setTransform(
            this.paperButterflyDreamSpriteDpr,
            0,
            0,
            this.paperButterflyDreamSpriteDpr,
            0,
            0
        );
        c.translate(logicalWidth * 0.5, logicalHeight * 0.5);
        c.fillStyle = "rgba(2, 6, 23, 0.82)";
        c.shadowColor = "rgba(15, 23, 42, 0.7)";
        c.shadowBlur = 12;

        if (variant === 0) {
            c.beginPath();
            c.arc(0, -64, 12, 0, Math.PI * 2);
            c.fill();
            c.beginPath();
            c.moveTo(0, -48);
            c.bezierCurveTo(-22, -34, -24, 20, -38, 82);
            c.quadraticCurveTo(0, 104, 38, 82);
            c.bezierCurveTo(24, 20, 22, -34, 0, -48);
            c.closePath();
            c.fill();
        } else {
            c.beginPath();
            c.moveTo(0, -88);
            c.lineTo(24, -42);
            c.lineTo(31, 82);
            c.lineTo(-31, 82);
            c.lineTo(-24, -42);
            c.closePath();
            c.fill();
        }

        return canvas;
    }

    private getPaperButterflyDreamInversion() {
        const cycleDuration = 29;
        const phase =
            (this.timer + this.paperButterflyDreamInversionOffset) %
            cycleDuration;

        return this.smoothPulse(phase, 18.2, 0.92);
    }

    private drawPaperButterflyDreamBackground() {
        if (this.paperButterflyDreamBackdrop) {
            this.ctx.drawImage(
                this.paperButterflyDreamBackdrop,
                0,
                0,
                this.width,
                this.height
            );
        }

        const inversion = this.getPaperButterflyDreamInversion();

        if (inversion > 0.002) {
            this.ctx.fillStyle =
                `rgba(8, 47, 73, ${0.12 * inversion})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
    }


    private drawPaperButterflyDreamMoonlight() {
        if (!this.paperButterflyDreamMoonlight)
            return;

        const c = this.ctx;
        const inversion =
            this.getPaperButterflyDreamInversion();

        const diameter = this.clamp(
            Math.min(this.width, this.height) * 0.62,
            300,
            440
        );

        const centerX = this.width * 0.84;
        const centerY = this.clamp(
            this.height * 0.145,
            78,
            122
        );

        c.save();
        c.globalCompositeOperation = "screen";
        c.globalAlpha = 0.82 + inversion * 0.14;

        c.drawImage(
            this.paperButterflyDreamMoonlight,
            centerX - diameter * 0.5,
            centerY - diameter * 0.5,
            diameter,
            diameter
        );

        c.globalAlpha = 0.032 + inversion * 0.03;
        c.fillStyle = "rgba(165, 243, 252, 0.9)";
        c.beginPath();
        c.moveTo(centerX - 8, centerY + 22);
        c.lineTo(this.width * 0.62, this.height * 0.91);
        c.lineTo(this.width * 0.98, this.height * 0.91);
        c.closePath();
        c.fill();

        const mistWidth = diameter * 0.42;
        const mistY =
            centerY +
            diameter * 0.03 +
            Math.sin(this.timer * 0.07) * 4;

        const mistGradient = c.createLinearGradient(
            centerX - mistWidth,
            mistY,
            centerX + mistWidth,
            mistY
        );

        mistGradient.addColorStop(
            0,
            "rgba(148, 163, 184, 0)"
        );
        mistGradient.addColorStop(
            0.28,
            `rgba(
                148,
                163,
                184,
                ${0.08 + inversion * 0.025}
            )`
        );
        mistGradient.addColorStop(
            0.64,
            `rgba(
                165,
                243,
                252,
                ${0.055 + inversion * 0.02}
            )`
        );
        mistGradient.addColorStop(
            1,
            "rgba(148, 163, 184, 0)"
        );

        c.globalAlpha = 1;
        c.strokeStyle = mistGradient;
        c.lineWidth = 10;
        c.lineCap = "round";
        c.beginPath();
        c.moveTo(centerX - mistWidth, mistY);
        c.bezierCurveTo(
            centerX - mistWidth * 0.4,
            mistY - 5,
            centerX + mistWidth * 0.35,
            mistY + 6,
            centerX + mistWidth,
            mistY
        );
        c.stroke();

        c.restore();
    }

    private drawPaperButterflyDreamLanterns() {
        if (this.paperButterflyDreamLanternSprites.length < 2)
            return;

        const c = this.ctx;
        const inversion = this.getPaperButterflyDreamInversion();

        c.save();
        c.globalCompositeOperation = "screen";

        for (const lantern of this.paperButterflyDreamLanterns) {
            const sway =
                Math.sin(this.timer * 0.38 + lantern.phase) *
                0.07 *
                (1 - inversion * 0.55);
            const bob =
                Math.sin(this.timer * 0.23 + lantern.phase) * 4;
            const sprite = this.paperButterflyDreamLanternSprites[0];
            const spectral = this.paperButterflyDreamLanternSprites[1];
            const logicalWidth =
                sprite.width / this.paperButterflyDreamSpriteDpr;
            const logicalHeight =
                sprite.height / this.paperButterflyDreamSpriteDpr;
            const scale = lantern.scale *
                this.clamp(
                    Math.min(this.width, this.height) / 720,
                    0.72,
                    1.08
                );

            c.save();
            c.translate(
                lantern.xRatio * this.width,
                lantern.yRatio * this.height + bob
            );
            c.rotate(sway);
            c.globalAlpha =
                lantern.alpha * (1 - inversion * 0.78);
            c.drawImage(
                sprite,
                -logicalWidth * scale * 0.5,
                -logicalHeight * scale * 0.5,
                logicalWidth * scale,
                logicalHeight * scale
            );
            c.globalAlpha =
                lantern.alpha * inversion * 0.58;
            c.drawImage(
                spectral,
                -logicalWidth * scale * 0.5,
                -logicalHeight * scale * 0.5,
                logicalWidth * scale,
                logicalHeight * scale
            );
            c.restore();
        }

        c.restore();
    }

    private drawPaperButterflyDreamFog() {
        if (!this.paperButterflyDreamFogSprites.length)
            return;

        const c = this.ctx;
        const inversion = this.getPaperButterflyDreamInversion();

        c.save();
        c.globalCompositeOperation = "screen";

        for (const layer of this.paperButterflyDreamFogLayers) {
            const sprite =
                this.paperButterflyDreamFogSprites[layer.spriteIndex];
            const logicalWidth =
                sprite.width / this.paperButterflyDreamSpriteDpr;
            const logicalHeight =
                sprite.height / this.paperButterflyDreamSpriteDpr;
            const drawWidth = logicalWidth * layer.scale;
            const drawHeight = Math.max(
                this.height * 0.2,
                logicalHeight * 0.72
            );
            const travel =
                this.timer *
                layer.speed *
                (1 - inversion * 0.38) +
                layer.phase;
            const offset =
                ((travel % drawWidth) + drawWidth) % drawWidth;
            const y =
                layer.yRatio * this.height +
                Math.sin(
                    this.timer * 0.12 +
                    layer.phase * 0.01
                ) * layer.wave -
                drawHeight * 0.5;
            const startX = -offset - drawWidth;
            const tileCount =
                Math.ceil(this.width / drawWidth) + 3;

            c.globalAlpha =
                layer.alpha *
                (1 + inversion * 0.22);

            for (let tile = 0; tile < tileCount; tile++) {
                c.drawImage(
                    sprite,
                    startX + tile * drawWidth,
                    y,
                    drawWidth,
                    drawHeight
                );
            }
        }

        c.restore();
    }

    private drawPaperButterflyDreamPaperPatterns() {
        if (!this.paperButterflyDreamPatternSprites.length)
            return;

        const c = this.ctx;
        const inversion = this.getPaperButterflyDreamInversion();

        c.save();
        c.globalCompositeOperation = "screen";

        for (const pattern of this.paperButterflyDreamPatterns) {
            const phase =
                (
                    this.timer / pattern.cycleDuration +
                    pattern.phase
                ) % 1;

            if (phase > 0.28)
                continue;

            const reveal = Math.sin(
                Math.PI * phase / 0.28
            );
            const sprite =
                this.paperButterflyDreamPatternSprites[pattern.variant];
            const logicalSize =
                sprite.width / this.paperButterflyDreamSpriteDpr;
            const scale = pattern.scale *
                this.clamp(
                    Math.min(this.width, this.height) / 720,
                    0.7,
                    1.08
                );

            c.globalAlpha =
                reveal *
                reveal *
                (0.035 + inversion * 0.026);
            c.drawImage(
                sprite,
                pattern.xRatio * this.width -
                logicalSize * scale * 0.5,
                pattern.yRatio * this.height -
                logicalSize * scale * 0.5,
                logicalSize * scale,
                logicalSize * scale
            );
        }

        c.restore();
    }

    private drawPaperButterflyDreamSilhouette() {
        if (!this.paperButterflyDreamShadowSprites.length)
            return;

        const c = this.ctx;
        const inversion = this.getPaperButterflyDreamInversion();

        c.save();

        for (const shadow of this.paperButterflyDreamShadows) {
            const phase =
                (
                    this.timer / shadow.cycleDuration +
                    shadow.phase
                ) % 1;

            if (phase > 0.25 && inversion < 0.22)
                continue;

            const reveal =
                phase <= 0.25
                    ? Math.sin(Math.PI * phase / 0.25)
                    : 0;
            const alpha =
                reveal * reveal * 0.042 +
                inversion * 0.052;
            const sprite =
                this.paperButterflyDreamShadowSprites[shadow.variant];
            const logicalWidth =
                sprite.width / this.paperButterflyDreamSpriteDpr;
            const logicalHeight =
                sprite.height / this.paperButterflyDreamSpriteDpr;
            const scale = shadow.scale *
                this.clamp(
                    Math.min(this.width, this.height) / 720,
                    0.72,
                    1.08
                );
            const drift =
                Math.sin(
                    this.timer * 0.08 +
                    shadow.phase * Math.PI * 2
                ) * 6;

            c.globalAlpha = alpha;
            c.drawImage(
                sprite,
                shadow.xRatio * this.width + drift -
                logicalWidth * scale * 0.5,
                shadow.yRatio * this.height -
                logicalHeight * scale * 0.76,
                logicalWidth * scale,
                logicalHeight * scale
            );
        }

        c.restore();
    }

    private drawPaperButterflyDreamMirror() {
        const c = this.ctx;
        const mirrorY = this.height * 0.78;
        const inversion = this.getPaperButterflyDreamInversion();
        const reflection = c.createLinearGradient(
            0,
            mirrorY,
            0,
            this.height
        );
        reflection.addColorStop(0, "rgba(15, 23, 42, 0)");
        reflection.addColorStop(
            0.34,
            `rgba(15, 23, 42, ${0.13 + inversion * 0.04})`
        );
        reflection.addColorStop(1, "rgba(2, 6, 23, 0.36)");
        c.fillStyle = reflection;
        c.fillRect(0, mirrorY, this.width, this.height - mirrorY);

        c.strokeStyle =
            `rgba(165, 243, 252, ${0.035 + inversion * 0.025})`;
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(this.width * 0.08, mirrorY);
        c.lineTo(this.width * 0.92, mirrorY);
        c.stroke();
    }

    private drawPaperButterflyDreamReflections() {
        const c = this.ctx;
        const mirrorY = this.height * 0.78;
        const inversion = this.getPaperButterflyDreamInversion();
        let drawn = 0;

        c.save();
        c.beginPath();
        c.rect(0, mirrorY, this.width, this.height - mirrorY);
        c.clip();
        c.globalCompositeOperation = "screen";

        for (const p of this.particles) {
            if (
                p.kind === "red-thread" ||
                p.y > mirrorY ||
                p.y < mirrorY - this.height * 0.48
            ) {
                continue;
            }

            const reflectedY =
                mirrorY +
                (mirrorY - p.y) * 0.38;
            const lag =
                Math.sin(
                    this.timer * 0.28 +
                    p.wobble
                ) *
                (3 + inversion * 16);

            c.save();
            c.translate(p.x + lag, reflectedY);
            c.scale(1, -0.48);
            c.rotate(-p.rotation + inversion * 0.08);
            c.globalAlpha =
                p.alpha *
                (0.1 + inversion * 0.06);
            this.drawPaperButterflyDreamParticleShape(p, true);
            c.restore();

            drawn++;

            if (drawn >= 22)
                break;
        }

        c.restore();
    }

    private drawPaperButterflyDreamParticle(p: Particle) {
        this.ctx.globalAlpha *= this.getPaperButterflyDreamCenterCalm(p);
        this.drawPaperButterflyDreamParticleShape(p, false);
    }

    private drawPaperButterflyDreamParticleShape(
        p: Particle,
        reflection: boolean
    ) {
        if (p.kind === "butterfly") {
            this.drawPaperButterflyDreamButterfly(p, reflection);
            return;
        }

        if (p.kind === "paper-ash") {
            this.drawPaperButterflyDreamPaperAsh(p);
            return;
        }

        if (p.kind === "red-thread") {
            this.drawPaperButterflyDreamRedThread(p);
            return;
        }

        this.drawPaperButterflyDreamSpiritLight(p);
    }

    private drawPaperButterflyDreamButterfly(
        p: Particle,
        reflection: boolean
    ) {
        const dissolve =
            this.getPaperButterflyDreamButterflyDissolve(p);
        const sprite = this.getPaperButterflyDreamParticleSprite(p);
        const logicalWidth =
            sprite.width / this.paperButterflyDreamSpriteDpr;
        const logicalHeight =
            sprite.height / this.paperButterflyDreamSpriteDpr;
        const wing =
            0.24 +
            Math.abs(Math.sin(p.flutter)) * 0.76;

        this.ctx.save();
        this.ctx.scale(wing, 1);
        this.ctx.globalCompositeOperation = "screen";
        this.ctx.drawImage(
            sprite,
            -logicalWidth * 0.5,
            -logicalHeight * 0.5,
            logicalWidth,
            logicalHeight
        );
        this.ctx.restore();

        if (reflection || dissolve <= 0.02)
            return;

        this.ctx.save();
        this.ctx.globalCompositeOperation = "screen";
        this.ctx.fillStyle = "rgba(202, 138, 4, 0.58)";
        this.ctx.globalAlpha *= dissolve;

        for (let fragment = 0; fragment < 4; fragment++) {
            const offset = fragment + 1;
            const x =
                -p.size * (0.6 + offset * 0.42);
            const y =
                Math.sin(
                    p.wobble + fragment * 1.7
                ) * p.size * 0.42 +
                offset * 1.8;

            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(
                p.rotation + fragment * 0.7
            );
            this.ctx.fillRect(
                -p.size * 0.16,
                -p.size * 0.08,
                p.size * 0.32,
                p.size * 0.16
            );
            this.ctx.restore();
        }

        this.ctx.restore();
    }

    private drawPaperButterflyDreamPaperAsh(p: Particle) {
        const c = this.ctx;
        const color = this.getPaperButterflyDreamColor(
            p.colorIndex ?? 0,
            0.86
        );

        c.fillStyle = color;

        if ((p.variant ?? 0) === 1) {
            c.beginPath();
            c.moveTo(0, -p.size);
            c.lineTo(p.size * 0.82, p.size * 0.68);
            c.lineTo(-p.size * 0.65, p.size * 0.42);
            c.closePath();
            c.fill();
            return;
        }

        c.fillRect(
            -p.size * 0.72,
            -p.size * 0.42,
            p.size * 1.44,
            p.size * 0.84
        );

        if ((p.variant ?? 0) === 2 && p.size > 2) {
            c.strokeStyle = "rgba(69, 26, 3, 0.46)";
            c.lineWidth = 0.55;
            c.beginPath();
            c.moveTo(-p.size * 0.42, 0);
            c.quadraticCurveTo(
                0,
                -p.size * 0.28,
                p.size * 0.38,
                p.size * 0.12
            );
            c.stroke();
        }
    }

    private drawPaperButterflyDreamRedThread(p: Particle) {
        const c = this.ctx;
        const direction = (p.variant ?? 0) === 0 ? 1 : -1;

        c.strokeStyle = "rgba(185, 28, 28, 0.58)";
        c.lineWidth = p.size;
        c.lineCap = "round";
        c.beginPath();
        c.moveTo(-p.length * 0.5, 0);
        c.bezierCurveTo(
            -p.length * 0.18,
            Math.sin(p.wobble) * 12 * direction,
            p.length * 0.16,
            Math.sin(p.flutter) * 10 * -direction,
            p.length * 0.5,
            0
        );
        c.stroke();
    }

    private drawPaperButterflyDreamSpiritLight(p: Particle) {
        const sprite = this.getPaperButterflyDreamParticleSprite(p);
        const logicalWidth =
            sprite.width / this.paperButterflyDreamSpriteDpr;
        const logicalHeight =
            sprite.height / this.paperButterflyDreamSpriteDpr;

        this.ctx.globalCompositeOperation = "screen";
        this.ctx.drawImage(
            sprite,
            -logicalWidth * 0.5,
            -logicalHeight * 0.5,
            logicalWidth,
            logicalHeight
        );
    }

    private getPaperButterflyDreamParticleSprite(p: Particle) {
        const sizeBucket = Math.max(
            2,
            Math.round(p.size / 2) * 2
        );
        const colorIndex = p.colorIndex ?? 0;
        const key =
            `${p.kind ?? "paper-ash"}:` +
            `${sizeBucket}:${colorIndex}:${p.variant ?? 0}`;
        const cached = this.paperButterflyDreamParticleSprites.get(key);

        if (cached)
            return cached;

        const sprite = this.createPaperButterflyDreamParticleSprite(
            p.kind === "butterfly"
                ? "butterfly"
                : "spirit-light",
            sizeBucket,
            colorIndex,
            p.variant ?? 0
        );
        this.paperButterflyDreamParticleSprites.set(key, sprite);

        return sprite;
    }

    private createPaperButterflyDreamParticleSprite(
        kind: "butterfly" | "spirit-light",
        size: number,
        colorIndex: number,
        variant: number
    ) {
        const logicalSize =
            kind === "butterfly"
                ? size * 5 + 18
                : size * 7 + 20;
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(
            1,
            Math.ceil(logicalSize * this.paperButterflyDreamSpriteDpr)
        );
        canvas.height = canvas.width;

        const c = canvas.getContext("2d");
        if (!c)
            return canvas;

        c.setTransform(
            this.paperButterflyDreamSpriteDpr,
            0,
            0,
            this.paperButterflyDreamSpriteDpr,
            0,
            0
        );
        c.translate(logicalSize * 0.5, logicalSize * 0.5);

        if (kind === "spirit-light") {
            const glow = c.createRadialGradient(
                0,
                0,
                0,
                0,
                0,
                logicalSize * 0.44
            );
            glow.addColorStop(
                0,
                this.getPaperButterflyDreamColor(colorIndex, 0.86)
            );
            glow.addColorStop(
                0.24,
                this.getPaperButterflyDreamColor(colorIndex, 0.34)
            );
            glow.addColorStop(
                1,
                this.getPaperButterflyDreamColor(colorIndex, 0)
            );
            c.fillStyle = glow;
            c.fillRect(
                -logicalSize * 0.5,
                -logicalSize * 0.5,
                logicalSize,
                logicalSize
            );
            c.fillStyle = "rgba(236, 254, 255, 0.74)";
            c.beginPath();
            c.arc(0, 0, Math.max(1, size * 0.2), 0, Math.PI * 2);
            c.fill();
            return canvas;
        }

        c.fillStyle = this.getPaperButterflyDreamColor(colorIndex, 0.82);
        c.strokeStyle =
            variant === 1
                ? "rgba(254, 202, 202, 0.42)"
                : "rgba(253, 230, 138, 0.34)";
        c.lineWidth = Math.max(0.65, size * 0.07);
        c.shadowColor = this.getPaperButterflyDreamColor(colorIndex, 0.28);
        c.shadowBlur = 3 + size * 0.5;

        c.beginPath();
        c.moveTo(0, 0);
        c.bezierCurveTo(
            -size * 0.48,
            -size * 0.86,
            -size * 1.18,
            -size * 0.65,
            -size * 1.26,
            size * 0.06
        );
        c.bezierCurveTo(
            -size * 0.88,
            size * 0.7,
            -size * 0.34,
            size * 0.54,
            0,
            size * 0.12
        );
        c.bezierCurveTo(
            size * 0.34,
            size * 0.54,
            size * 0.88,
            size * 0.7,
            size * 1.26,
            size * 0.06
        );
        c.bezierCurveTo(
            size * 1.18,
            -size * 0.65,
            size * 0.48,
            -size * 0.86,
            0,
            0
        );
        c.fill();
        c.stroke();

        c.fillStyle = "rgba(69, 10, 10, 0.72)";
        c.fillRect(
            -size * 0.08,
            -size * 0.34,
            size * 0.16,
            size * 0.76
        );

        return canvas;
    }

    private getPaperButterflyDreamCenterCalm(p: Particle) {
        const normalizedX =
            Math.abs(p.x - this.width * 0.5) /
            Math.max(this.width * 0.5, 1);
        const normalizedY =
            Math.abs(p.y - this.height * 0.48) /
            Math.max(this.height * 0.5, 1);

        return 0.58 +
            this.clamp(
                Math.max(normalizedX, normalizedY * 0.72),
                0,
                1
            ) * 0.42;
    }

    private getPaperButterflyDreamColor(
        colorIndex: number,
        alpha: number
    ) {
        const [red, green, blue] =
            paperButterflyDreamColors[
                colorIndex % paperButterflyDreamColors.length
            ];

        return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
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

        const kind: AmitabhaParticleKind =
            p.kind === "glyph" || p.kind === "lotus"
                ? p.kind
                : "light";
        const sprite = this.createAmitabhaParticleSprite(
            kind,
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



    private resetMidAutumnRenderStates() {
        const keys: Array<keyof MidAutumnRenderState> = [
            "moonGlow",
            "moonBrightness",
            "moonScale",
            "dustBoost",
            "fireflyBoost",
            "breeze",
            "lanternSwayBoost",
            "gatheringGlow",
            "paperGlow",
        ];

        for (const key of keys) {
            this.midAutumnRenderState[key] = 0;
            this.midAutumnTargetState[key] = 0;
        }
    }

    private randomMidAutumnEventDelay() {
        const baseInterval = 30;
        return baseInterval * (0.85 + this.random() * 0.3);
    }

    private rebuildMidAutumnLanterns() {
        const presets = this.width < 650
            ? [
                [0.08, 0.29, 0.82, 0],
                [0.91, 0.72, 0.66, 1],
            ]
            : [
                [0.07, 0.24, 0.90, 0],
                [0.92, 0.28, 0.72, 1],
                [0.14, 0.74, 0.63, 2],
                [0.86, 0.73, 0.82, 0],
            ];

        this.midAutumnLanterns = presets.map(
            ([xRatio, yRatio, scale, tone], index) => ({
                xRatio,
                yRatio,
                scale,
                tone,
                index,
                phase: this.random() * Math.PI * 2,
                baseDuration: 5.3 + this.random() * 2.3,
            })
        );
    }

    private createMidAutumnParticle(
        depth: number,
        index: number,
        total: number,
        forcedKind?: MidAutumnParticleKind,
        temporary = false
    ): Particle {
        const normalized = index / Math.max(1, total);
        const kind: MidAutumnParticleKind = forcedKind ??
            (normalized < 0.39
                ? "firefly"
                : normalized < 0.73
                    ? "lantern-dust"
                    : normalized < 0.87
                        ? "paper-fragment"
                        : "tiny-star");

        const x = this.random() * this.width;
        const y = kind === "tiny-star"
            ? 12 + this.random() * this.height * 0.57
            : kind === "firefly"
                ? this.height * 0.25 + this.random() * this.height * 0.63
                : this.random() * this.height;

        const base: Particle = {
            originX: x,
            originY: y,
            x,
            y,
            vx: 0,
            vy: 0,
            size: 1,
            length: 0,
            alpha: 0.3,
            rotation: this.random() * Math.PI * 2,
            rotationSpeed: 0,
            wobble: this.random() * Math.PI * 2,
            wobbleSpeed: 0.4 + this.random() * 0.5,
            flutter: this.random() * Math.PI * 2,
            flutterSpeed: 0.4 + this.random() * 0.6,
            depth,
            kind,
            baseAlpha: 0.3,
            temporary,
            age: 0,
            life: temporary ? 7 + this.random() * 3.5 : undefined,
            attraction: temporary ? 0.15 + this.random() * 0.35 : 0,
        };

        if (kind === "firefly") {
            const baseAlpha = 0.24 + this.random() * 0.4;
            return {
                ...base,
                vx: (this.random() - 0.5) * 8.4,
                vy: (this.random() - 0.5) * 4.8,
                size: (0.85 + this.random() * 1.1) * (0.8 + depth * 0.3),
                alpha: baseAlpha,
                baseAlpha,
            };
        }

        if (kind === "lantern-dust") {
            const baseAlpha = 0.13 + this.random() * 0.23;
            return {
                ...base,
                vx: (this.random() - 0.5) * 3.2,
                vy: -(2 + this.random() * 3.2),
                size: 0.5 + this.random() * 0.9,
                alpha: baseAlpha,
                baseAlpha,
            };
        }

        if (kind === "paper-fragment") {
            const baseAlpha = 0.24 + this.random() * 0.24;
            return {
                ...base,
                vx: 6 + this.random() * 7,
                vy: 1.4 + this.random() * 3.1,
                size: 2.7 + this.random() * 2.7,
                alpha: baseAlpha,
                baseAlpha,
                rotationSpeed: (this.random() - 0.5) * 0.64,
                colorIndex: Math.floor(
                    this.random() * midAutumnPaperColors.length
                ),
            };
        }

        const baseAlpha = 0.16 + this.random() * 0.4;
        return {
            ...base,
            size: 0.45 + this.random() * 0.8,
            alpha: baseAlpha,
            baseAlpha,
            wobbleSpeed: 0.25 + this.random() * 0.45,
        };
    }

    private updateMidAutumnScene(deltaSeconds: number) {
        this.updateMidAutumnLobbyEvent(deltaSeconds);
        this.calculateMidAutumnTargetState();
        this.smoothMidAutumnRenderState(deltaSeconds);
    }

    private updateMidAutumnLobbyEvent(deltaSeconds: number) {
        const state = this.midAutumnLobbyState;

        if (this.midAutumnReducedMotion) {
            state.activeEvent = null;
            return;
        }

        if (!state.activeEvent) {
            state.idleElapsed += deltaSeconds;

            if (state.idleElapsed >= state.nextEventDelay) {
                this.startMidAutumnLobbyEvent();
            }

            return;
        }

        if (state.phase === "event") {
            state.eventElapsed += deltaSeconds;

            if (state.eventElapsed >= state.eventDuration) {
                state.phase = "settle";
                state.settleElapsed = 0;
            }

            return;
        }

        state.settleElapsed += deltaSeconds;

        const settled = Object.values(this.midAutumnRenderState)
            .every(value => Math.abs(value) < 0.012);

        if (state.settleElapsed >= state.settleDuration && settled) {
            state.activeEvent = null;
            state.phase = "event";
            state.eventElapsed = 0;
            state.idleElapsed = 0;
            state.nextEventDelay = this.randomMidAutumnEventDelay();
        }
    }

    private startMidAutumnLobbyEvent() {
        const state = this.midAutumnLobbyState;
        const candidates = midAutumnLobbyEventWeights.filter(
            ([event]) => event !== state.previousEvent
        );
        const totalWeight = candidates.reduce(
            (sum, [, weight]) => sum + weight,
            0
        );
        let cursor = this.random() * totalWeight;
        let selected = candidates[0][0];

        for (const [event, weight] of candidates) {
            cursor -= weight;
            if (cursor <= 0) {
                selected = event;
                break;
            }
        }

        const [minDuration, maxDuration] =
            midAutumnLobbyEventDurations[selected];

        state.activeEvent = selected;
        state.previousEvent = selected;
        state.phase = "event";
        state.eventElapsed = 0;
        state.eventDuration =
            minDuration + this.random() * (maxDuration - minDuration);
        state.settleElapsed = 0;
        state.direction = this.random() < 0.5 ? -1 : 1;

        this.spawnMidAutumnEventParticles(selected);
    }

    private spawnMidAutumnEventParticles(event: MidAutumnLobbyEvent) {
        if (event === "firefly-bloom") {
            const count = this.width < 650 ? 8 : 18;
            for (let i = 0; i < count; i++) {
                const p = this.createMidAutumnParticle(
                    this.random(),
                    i,
                    count,
                    "firefly",
                    true
                );
                p.size *= 1.08 + this.random() * 0.28;
                p.life = 7.2 + this.random() * 3.3;
                this.midAutumnTemporaryParticles.push(p);
            }
            return;
        }

        if (event === "golden-breeze") {
            const count = this.width < 650 ? 18 : 34;
            for (let i = 0; i < count; i++) {
                const p = this.createMidAutumnParticle(
                    this.random(),
                    i,
                    count,
                    "lantern-dust",
                    true
                );
                p.x = this.midAutumnLobbyState.direction > 0
                    ? -10 - this.random() * 90
                    : this.width + 10 + this.random() * 90;
                p.life = 5.5 + this.random() * 2.7;
                p.size *= 1 + this.random() * 0.35;
                this.midAutumnTemporaryParticles.push(p);
            }
            return;
        }

        if (event === "paper-wish") {
            const count = this.width < 650 ? 6 : 11;
            for (let i = 0; i < count; i++) {
                const p = this.createMidAutumnParticle(
                    this.random(),
                    i,
                    count,
                    "paper-fragment",
                    true
                );
                const fromLeft = this.midAutumnLobbyState.direction > 0;
                p.x = fromLeft
                    ? -15 - this.random() * 65
                    : this.width + 15 + this.random() * 65;
                p.vx = fromLeft
                    ? 10 + this.random() * 8
                    : -(10 + this.random() * 8);
                p.life = 7.4 + this.random() * 3.4;
                this.midAutumnTemporaryParticles.push(p);
            }
            return;
        }

        if (event === "lantern-gathering") {
            const count = this.width < 650 ? 10 : 18;
            for (let i = 0; i < count; i++) {
                const p = this.createMidAutumnParticle(
                    this.random(),
                    i,
                    count,
                    "lantern-dust",
                    true
                );
                p.life = 6.5 + this.random() * 2.3;
                p.size *= 1 + this.random() * 0.28;
                this.midAutumnTemporaryParticles.push(p);
            }
        }
    }

    private calculateMidAutumnTargetState() {
        const target = this.midAutumnTargetState;
        const keys = Object.keys(target) as Array<keyof MidAutumnRenderState>;
        for (const key of keys)
            target[key] = 0;

        const state = this.midAutumnLobbyState;
        if (!state.activeEvent || state.phase !== "event")
            return;

        const progress = this.clamp(
            state.eventElapsed / Math.max(0.001, state.eventDuration),
            0,
            1
        );
        const pulse = (start: number, peak: number, end: number) => {
            if (progress <= start || progress >= end)
                return 0;
            if (progress < peak)
                return this.smoothStep(start, peak, progress);
            return 1 - this.smoothStep(peak, end, progress);
        };

        switch (state.activeEvent) {
            case "moon-radiance": {
                const strength = pulse(0.02, 0.42, 0.96);
                target.moonGlow = strength;
                target.moonBrightness = strength;
                target.moonScale = strength;
                target.dustBoost = strength * 0.8;
                break;
            }
            case "lantern-ripple":
                target.lanternSwayBoost = pulse(0.02, 0.5, 0.96) * 0.75;
                break;
            case "firefly-bloom": {
                const strength = pulse(0.02, 0.48, 0.98);
                target.fireflyBoost = strength;
                target.dustBoost = strength * 0.24;
                break;
            }
            case "golden-breeze": {
                const strength = pulse(0.02, 0.44, 0.96);
                target.breeze = strength * state.direction;
                target.dustBoost = strength * 0.65;
                target.lanternSwayBoost = strength * 0.72;
                break;
            }
            case "paper-wish": {
                const strength = pulse(0.02, 0.5, 0.97);
                target.paperGlow = strength;
                target.breeze = strength * state.direction * 0.34;
                break;
            }
            case "lantern-gathering": {
                const strength = pulse(0.02, 0.52, 0.98);
                target.gatheringGlow = strength;
                target.dustBoost = strength * 0.52;
                target.lanternSwayBoost = strength * 0.28;
                break;
            }
            case "moon-cloud-reveal": {
                const strength = pulse(0.05, 0.72, 0.98);
                target.moonGlow = strength * 0.36;
                target.moonBrightness = strength * 0.22;
                break;
            }
        }
    }

    private smoothMidAutumnRenderState(deltaSeconds: number) {
        const smoothing = 1 - Math.exp(-4 * deltaSeconds);
        const keys = Object.keys(this.midAutumnRenderState) as Array<
            keyof MidAutumnRenderState
        >;

        for (const key of keys) {
            this.midAutumnRenderState[key] = this.lerp(
                this.midAutumnRenderState[key],
                this.midAutumnTargetState[key],
                smoothing
            );

            if (
                Math.abs(this.midAutumnRenderState[key]) < 0.0005 &&
                Math.abs(this.midAutumnTargetState[key]) < 0.0005
            ) {
                this.midAutumnRenderState[key] = 0;
            }
        }
    }

    private updateMidAutumnParticle(p: Particle, deltaSeconds: number) {
        const eventWind = this.midAutumnRenderState.breeze * 11.5;
        const totalWind = this.wind + eventWind;

        if (p.kind === "firefly") {
            const slow =
                0.38 +
                0.62 *
                    (0.5 + 0.5 * Math.sin(this.timer * 0.42 + p.wobble));
            let attractionX = 0;
            let attractionY = 0;

            if (
                p.temporary &&
                this.midAutumnLobbyState.activeEvent === "firefly-bloom"
            ) {
                const targetX = this.width * 0.72;
                const targetY = this.height * 0.28;
                attractionX =
                    (targetX - p.x) * 0.0016 * (p.attraction ?? 0.25);
                attractionY =
                    (targetY - p.y) * 0.0014 * (p.attraction ?? 0.25);
            }

            p.x +=
                (
                    p.vx +
                    Math.sin(this.timer * p.wobbleSpeed + p.wobble) * 2.8 +
                    totalWind * 0.11 +
                    attractionX
                ) * deltaSeconds * slow;
            p.y +=
                (
                    p.vy +
                    Math.cos(this.timer * 0.56 + p.flutter) * 1.8 +
                    attractionY
                ) * deltaSeconds * slow;
        } else if (p.kind === "lantern-dust") {
            p.x +=
                (
                    p.vx +
                    Math.sin(this.timer * 0.5 + p.wobble) * 1.9 +
                    totalWind * 0.07
                ) * deltaSeconds;
            p.y += p.vy * deltaSeconds;
        } else if (p.kind === "paper-fragment") {
            p.x +=
                (
                    p.vx +
                    Math.sin(this.timer * 0.47 + p.wobble) * 4.3 +
                    totalWind * 0.42
                ) * deltaSeconds;
            p.y +=
                (
                    p.vy +
                    Math.sin(this.timer * 0.32 + p.flutter) * 1.1
                ) * deltaSeconds;
            p.rotation += p.rotationSpeed * deltaSeconds;
        }

        const margin = 72;
        if (p.x < -margin) p.x = this.width + margin;
        if (p.x > this.width + margin) p.x = -margin;
        if (p.y < -margin) p.y = this.height + margin;
        if (p.y > this.height + margin) p.y = -margin;
    }

    private updateMidAutumnTemporaryParticles(deltaSeconds: number) {
        for (let i = this.midAutumnTemporaryParticles.length - 1; i >= 0; i--) {
            const p = this.midAutumnTemporaryParticles[i];
            p.age = (p.age ?? 0) + deltaSeconds;
            this.updateMidAutumnParticle(p, deltaSeconds);

            if (p.life !== undefined && p.age >= p.life) {
                this.midAutumnTemporaryParticles.splice(i, 1);
            }
        }
    }

    private getMidAutumnParticleLifeAlpha(p: Particle) {
        if (!p.temporary || p.life === undefined)
            return 1;

        const age = p.age ?? 0;
        const fadeIn = this.smoothStep(0, 0.9, age);
        const fadeOut = 1 - this.smoothStep(
            Math.max(0, p.life - 1.7),
            p.life,
            age
        );
        return fadeIn * fadeOut;
    }

    private drawMidAutumnBackground() {
        const c = this.ctx;
        const sky = c.createLinearGradient(0, 0, 0, this.height);
        sky.addColorStop(0, "#061226");
        sky.addColorStop(0.44, "#0b1e39");
        sky.addColorStop(0.74, "#142b46");
        sky.addColorStop(1, "#182c3e");
        c.fillStyle = sky;
        c.fillRect(0, 0, this.width, this.height);

        const moonX = this.width * 0.72;
        const moonY = this.height * 0.22;
        const moonR = this.clamp(
            Math.min(this.width, this.height) * 0.108,
            62,
            118
        );
        const ambient = c.createRadialGradient(
            moonX,
            moonY,
            0,
            moonX,
            moonY,
            Math.max(this.width, this.height) * 0.46
        );
        ambient.addColorStop(0, "rgba(255,220,145,0.10)");
        ambient.addColorStop(0.4, "rgba(255,207,120,0.037)");
        ambient.addColorStop(1, "rgba(255,200,100,0)");
        c.fillStyle = ambient;
        c.fillRect(0, 0, this.width, this.height);

        this.drawMidAutumnAmbientStars();
        this.drawMidAutumnMoonHalo(moonX, moonY, moonR);
        this.drawMidAutumnCloudLayer("back");
        this.drawMidAutumnMoon(moonX, moonY, moonR);
        this.drawMidAutumnCloudLayer("front");
        this.drawMidAutumnMoonCloudReveal(moonX, moonY, moonR);
    }

    private drawMidAutumnAmbientStars() {
        const c = this.ctx;
        const count = this.width < 700 ? 24 : 38;

        for (let i = 0; i < count; i++) {
            const x = this.hash01(i * 7.13 + 1.2) * this.width;
            const y =
                12 +
                this.hash01(i * 11.77 + 4.6) *
                    this.height * 0.57;
            const radius = 0.45 + this.hash01(i * 5.91 + 2.4) * 0.8;
            const baseAlpha = 0.14 + this.hash01(i * 3.27 + 8.1) * 0.38;
            const pulse = this.midAutumnReducedMotion
                ? 1
                : 0.82 +
                    Math.sin(
                        this.timer * (0.25 + this.hash01(i * 9.3) * 0.43) +
                        i
                    ) * 0.18;

            c.fillStyle = `rgba(235,242,255,${baseAlpha * pulse})`;
            c.beginPath();
            c.arc(x, y, radius, 0, Math.PI * 2);
            c.fill();
        }
    }

    private drawMidAutumnMoonHalo(x: number, y: number, radius: number) {
        const breathe = this.midAutumnReducedMotion
            ? 1
            : 1 + Math.sin(this.timer * 0.62) * 0.025;
        const eventScale = 1 + this.midAutumnRenderState.moonGlow * 0.24;
        const haloRadius = radius * 3.4 * breathe * eventScale;
        const halo = this.ctx.createRadialGradient(
            x,
            y,
            radius * 0.28,
            x,
            y,
            haloRadius
        );
        halo.addColorStop(
            0,
            `rgba(255,241,194,${0.16 + this.midAutumnRenderState.moonGlow * 0.075})`
        );
        halo.addColorStop(
            0.38,
            `rgba(255,213,136,${0.066 + this.midAutumnRenderState.moonGlow * 0.035})`
        );
        halo.addColorStop(1, "rgba(255,205,120,0)");
        this.ctx.fillStyle = halo;
        this.ctx.fillRect(
            x - haloRadius,
            y - haloRadius,
            haloRadius * 2,
            haloRadius * 2
        );
    }

    private drawMidAutumnMoon(x: number, y: number, radius: number) {
        const c = this.ctx;
        const breathe = this.midAutumnReducedMotion
            ? 1
            : 1 + Math.sin(this.timer * 0.67 + 0.8) * 0.007;
        const scale = breathe + this.midAutumnRenderState.moonScale * 0.018;
        const boost = this.midAutumnRenderState.moonBrightness;

        c.save();
        c.translate(x, y);
        c.scale(scale, scale);
        const moon = c.createRadialGradient(
            -radius * 0.22,
            -radius * 0.22,
            radius * 0.04,
            0,
            0,
            radius
        );
        moon.addColorStop(0, `rgb(255,${249 + Math.round(boost * 5)},${223 + Math.round(boost * 11)})`);
        moon.addColorStop(0.55, `rgb(255,${232 + Math.round(boost * 5)},${166 + Math.round(boost * 12)})`);
        moon.addColorStop(1, `rgb(239,${202 + Math.round(boost * 6)},${114 + Math.round(boost * 10)})`);
        c.fillStyle = moon;
        c.beginPath();
        c.arc(0, 0, radius, 0, Math.PI * 2);
        c.fill();

        c.globalAlpha = 0.105;
        const craters = [
            [-0.28, -0.2, 0.16],
            [0.18, -0.12, 0.11],
            [0.13, 0.25, 0.18],
            [-0.2, 0.28, 0.08],
            [0.32, 0.13, 0.07],
        ];
        for (const [cx, cy, cr] of craters) {
            const crater = c.createRadialGradient(
                cx * radius,
                cy * radius,
                0,
                cx * radius,
                cy * radius,
                cr * radius
            );
            crater.addColorStop(0, "rgba(100,90,70,.35)");
            crater.addColorStop(1, "rgba(100,90,70,0)");
            c.fillStyle = crater;
            c.beginPath();
            c.arc(cx * radius, cy * radius, cr * radius, 0, Math.PI * 2);
            c.fill();
        }
        c.restore();
    }

    private drawMidAutumnCloudLayer(layer: "back" | "front") {
        const definitions = [
            { y: 0.19, speed: 7, scale: 1.04, alpha: 0.105, phase: 0.12, layer: "front" },
            { y: 0.32, speed: 4.8, scale: 0.8, alpha: 0.078, phase: 0.55, layer: "back" },
            { y: 0.13, speed: 3.2, scale: 0.62, alpha: 0.056, phase: 0.82, layer: "back" },
        ] as const;
        const span = this.width + 560;

        for (const cloud of definitions) {
            if (cloud.layer !== layer)
                continue;
            const x =
                (this.timer * cloud.speed + cloud.phase * span) % span - 280;
            this.drawMidAutumnCloud(
                x,
                this.height * cloud.y,
                cloud.scale,
                cloud.alpha
            );
        }
    }

    private drawMidAutumnCloud(
        x: number,
        y: number,
        scale: number,
        alpha: number
    ) {
        const c = this.ctx;
        c.save();
        c.translate(x, y);
        c.scale(scale, scale);
        c.filter = "blur(8px)";
        const gradient = c.createLinearGradient(0, -54, 0, 58);
        gradient.addColorStop(0, `rgba(215,226,237,${alpha * 0.2})`);
        gradient.addColorStop(0.5, `rgba(180,199,216,${alpha})`);
        gradient.addColorStop(1, "rgba(140,165,190,0)");
        c.fillStyle = gradient;
        const lobes = [
            [-110, 4, 74, 22],
            [-50, -9, 86, 30],
            [16, -4, 104, 33],
            [82, 5, 80, 25],
            [134, 1, 60, 20],
        ];
        for (const [lx, ly, rx, ry] of lobes) {
            c.beginPath();
            c.ellipse(lx, ly, rx, ry, 0, 0, Math.PI * 2);
            c.fill();
        }
        c.filter = "none";
        c.restore();
    }

    private drawMidAutumnMoonCloudReveal(
        moonX: number,
        moonY: number,
        moonR: number
    ) {
        const state = this.midAutumnLobbyState;
        if (
            state.activeEvent !== "moon-cloud-reveal" ||
            state.phase !== "event"
        ) {
            return;
        }

        const progress = this.clamp(
            state.eventElapsed / Math.max(0.001, state.eventDuration),
            0,
            1
        );
        const visibility = progress < 0.48
            ? this.smoothStep(0.03, 0.48, progress)
            : 1 - this.smoothStep(0.48, 0.97, progress);
        if (visibility <= 0.001)
            return;

        const eased = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        const startX = state.direction > 0
            ? moonX - this.width * 0.56
            : moonX + this.width * 0.56;
        const endX = state.direction > 0
            ? moonX + this.width * 0.56
            : moonX - this.width * 0.56;
        const x = this.lerp(startX, endX, eased);
        this.drawMidAutumnCloud(
            x,
            moonY + moonR * 0.05,
            0.88,
            0.11 * visibility
        );

        const distance = Math.abs(x - moonX);
        const nearMoon = 1 - this.clamp(distance / (moonR * 2.6), 0, 1);
        if (nearMoon <= 0)
            return;

        const c = this.ctx;
        c.save();
        c.globalCompositeOperation = "screen";
        const rim = c.createRadialGradient(
            moonX,
            moonY,
            moonR * 0.62,
            moonX,
            moonY,
            moonR * 1.45
        );
        rim.addColorStop(0, `rgba(255,246,210,${nearMoon * 0.035})`);
        rim.addColorStop(1, "rgba(255,246,210,0)");
        c.fillStyle = rim;
        c.fillRect(
            moonX - moonR * 1.5,
            moonY - moonR * 1.5,
            moonR * 3,
            moonR * 3
        );
        c.restore();
    }

    private drawMidAutumnParticle(p: Particle) {
        const c = this.ctx;

        if (p.kind === "tiny-star") {
            const pulse = this.midAutumnReducedMotion
                ? 1
                : 0.82 + Math.sin(this.timer * p.wobbleSpeed + p.wobble) * 0.18;
            c.fillStyle = `rgba(237,244,255,${(p.baseAlpha ?? p.alpha) * pulse})`;
            c.beginPath();
            c.arc(0, 0, p.size, 0, Math.PI * 2);
            c.fill();
            return;
        }

        if (p.kind === "firefly") {
            const pulse =
                0.32 +
                Math.pow(
                    Math.max(0, Math.sin(this.timer * 1.16 + p.flutter)),
                    4
                ) * 0.68;
            const boost = 1 + this.midAutumnRenderState.fireflyBoost * 0.1;
            const alpha = (p.baseAlpha ?? p.alpha) * pulse * boost;
            const glow = c.createRadialGradient(0, 0, 0, 0, 0, p.size * 6.5);
            glow.addColorStop(0, `rgba(255,242,166,${Math.min(0.95, alpha * 1.12)})`);
            glow.addColorStop(0.3, `rgba(255,211,90,${alpha * 0.42})`);
            glow.addColorStop(1, "rgba(255,211,90,0)");
            c.fillStyle = glow;
            c.beginPath();
            c.arc(0, 0, p.size * 6.5, 0, Math.PI * 2);
            c.fill();
            c.fillStyle = `rgba(255,248,195,${Math.min(1, alpha * 1.25)})`;
            c.beginPath();
            c.arc(0, 0, p.size, 0, Math.PI * 2);
            c.fill();
            return;
        }

        if (p.kind === "lantern-dust") {
            const pulse = 0.72 + Math.sin(this.timer * 0.55 + p.wobble) * 0.28;
            const boost = 1 + this.midAutumnRenderState.dustBoost * 0.34;
            const alpha = (p.baseAlpha ?? p.alpha) * pulse * boost;
            c.fillStyle = `rgba(255,205,112,${Math.min(0.78, alpha)})`;
            c.beginPath();
            c.arc(0, 0, p.size, 0, Math.PI * 2);
            c.fill();
            return;
        }

        if (p.kind === "paper-fragment") {
            const color = midAutumnPaperColors[
                (p.colorIndex ?? 0) % midAutumnPaperColors.length
            ];
            c.fillStyle = color;
            c.beginPath();
            c.moveTo(-p.size, -p.size * 0.45);
            c.lineTo(p.size * 0.9, -p.size * 0.28);
            c.lineTo(p.size * 0.62, p.size * 0.64);
            c.lineTo(-p.size * 0.8, p.size * 0.46);
            c.closePath();
            c.fill();
        }
    }

    private drawMidAutumnTemporaryParticles() {
        const c = this.ctx;
        const moonX = this.width * 0.72;
        const moonY = this.height * 0.22;
        const moonR = this.clamp(
            Math.min(this.width, this.height) * 0.108,
            62,
            118
        );

        for (const p of this.midAutumnTemporaryParticles) {
            const lifeAlpha = this.getMidAutumnParticleLifeAlpha(p);
            if (lifeAlpha <= 0.001)
                continue;

            c.save();
            c.translate(p.x, p.y);
            c.rotate(p.rotation);
            c.globalAlpha = lifeAlpha;

            if (p.kind === "firefly") {
                const pulse =
                    0.32 +
                    Math.pow(
                        Math.max(0, Math.sin(this.timer * 1.16 + p.flutter)),
                        4
                    ) * 0.68;
                const alpha =
                    (p.baseAlpha ?? p.alpha) *
                    pulse *
                    (1 + this.midAutumnRenderState.fireflyBoost * 0.48);
                const glow = c.createRadialGradient(0, 0, 0, 0, 0, p.size * 7);
                glow.addColorStop(0, `rgba(255,242,166,${Math.min(0.98, alpha * 1.2)})`);
                glow.addColorStop(0.3, `rgba(255,211,90,${alpha * 0.46})`);
                glow.addColorStop(1, "rgba(255,211,90,0)");
                c.fillStyle = glow;
                c.beginPath();
                c.arc(0, 0, p.size * 7, 0, Math.PI * 2);
                c.fill();
            } else if (p.kind === "lantern-dust") {
                const pulse = 0.72 + Math.sin(this.timer * 0.55 + p.wobble) * 0.28;
                const alpha =
                    (p.baseAlpha ?? p.alpha) *
                    pulse *
                    (1 + this.midAutumnRenderState.dustBoost * 0.85);
                c.fillStyle = `rgba(255,205,112,${Math.min(0.82, alpha)})`;
                c.beginPath();
                c.arc(0, 0, p.size, 0, Math.PI * 2);
                c.fill();
            } else if (p.kind === "paper-fragment") {
                const color = midAutumnPaperColors[
                    (p.colorIndex ?? 0) % midAutumnPaperColors.length
                ];
                const distance = Math.hypot(p.x - moonX, p.y - moonY);
                const moonCatch =
                    1 -
                    this.clamp(
                        (distance - moonR * 0.8) / (moonR * 2.8),
                        0,
                        1
                    );
                c.globalAlpha *=
                    1 + this.midAutumnRenderState.paperGlow * moonCatch * 0.65;
                c.fillStyle = color;
                c.beginPath();
                c.moveTo(-p.size, -p.size * 0.45);
                c.lineTo(p.size * 0.9, -p.size * 0.28);
                c.lineTo(p.size * 0.62, p.size * 0.64);
                c.lineTo(-p.size * 0.8, p.size * 0.46);
                c.closePath();
                c.fill();
            }

            c.restore();
        }
    }

    private drawMidAutumnLanterns() {
        const state = this.midAutumnLobbyState;
        const rippleProgress =
            state.activeEvent === "lantern-ripple" && state.phase === "event"
                ? this.clamp(state.eventElapsed / Math.max(0.001, state.eventDuration), 0, 1)
                : -1;
        const gatheringProgress =
            state.activeEvent === "lantern-gathering" && state.phase === "event"
                ? this.clamp(state.eventElapsed / Math.max(0.001, state.eventDuration), 0, 1)
                : -1;

        for (const lantern of this.midAutumnLanterns) {
            let localGlow = 0;
            let responseSway = 0;

            if (rippleProgress >= 0) {
                const center =
                    0.14 +
                    lantern.index /
                        Math.max(1, this.midAutumnLanterns.length - 1) *
                        0.62;
                localGlow = Math.max(
                    0,
                    1 - Math.abs(rippleProgress - center) / 0.16
                );
                responseSway = localGlow * 0.028;
            }

            if (gatheringProgress >= 0) {
                const sequenceCenter = 0.18 + lantern.index * 0.12;
                const reply = Math.max(
                    0,
                    1 - Math.abs(gatheringProgress - sequenceCenter) / 0.13
                );
                const collective =
                    this.midAutumnRenderState.gatheringGlow *
                    (
                        0.35 +
                        0.65 *
                            (
                                0.5 +
                                0.5 * Math.sin(this.timer * 2.1 - lantern.index * 0.85)
                            )
                    );
                localGlow = Math.max(localGlow, reply * 0.95, collective * 0.6);
            }

            const ambientSway = this.midAutumnReducedMotion
                ? 0
                : Math.sin(
                    this.timer * (Math.PI * 2 / lantern.baseDuration) +
                    lantern.phase
                ) * 0.027;
            const sway =
                ambientSway +
                responseSway +
                this.midAutumnRenderState.lanternSwayBoost *
                    Math.sin(this.timer * 1.65 + lantern.phase) *
                    0.022;
            const size = this.clamp(
                Math.min(this.width, this.height) * 0.092 * lantern.scale,
                34,
                82
            );

            this.drawMidAutumnLantern(
                this.width * lantern.xRatio,
                this.height * lantern.yRatio,
                size,
                sway,
                lantern.tone,
                localGlow
            );
        }
    }

    private drawMidAutumnLantern(
        x: number,
        y: number,
        size: number,
        sway: number,
        tone: number,
        eventGlow: number
    ) {
        const c = this.ctx;
        c.save();
        c.translate(x, y);
        c.rotate(sway);
        c.strokeStyle = "rgba(107,71,43,.44)";
        c.lineWidth = Math.max(1, size * 0.018);
        c.beginPath();
        c.moveTo(0, -size * 1.7);
        c.lineTo(0, -size * 0.74);
        c.stroke();

        const glowStrength =
            0.29 +
            eventGlow * 0.2 +
            this.midAutumnRenderState.gatheringGlow * 0.035;
        const outerGlow = c.createRadialGradient(0, 0, 0, 0, 0, size * 1.45);
        outerGlow.addColorStop(0, `rgba(255,199,96,${glowStrength})`);
        outerGlow.addColorStop(0.42, `rgba(255,126,48,${glowStrength * 0.35})`);
        outerGlow.addColorStop(1, "rgba(255,110,30,0)");
        c.fillStyle = outerGlow;
        c.fillRect(-size * 1.55, -size * 1.55, size * 3.1, size * 3.1);

        const palettes = [
            ["#a52424", "rgba(214,58,47,.74)"],
            ["#a44c20", "rgba(224,111,40,.70)"],
            ["#89661b", "rgba(211,163,53,.68)"],
        ] as const;
        const palette = palettes[tone % palettes.length];
        const points: Array<[number, number]> = [];
        for (let i = 0; i < 10; i++) {
            const radius = i % 2 === 0 ? size : size * 0.44;
            const angle = -Math.PI / 2 + i * Math.PI / 5;
            points.push([
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
            ]);
        }

        c.fillStyle = palette[1];
        c.strokeStyle = palette[0];
        c.lineWidth = Math.max(2, size * 0.042);
        c.beginPath();
        c.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++)
            c.lineTo(points[i][0], points[i][1]);
        c.closePath();
        c.fill();
        c.stroke();

        c.strokeStyle = "rgba(248,203,111,.68)";
        c.lineWidth = Math.max(1, size * 0.018);
        for (let i = 0; i < 5; i++) {
            const angle = -Math.PI / 2 + i * Math.PI * 2 / 5;
            c.beginPath();
            c.moveTo(0, 0);
            c.lineTo(
                Math.cos(angle) * size * 0.9,
                Math.sin(angle) * size * 0.9
            );
            c.stroke();
        }

        const centerGlow = c.createRadialGradient(0, 0, 0, 0, 0, size * 0.62);
        centerGlow.addColorStop(0, `rgba(255,227,132,${0.8 + eventGlow * 0.16})`);
        centerGlow.addColorStop(0.38, "rgba(255,175,65,.36)");
        centerGlow.addColorStop(1, "rgba(255,135,43,0)");
        c.fillStyle = centerGlow;
        c.beginPath();
        c.arc(0, 0, size * 0.62, 0, Math.PI * 2);
        c.fill();

        c.strokeStyle = "rgba(181,48,40,.72)";
        c.beginPath();
        c.moveTo(0, size * 0.65);
        c.lineTo(0, size * 1.18);
        c.stroke();
        for (let i = -2; i <= 2; i++) {
            c.beginPath();
            c.moveTo(0, size * 1.04);
            c.lineTo(i * size * 0.055, size * 1.28);
            c.stroke();
        }
        c.restore();
    }

    private drawMidAutumnVignette() {
        const c = this.ctx;
        const bottom = c.createLinearGradient(
            0,
            this.height * 0.52,
            0,
            this.height
        );
        bottom.addColorStop(0, "rgba(4,9,15,0)");
        bottom.addColorStop(1, "rgba(3,8,13,.27)");
        c.fillStyle = bottom;
        c.fillRect(0, this.height * 0.5, this.width, this.height * 0.5);

        const edge = c.createRadialGradient(
            this.width * 0.5,
            this.height * 0.46,
            Math.min(this.width, this.height) * 0.18,
            this.width * 0.5,
            this.height * 0.46,
            Math.max(this.width, this.height) * 0.72
        );
        edge.addColorStop(0.52, "rgba(0,0,0,0)");
        edge.addColorStop(1, "rgba(0,0,0,.22)");
        c.fillStyle = edge;
        c.fillRect(0, 0, this.width, this.height);
    }

    private smoothStep(
        start: number,
        end: number,
        value: number
    ) {
        const normalized = this.clamp(
            (value - start) / Math.max(0.000001, end - start),
            0,
            1
        );

        return normalized * normalized * (3 - 2 * normalized);
    }

    private lerp(start: number, end: number, amount: number) {
        return start + (end - start) * amount;
    }

    private hash01(value: number) {
        const sine = Math.sin(value * 12.9898 + 78.233) * 43758.5453;
        return sine - Math.floor(sine);
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
