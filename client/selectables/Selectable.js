import { Vec } from '../util/Vec.js';
import { game } from '../game/game.js';

export class Selectable {
    constructor() {
        game.ui.selectables.push(this);
        this.size = 25;
        this.selected = false;
        this.pos = new Vec(Math.random() * (game.canvas.width-40) + 20, 
                           Math.random() * (game.canvas.height-40) + 20);
    }

    draw () {
        this.drawSelection();
    }

    drawSelection () {
        if (this.selected) {
            game.ctx.strokeStyle = 'rgba(80, 255, 80, 0.5)';
            game.ctx.setLineDash([10, 5]);
            game.ctx.fillStyle = 'green';
            game.ctx.strokeStyle = 'green';
            game.ctx.lineWidth = 2;
            game.ctx.beginPath();
            game.ctx.rect(this.pos.x - this.size*2, this.pos.y - this.size*2, this.size*4, this.size*4)
            game.ctx.stroke();
            game.ctx.setLineDash([]);
        }
    }
}
