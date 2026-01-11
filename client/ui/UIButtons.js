import { game } from '../controllers/game.js';
import { SPRITE, ICON_SIZE } from '../../shared/Constants.js';
import { Vec } from '../controllers/Vec.js';
import { Button } from './Button.js';
import { UIHelper } from './UIHelper.js';

/**
 * UIButtons manages all button creation, layout, and module-based enabling
 */
export class UIButtons {
    constructor() {
        this.buttons = [];
        this.lastMousePos = null;
        this.#loadButtons();
    }

    #loadButtons() {
        this.buttons.push(new Button('w', undefined, undefined, () => !game.player.docked, ['Move forward']));
        this.buttons.push(new Button('a', undefined, undefined, () => !game.player.docked, ['Turn left']));
        this.buttons.push(new Button('s', undefined, undefined, () => !game.player.docked, ['Move backward']));
        this.buttons.push(new Button('d', undefined, undefined, () => !game.player.docked, ['Turn right']));
        let i = 3;
        const off = ICON_SIZE + 10;
        const border = 2;
        const i2vec = (i) => new Vec(game.canvas.width / 2 - off * i, game.canvas.height - off - border);
        this.buttons.push(new Button('i', i2vec(i++), SPRITE.SHIP, () => !game.player.docked, ['Ship / Inventory', 'Toggle info dialog (I)']));
        this.buttons.push(new Button('p', i2vec(i++), SPRITE.SETTINGS, () => true, ['Menu', 'Open game menu (P)']));
        i = -5;
        this.buttons.push(new Button('4', i2vec(i++), SPRITE.SHIP, () => !game.player.docked && this.#hasModule('drones'), ['Drones', 'Deploy/recall combat drones (4)']));
        this.buttons.push(new Button('3', i2vec(i++), SPRITE.WARP, () => !game.player.docked && this.#hasModule('warp drive'), ['Warp Drive', 'Open warp targets (3)']));
        this.buttons.push(new Button('2', i2vec(i++), SPRITE.MINE, () => !game.player.docked && this.#hasModule('mining laser'), ['Mining Laser', 'Start/stop mining (2)']));
        this.buttons.push(new Button('1', i2vec(i++), SPRITE.FIRE, () => !game.player.docked && this.#hasModule('laser weapon'), ['Weapons', 'Fire primary weapons (1)']));

        this.buttons.find((b) => b.key === 'i').onDraw = () => game.ui.dialogs.drawInfoDialog();
        this.buttons.find((b) => b.key === 'p').onDraw = () => game.ui.dialogs.drawMenuDialog();
        this.buttons.find((b) => b.key === '3').onDraw = () => game.ui.dialogs.drawWarpDialog();
        
        // Buttons 1, 2, 4 are toggle-only (no dialogs) - don't set onDraw so they can be active simultaneously
        
        // TODO: not all the tooltip args here makes sense - some buttons aren't rendered.

        this.buttons.push(new Button('e', undefined, undefined, () => true, ['Dock/Undock']));
        const eButton = this.buttons.find((b) => b.key === 'e');
        const originalEKeyDown = eButton.keyDown.bind(eButton);
        eButton.keyDown = () => {
            originalEKeyDown();
            game.system.handleDocking();
        };
    }

    #hasModule(moduleName) {
        return game.player.ship.modules.some(m => m.name === moduleName);
    }

    draw() {
        this.buttons.forEach((b) => { b.draw() });
        this.#drawDroneProgressBar();
        this.#drawHoverTooltip();
    }

    setMousePos(mousePos) {
        this.lastMousePos = mousePos;
    }

    #drawHoverTooltip() {
        if (!this.lastMousePos) return;
        const hovered = this.buttons.find((b) => this.#isHoveringButton(b, this.lastMousePos));
        if (!hovered || !hovered.tooltip || hovered.tooltip.length === 0) return;
        game.ctx.save();
        UIHelper.drawTooltipLines(this.lastMousePos.x + 14, this.lastMousePos.y - 18, hovered.tooltip);
        game.ctx.restore();
    }

    #drawDroneProgressBar() {
        const droneButton = this.buttons.find((b) => b.key === '4');
        if (!droneButton || !droneButton.pos || !droneButton.show) return;
        
        // Only show progress bar when drones are deployed
        if (game.player.ship.drones.length === 0) return;
        
        const barWidth = 40; // ICON_SIZE
        const barHeight = 4;
        const barX = droneButton.pos.x;
        const barY = droneButton.pos.y - 8; // 8px above the button
        
        // Background
        game.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        game.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Full progress bar (always 100% while drones are active)
        game.ctx.fillStyle = 'rgba(100, 150, 255, 0.9)';
        game.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Border
        game.ctx.strokeStyle = 'rgba(100, 150, 255, 1)';
        game.ctx.lineWidth = 1;
        game.ctx.strokeRect(barX, barY, barWidth, barHeight);
    }

    #isHoveringButton(button, pos) {
        if (!button.pos || !pos) return false;
        if (!button.isEnabled()) return false;
        const centerX = button.pos.x + ICON_SIZE / 2;
        const centerY = button.pos.y + ICON_SIZE / 2;
        const distance = Math.sqrt((pos.x - centerX) ** 2 + (pos.y - centerY) ** 2);
        return distance <= ICON_SIZE / 2 + 2;
    }
}
