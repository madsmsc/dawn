import { game } from './game.js';
import { Vec } from '../util/Vec.js';

export class StarField {
    constructor() {
        this.layers = [];
        this.currentSystemColor = null; // Track current system color
        this.#createStarLayers();
    }

    #createStarLayers() {
        // Clear existing layers
        this.layers = [];
        this.currentSystemColor = game.system?.color;

        this.#createStarLayer(400, 4, 0.4); // far, slow, dim
        this.#createStarLayer(200, 6, 0.5);  // middle layer
        this.#createStarLayer(100, 8, 0.6);  // close, fast, bright
    }

    #createStarLayer(count, speed, brightness) {
        const stars = [];
        const canvas = document.createElement('canvas');
        canvas.width = game.canvas.width * 4;
        canvas.height = game.canvas.height * 4;
        this.layers.push({
            canvas: canvas,
            pos: new Vec(-game.canvas.width, -game.canvas.height),
            dir: new Vec(-1, -1).normalize().scale(speed)
        });
        const ctx = canvas.getContext("2d");

        // Add scattered stars
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * game.canvas.width * 4,
                y: Math.random() * game.canvas.height * 4,
                size: Math.random() * 2 + 1,
                brightness,
                clustered: false,
                densityFactor: 0.5 // moderate density for scattered stars
            });
        }

        // Add star clusters / galaxies
        const clusterCount = 5; // per layer
        for (let i = 0; i < clusterCount; i++) {
            const cx = Math.random() * game.canvas.width;
            const cy = Math.random() * game.canvas.height;
            const clusterRadius = 100 + Math.random() * 150;

            const starsPerCluster = Math.floor(count / clusterCount);
            for (let j = 0; j < starsPerCluster; j++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * clusterRadius;
                const normRadius = radius / clusterRadius; // 0=center, 1=edge
                stars.push({
                    x: cx + Math.cos(angle) * radius,
                    y: cy + Math.sin(angle) * radius,
                    size: Math.random() * 2 + 1,
                    brightness,
                    clustered: true,
                    densityFactor: 1 - normRadius // stars near center = denser
                });
            }
        }

        // Apply glow to 10% of stars, bias toward dense clusters
        const glowFraction = 0.1;
        const glowCount = Math.floor(stars.length * glowFraction);

        for (let i = 0; i < glowCount; i++) {
            // 80% chance to pick a clustered star
            const pickClustered = Math.random() < 0.8;
            let candidates = pickClustered
                ? stars.filter(s => s.clustered)
                : stars.filter(s => !s.clustered);

            if (candidates.length === 0) candidates = stars; // fallback
            const star = candidates[Math.floor(Math.random() * candidates.length)];

            // color variation
            const baseColor = game.system.color.split(',').map(Number);
            const r = Math.min(255, baseColor[0] + (Math.random() * 50 - 25));
            const g = Math.min(255, baseColor[1] + (Math.random() * 50 - 25));
            const b = Math.min(255, baseColor[2] + (Math.random() * 50 - 25));

            // scale glow size & brightness by densityFactor
            const density = star.densityFactor || 0.5;
            const glowSize = star.size * 3 * (0.8 + density);     // 0.8–1.8 scale
            const alpha = star.brightness * (0.5 + 0.5 * density); // 0.5–1 scale

            const grd = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, glowSize);
            grd.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
            grd.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grd;
            ctx.fillRect(star.x - glowSize, star.y - glowSize, glowSize * 2, glowSize * 2);
        }

        // Render all stars
        stars.forEach(star => {
            ctx.beginPath();
            const baseColor = game.system.color.split(',').map(Number);
            const r = Math.min(255, baseColor[0] + (Math.random() * 50 - 25));
            const g = Math.min(255, baseColor[1] + (Math.random() * 50 - 25));
            const b = Math.min(255, baseColor[2] + (Math.random() * 50 - 25));
            ctx.fillStyle = `rgba(${r},${g},${b},${star.brightness})`;
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    update(delta) {
        if (game.player.docked) return;
        const dt = delta / 1000; // ms to s for physics

        // Check if system color has changed and recreate stars if needed
        // Only regenerate if we had a previous color AND it's different from current
        if (game.system && this.currentSystemColor && game.system.color !== this.currentSystemColor) {
            this.#createStarLayers();
        }
        // Initialize currentSystemColor if not set yet
        else if (game.system && !this.currentSystemColor) {
            this.currentSystemColor = game.system.color;
        }
        this.layers.forEach((layer) => {
            layer.pos.x += layer.dir.x * dt;
            layer.pos.y += layer.dir.y * dt;

            if (layer.pos.x <= -game.canvas.width || layer.pos.y <= -game.canvas.height) {
                layer.pos.setV(Vec.ZERO);
            }
        });
        return this;
    };

    draw() {
        if (game.player.docked) return;
        this.layers.forEach(layer => {
            game.ctx.drawImage(layer.canvas, layer.pos.x, layer.pos.y);
        });
    }
}
