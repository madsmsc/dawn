import { game } from '../controllers/game.js';
import { SPRITE } from '../../shared/Constants.js';
import { Vec } from '../controllers/Vec.js';
import { Button } from './Button.js';

/**
 * UIButtons manages all button creation, layout, and module-based enabling
 */
export class UIButtons {
    constructor() {
        this.buttons = [];
        this.#loadButtons();
    }

    #loadButtons() {
        const off = 50;
        const border = 2;
        let i2vec = (i) => new Vec(border, game.canvas.height - i * off - border);
        let i = 1;
        this.buttons.push(new Button('i', i2vec(i++), SPRITE.SHIP));
        this.buttons.push(new Button('p', i2vec(i++), SPRITE.SETTINGS));
        i = 3;
        i2vec = (i) => new Vec(game.canvas.width / 2 - off * i, game.canvas.height - off - border);
        this.buttons.push(new Button('w', i2vec(i++), SPRITE.UP, () => !game.player.docked));
        this.buttons.push(new Button('a', i2vec(i++), SPRITE.LEFT, () => !game.player.docked));
        this.buttons.push(new Button('s', i2vec(i++), SPRITE.DOWN, () => !game.player.docked));
        this.buttons.push(new Button('d', i2vec(i++), SPRITE.RIGHT, () => !game.player.docked));
        i = -4;
        this.buttons.push(new Button('1', i2vec(i++), SPRITE.FIRE, () => !game.player.docked));
        this.buttons.push(new Button('2', i2vec(i++), SPRITE.MINE, () => !game.player.docked && this.#hasModule('mining laser')));
        this.buttons.push(new Button('3', i2vec(i++), SPRITE.WARP, () => !game.player.docked && this.#hasModule('warp drive')));

        this.buttons.find((b) => b.key === 'i').onDraw = () => game.ui.dialogs.drawInfoDialog();
        this.buttons.find((b) => b.key === 'p').onDraw = () => game.ui.dialogs.drawMenuDialog();
        this.buttons.find((b) => b.key === '3').onDraw = () => game.ui.dialogs.drawWarpDialog();

        this.buttons.push(new Button('e', undefined, undefined));
        this.buttons.find((b) => b.key === 'e').onClick = () => {
            if (game.player.docked) {
                // Complete mission when docked
                game.missionManager.activeMissions.find(m => m.canComplete())?.complete();
            } else {
                // Dock when not docked
                game.system.handleDocking();
            }
        };

        this.buttons.push(new Button('f', undefined, () => game.player.docked));
        this.buttons.find((b) => b.key === 'f').onClick = () => {
            if (game.player.docked) {
                // Accept mission when docked
                game.player.docked.acceptMission();
            }
        };
    }

    #hasModule(moduleName) {
        return game.player.ship.modules.some(m => m.name === moduleName);
    }

    draw() {
        this.buttons.forEach((b) => { b.draw() });
    }
}
