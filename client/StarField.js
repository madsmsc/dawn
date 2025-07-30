import { game } from './game.js';
import { Vec } from './Vec.js';

/* TODO
add colored "blotches" as galaxies/nebulae
will need to redraw when flying to new systems because of the colors
  also just for immersion, so backdrop changes.
only use integers, not floats in calls to ctx.arc()
find out how to do performance meassurements.
  some breakdown of which methods use resources.
  need some way to meassure if the "improvements" I make
  actually help or not.
*/
export class StarField {
    constructor() {
        this.layers = [];
        this.#createStarLayer(1000, 0.01, 0.4); // far, slow, dim
        this.#createStarLayer(500, 0.015, 0.5); // middle layer
        this.#createStarLayer(250, 0.02, 0.6);  // close, fast, bright
    }

    #startPos = new Vec(game.canvas.width/2, game.canvas.height/2);

    #createStarLayer(count, speed, brightness) {
        const stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * game.canvas.width,
                y: Math.random() * game.canvas.height,
                size: Math.random() * 2 + 1,  // Size between 1-3
                speed,
                brightness
            });
        }
        const canvas = document.createElement('canvas');
        this.layers.push(canvas);
        canvas.width = game.canvas.width;
        canvas.height = game.canvas.height;
        canvas.pos = this.#startPos.clone();
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
        this.layers.forEach((l) => {
            l.pos.addScalar(-l.speed * delta);
            if (l.pos.dist(this.#startPos) > game.canvas.width) {
                l.pos.setV(this.#startPos)
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