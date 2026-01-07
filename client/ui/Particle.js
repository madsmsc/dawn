import { game } from '../game/game.js';

export class Particle {
    constructor(x, y, radius, dx, dy, pos) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.dx = dx;
        this.dy = dy;
        this.alpha = 1;
        this.pos = pos;
    }

    draw() {
        game.ctx.save();
        game.ctx.globalAlpha = this.alpha;
        game.ctx.fillStyle = 'green';
        game.ctx.translate(this.pos.x, this.pos.y);
        game.ctx.beginPath();
        game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        game.ctx.fill();
        game.ctx.restore();
    }

    update() {
        this.draw();
        this.alpha -= 0.01;
        this.x += this.dx;
        this.y += this.dy;
    }
}