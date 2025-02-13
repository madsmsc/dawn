import { Vec } from './Vec.js';
import { game } from './game.js';

export class Selectable {
    constructor() {
        game.ui.selectables.push(this);
        this.size = Math.random() * 20 + 30;
        this.selected = false;
        this.pos = new Vec(Math.random() * (game.canvas.width-40) + 20, 
                           Math.random() * (game.canvas.height-40) + 20);
    }

    drawSelection = () => {
        if (this.selected) {
            game.ctx.strokeStyle = 'rgba(80, 255, 80, 0.5)';
            game.ctx.setLineDash([10, 5]);
            game.ctx.fillStyle = 'green';
            game.ctx.strokeStyle = 'green';
            game.ctx.lineWidth = 2;
            const off = 5;
            game.ctx.beginPath();
            game.ctx.moveTo(this.pos.x - this.size - off, this.pos.y - this.size - off);
            game.ctx.lineTo(this.pos.x + this.size + off, this.pos.y - this.size - off);
            game.ctx.lineTo(this.pos.x + this.size + off, this.pos.y + this.size + off);
            game.ctx.lineTo(this.pos.x - this.size - off, this.pos.y + this.size + off);
            game.ctx.lineTo(this.pos.x - this.size - off, this.pos.y - this.size - off);
            game.ctx.stroke();
            game.ctx.setLineDash([]);
        }
    }
}
