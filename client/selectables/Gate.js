import { game } from '../controllers/game.js';
import { Selectable } from './Selectable.js';

export class Gate extends Selectable {
    constructor(name, pos, targetSystem = null) {
        super();
        this.name = name;
        this.pos = pos;
        this.targetSystem = targetSystem; // Reference to the system this gate leads to
        this.size = 20;
    }

    // TODO find gate sprite
    draw() {
        super.draw();
        game.ctx.save();
        game.ctx.translate(this.pos.x, this.pos.y);
        
        // Draw gate as a ring
        game.ctx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
        game.ctx.lineWidth = 3;
        game.ctx.beginPath();
        game.ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        game.ctx.stroke();
        
        // Draw inner glow
        game.ctx.strokeStyle = 'rgba(150, 220, 255, 0.5)';
        game.ctx.lineWidth = 1;
        game.ctx.beginPath();
        game.ctx.arc(0, 0, this.size - 5, 0, Math.PI * 2);
        game.ctx.stroke();
        
        game.ctx.restore();
        
        // Draw gate label
        game.ctx.fillStyle = 'cyan';
        game.ctx.font = '12px Arial';
        game.ctx.textAlign = 'center';
        game.ctx.fillText(this.name, this.pos.x, this.pos.y - this.size - 10);
    }

    update(delta) {
        // todo start particle animation if activated by you or others
        return this;
    }
}
