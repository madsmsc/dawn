import { game } from './game.js';
import { Vec } from './Vec.js';

export class GameEventListener {
    constructor() {
    }

    register () {
        game.canvas.addEventListener('keyup', this.keyUpListener);
        game.canvas.addEventListener('keydown', this.keyDownListener);
        game.canvas.addEventListener('click', this.clickListener);
    }

    keyUpListener (event) {
        if (!game.player || !game.player.ship) return;
        game.ui.buttons.forEach((b) => {
            if (event.key === b.key) b.keyUp();
        });
        // TODO: escape key all button keyUp() ?
    }

    keyDownListener (event) {
        if (!game.player || !game.player.ship) return;
        game.ui.buttons.forEach((b) => {
            if (event.key === b.key) b.keyDown();
        });
    }

    clickListener (event) {
        if (!game.player || !game.player.ship) return;
        game.ui.buttons.forEach((b) => {
            if (event.key === b.key) b.click(new Vec(event.x, event.y));
            // TODO or use clickPos below?
        });
        const clickPos = game.camera.screenToWorld(event.x, event.y);
        // fly-to
        if (game.ui.qDown) { 
            game.player.ship.approach(clickPos)
            return;
        }
        // select one selectable
        let select = undefined;
        game.ui.selectables.forEach((selectable) => {
            const dist = clickPos.sub(selectable.pos).length();
            if (dist < selectable.size) {
                select = selectable;
            }
        });
        // de-select all other selectables
        if (select) {
            game.ui.selectables.forEach((selectable) => { selectable.selected = false; });
            select.selected = true;
        }

    }
}
