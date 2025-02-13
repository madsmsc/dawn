import { game } from './game.js';

export class StarField {
    constructor() {
        this.stars = [];
        const createStarLayer = (count, speed, brightness) => {
            for (let i = 0; i < count; i++) {
                this.stars.push({
                    x: Math.random() * game.canvas.width,
                    y: Math.random() * game.canvas.height,
                    size: Math.random() * 2 + 1,  // Size between 1-3
                    speed,
                    brightness
                });
            }
        };
        createStarLayer(100, 0.1, 0.2),  // Far layer (slow, dim)
        createStarLayer(50, 0.15, 0.4),  // Middle layer
        createStarLayer(25, 0.2, 0.6)   // Close layer (fast, bright)
    }

    update = (delta) => {
        this.stars.forEach(star => {
            // Move stars based on their layer speed
            star.x -= star.speed;
            star.y -= star.speed;
            // Wrap stars around the screen
            if (star.x < 0) star.x = game.canvas.width;
            if (star.x > game.canvas.width) star.x = 0;
            if (star.y < 0) star.y = game.canvas.height;
            if (star.y > game.canvas.height) star.y = 0;
        });
        return this;
    };
    
    draw () {
        if(game.player.docked) return;
        this.stars.forEach(star => {
            game.ctx.beginPath();
            game.ctx.fillStyle = `rgba(${game.system.color}, ${star.brightness})`;
            game.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            game.ctx.fill();
        });
    }
}
