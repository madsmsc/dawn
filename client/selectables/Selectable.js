import { Vec } from '../util/Vec.js';
import { game } from '../controllers/game.js';
import { ICON_SIZE } from '../../shared/Constants.js';

export class Selectable {
    constructor() {
        game.ui.selectables.push(this);
        this.size = ICON_SIZE / 2 + 5;
        this.selected = false;
        this.pos = new Vec(Math.random() * (game.canvas.width - ICON_SIZE) + ICON_SIZE / 2, 
                           Math.random() * (game.canvas.height - ICON_SIZE) + ICON_SIZE / 2);
    }

    draw () {
    }
}
