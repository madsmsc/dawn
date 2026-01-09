import { game } from './game.js';
import { Vec } from './Vec.js';

export class GameEventListener {
    constructor() {
    }

    register() {
        game.canvas.addEventListener('keyup', this.keyUpListener);
        game.canvas.addEventListener('keydown', this.keyDownListener);
        game.canvas.addEventListener('click', this.clickListener);
        game.canvas.addEventListener('mousedown', this.mouseDownListener);
        game.canvas.addEventListener('mouseup', this.mouseUpListener);
        game.canvas.addEventListener('mousemove', this.mouseMoveListener);
    }

    keyUpListener(event) {
        if (!game.player || !game.player.ship) return;
        // If Escape pressed, hide all button UIs
        if (event.key === 'Escape') {
            game.ui.buttons.forEach((b) => { b.hideUI(); });
            return;
        }
        game.ui.buttons.forEach((b) => {
            if (event.key === b.key) b.keyUp();
        });
    }

    keyDownListener(event) {
        if (!game.player || !game.player.ship) return;
        game.ui.buttons.forEach((b) => {
            if (event.key === b.key) b.keyDown();
        });
    }

    clickListener(event) {
        if (!game.player || !game.player.ship) return;
        const screenPos = new Vec(event.x, event.y);
        // Check if click is in warp dialog first
        if (game.ui.handleWarpDialogClick(screenPos)) {
            return; // Click was handled by warp dialog
        }
        // Check if click is on station mission accept button
        if (game.ui.handleStationDialogClick(screenPos)) {
            return; // Click was handled by station dialog
        }
        // pass click position to each button so it can react if clicked
        game.ui.buttons.forEach((b) => {
            b.click(screenPos);
        });

        const clickPos = game.camera.screenToWorld(event.x, event.y);
        // select one selectable
        let select = undefined;
        game.ui.selectables.forEach((selectable) => {
            const dist = clickPos.clone().sub(selectable.pos).length();
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

    mouseMoveListener(event) {
        // Track mouse position for UI hover effects
        if (game.ui) {
            const mousePos = new Vec(event.x, event.y);
            game.ui.lastMousePos = mousePos;
            game.ui.setMousePos(mousePos);
        }
    }

    mouseDownListener(event) {
        if (!game.player || !game.player.ship) return;
        const screenPos = new Vec(event.x, event.y);
        // Check if mousedown is on inventory grid in station dialog
        if (game.player.docked && game.ui.station.currentTab === 'stash') {
            if (game.ui.handleStationDialogClick(screenPos)) {
                return; // Mousedown was handled by station dialog
            }
        }
        // Check if mousedown is on inventory grid in info dialog
        if (game.ui.handleInfoDialogMouseDown(screenPos)) {
            return; // Mousedown was handled by inventory grid
        }
    }

    mouseUpListener(event) {
        if (!game.player || !game.player.ship) return;
        const screenPos = new Vec(event.x, event.y);
        // Check if mouseup is on inventory grid in station dialog
        if (game.player.docked && game.ui.station.currentTab === 'stash') {
            if (game.ui.handleStationDialogMouseUp(screenPos)) {
                return; // Mouseup was handled by station dialog
            }
        }
        // Check if mouseup is on inventory grid in info dialog
        if (game.ui.handleInfoDialogMouseUp(screenPos)) {
            return; // Mouseup was handled by inventory grid
        }
    }
}
