import { game } from '../controllers/game.js';

export class Particle {
    constructor(x, y, radius, dx, dy, pos) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.dx = dx;
        this.dy = dy;
        this.alpha = 1;
        this.pos = pos;
        this.fadeSpeed = 0.01; // Default fade speed
        this.color = 'green'; // Default color
    }

    draw() {
        game.ctx.save();
        game.ctx.globalAlpha = this.alpha;
        game.ctx.fillStyle = this.color;
        game.ctx.translate(this.pos.x, this.pos.y);
        game.ctx.beginPath();
        game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        game.ctx.fill();
        game.ctx.restore();
    }

    update(delta) {
        this.draw();
        this.alpha -= this.fadeSpeed;
        this.x += this.dx * delta;
        this.y += this.dy * delta;
    }
}
