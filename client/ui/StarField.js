import { game } from '../game/game.js';
import { Vec } from '../util/Vec.js';

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
        this.debugOutline = true; // move to static outside class? or inside?
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

    #outlineColors = ['green','yellow', 'blue'];

    drawOutline() {
        let i = 0;
        for(const layer in this.layers) {
            if (!layer.pos) { 
                // console.log('no pos for layer '+ layer.name);
                continue;
            }
            game.ctx.lineWidth = 3;
            game.ctx.strokeStyle = this.#outlineColors[i++];
            game.ctx.globalAlpha = 1.0;
            game.ctx.beginPath();
            const x = layer.pos.x;
            const y = layer.pos.y;
            const w = layer.width;
            const h = layer.height;
            game.ctx.moveTo(x-w/2, y-h/2);
            game.ctx.lineTo(x+w/2, y-h/2);
            game.ctx.lineTo(x+w/2, y+h/2);
            game.ctx.lineTo(x-w/2, y+h/2);
            game.ctx.lineTo(x-w/2, y-h/2);
            game.ctx.stroke();
        }
    }

    update(delta) {
        if (game.player.docked) return;
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
        if(this.debugOutline) this.drawOutline()
    }
}