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
        
        this.#createStarLayer(1000, 0.01, 0.4); // far, slow, dim
        this.#createStarLayer(500, 0.015, 0.5); // middle layer
        this.#createStarLayer(250, 0.02, 0.6);  // close, fast, bright
    }

    #createStarLayer(count, speed, brightness) {
        const stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * game.canvas.width*2,
                y: Math.random() * game.canvas.height*2,
                size: Math.random() * 2 + 1,  // Size between 1-3
                speed,
                brightness
            });
        }
        const canvas = document.createElement('canvas');
        this.layers.push(canvas);
        canvas.width = game.canvas.width*2;
        canvas.height = game.canvas.height*2;
        canvas.pos = Vec.ZERO.clone();
        canvas.speed = speed;
        canvas.name = 'canvas' + count;

        const ctx = canvas.getContext("2d");
        stars.forEach(star => {
            ctx.beginPath();
            ctx.fillStyle = `rgba(${game.system.color}, ${star.brightness})`;
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    update(delta) {
        if (game.player.docked) return;        
        // Check if system color has changed and recreate stars if needed
        // Only regenerate if we had a previous color AND it's different from current
        if (game.system && this.currentSystemColor && game.system.color !== this.currentSystemColor) {
            this.#createStarLayers();
        }
        // Initialize currentSystemColor if not set yet
        else if (game.system && !this.currentSystemColor) {
            this.currentSystemColor = game.system.color;
        }        
        this.layers.forEach((l) => {
            l.pos.addScalar(-l.speed * delta);
            if (l.pos.dist(Vec.ZERO) > game.canvas.width) {
                l.pos.setV(Vec.ZERO)
            }
        });
        return this;
    };

    draw() {
        if (game.player.docked) return;
        this.layers.forEach((l) => {
            game.ctx.drawImage(l, l.pos.x, l.pos.x);
        });
    }
}
