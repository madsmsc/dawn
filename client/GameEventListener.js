import { game } from './game.js';
import { MOVE } from '../shared/Constants.js';
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
        if (!game.player || !game.spaceship) return;
        if (event.key === 'q') {
            game.ui.qDown = false;
        } else if (event.key === 'a') {
            game.ui.aDown = false;
        } else if (event.key === 's') {
            game.ui.sDown = false;
        } else if (event.key === '1') {
            game.ui.k1down = false;
        } else if (event.key === '2') {
            game.ui.k2down = false;
        } else if (event.key === '3') {
            game.ui.k3down = false;
        } else if (event.key === 'w') {
            game.ui.wDown = false;
        } else if (event.key === 'e') {
            game.ui.eDown = false;
        } else if (event.key === 'd') {
            game.ui.dDown = false;
        }
    }

    // TODO: don't have to hold down keys
    // set "showMenu" state instead of keyDown state.
    keyDownListener (event) {
        if (!game.player || !game.spaceship) return;
        const selected = game.ui.selectables.find(s => s.selected);
        // MENUS
        if (event.key === 'w') {
            game.ui.wDown = true;
        } else if (event.key === 'e') {
            game.ui.eDown = true;
        } else if (event.key === 'd') {
            game.ui.dDown = true;
        } else if (event.key === 'f') {
            game.system.handleDocking();
        } else if (event.key === 'm' && game.player.docked) {
            game.player.docked.acceptMission();
        } else if (event.key === 'n' && game.player.docked) {
            game.missionManager.activeMissions.find(m => m.canComplete())?.complete();
        } else if (event.key === 'r' && game.ui.k1down) {
            // TODO move this logic somewhere else and add loading bar
            game.system = game.system.connections[0].system;
            new Vec(game.canvas.width / 2, game.canvas.height / 2);
        } else if (event.key === 't' && game.ui.k1down && game.system.connections.length > 1) {
            game.system = game.system.connections[1].system;
            new Vec(game.canvas.width / 2, game.canvas.height / 2);
        }

        if (game.player.docked) return;

        // MOVEMENT
        if (event.key === 'q') {
            if (game.ui.qDown) return;
            game.ui.qDown = true;
        } else if (event.key === 'a') {
            game.ui.aDown = true;
            if (selected) {
                game.spaceship.approach(selected.pos);
            } else {
                // console.log('no asteroid selected');
            }
        } else if (event.key === 's') {
            game.ui.sDown = true;
            if (selected) {
                game.spaceship.orbit(selected.pos);
            } else {
                // console.log('no asteroid selected');
            }
        }

        // MODULES
        if (event.key === '1') {
            game.ui.k1down = true;
        } else if (event.key === '2') {
            game.ui.k2down = true;
        } else if (event.key === '3') {
            game.ui.k3down = true;
        }
    }

    clickListener (event) {
        if (!game.player || !game.spaceship) return;
        const clickPos = game.camera.screenToWorld(event.x, event.y);

        // fly-to
        if (game.ui.qDown) { 
            game.spaceship.approach(clickPos)
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
