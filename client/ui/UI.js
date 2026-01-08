import { game } from '../controllers/game.js';
import { UIHelper } from './UIHelper.js';
import { UIButtons } from './UIButtons.js';
import { UIDialogs } from './UIDialogs.js';
import { UIStation } from './UIStation.js';
import { HUD } from './HUD.js';

/**
 * UI is the main orchestrator for all UI rendering and interaction
 */
export class UI {
    constructor() {
        this.selectables = [];
        this.fpsCount = 0;
        this.fpsTime = 0;
        this.fpsDisplay = 0;
        
        // Dialog and HUD dimensions
        this.dialogWidth = 300;
        this.dialogHeight = 400;
        this.dialogX = game.canvas.width / 2 - this.dialogWidth / 2;
        this.dialogY = game.canvas.height / 2 - this.dialogHeight / 2;
        
        // Last mouse position for hover effects
        this.lastMousePos = null;
        
        // Create specialized UI managers
        const uiButtons = new UIButtons();
        this.buttons = uiButtons.buttons;
        
        this.dialogs = new UIDialogs(this.dialogWidth, this.dialogHeight, this.dialogX, this.dialogY);
        this.station = new UIStation();
        this.hud = new HUD();
    }

    update(delta) {
        this.fpsCount++;
        this.fpsTime += delta;
        if (this.fpsTime >= 1000) {
            this.fpsDisplay = this.fpsCount;
            this.fpsCount = 0;
            this.fpsTime = 0;
        }
        if (this.#showStationUI()) {
            game.missionManager.update(delta);
        }
        return this;
    }

    draw() {
        UIHelper.drawFps();
        this.#demoText();
        if (this.#showLoginUI()) { 
            this.#loginUI(); 
        } else if (this.#showStationUI()) { 
            this.station.draw();
            game.missionManager.draw();
            this.draw();
        } else {
            this.#drawButtons();
            this.#drawHUD();
        }
    }

    #showLoginUI() {
        return !game.player || !game.player.ship;
    }

    #showStationUI() {
        return game.player && game.player.docked;
    }

    #loginUI() {
        const text = (s) => { game.ctx.fillText(s, game.canvas.width / 2, yOffset += 30) };
        game.ctx.fillStyle = 'white';
        game.ctx.font = '30px Arial';
        let yOffset = 100;
        text('Enter your name:');
    }

    #demoText() {
        if (!game.server) {
            game.ctx.fillStyle = 'white';
            game.ctx.font = '12px Arial';
            const text = (s) => { game.ctx.fillText(s, game.canvas.width / 2, yOffset += 15) };
            let yOffset = game.canvas.height - 20;
            text('No server - DEMO');
        }
    }

    #drawButtons() {
        this.buttons.forEach((b) => { b.draw() });
    }

    #drawHUD() {
        // System and station info
        game.ctx.fillStyle = 'white';
        game.ctx.font = 'bold 14px Arial';
        let yOffset = 80;
        game.ctx.fillText('System', 10, yOffset);
        game.ctx.font = '12px Arial';
        game.ctx.fillText(game.system.name, 20, yOffset += 20);
        game.ctx.font = 'bold 14px Arial';
        game.ctx.fillText('Station', 10, yOffset += 30);
        game.ctx.font = '12px Arial';
        game.ctx.fillText(game.system.stations[0].name, 20, yOffset += 20);
        
        if (game.player.docked) return;
        
        // Draw HUD health circles and velocity bar
        this.hud.draw();
    }

    // Public methods for click handling (called from GameEventListener)
    handleWarpDialogClick(clickPos) {
        return this.dialogs.handleWarpDialogClick(clickPos);
    }

    handleStationDialogClick(clickPos) {
        return this.station.handleStationDialogClick(clickPos);
    }
    
    handleInfoDialogMouseDown(clickPos) {
        return this.dialogs.handleInfoDialogMouseDown(clickPos);
    }
    
    handleInfoDialogMouseUp(clickPos) {
        return this.dialogs.handleInfoDialogMouseUp(clickPos);
    }

    // Track mouse position for tooltips and hover effects
    setMousePos(mousePos) {
        this.lastMousePos = mousePos;
        this.dialogs.setMousePos(mousePos);
        this.hud.lastMousePos = mousePos;
    }
}
