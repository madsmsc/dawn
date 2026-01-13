import { game } from './game.js';
import { Vec } from '../util/Vec.js';

export class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
    }

    update() {
        this.x = game.canvas.width / 2 - game.player.ship.pos.x;
        this.y = game.canvas.height / 2 - game.player.ship.pos.y;
    }

    apply() {
        game.ctx.save();
        game.ctx.translate(this.x, this.y);
    }

    restore() {
        game.ctx.restore();
    }

    screenToWorld(screenX, screenY) {
        return new Vec(screenX - this.x, screenY - this.y);
    }
}
