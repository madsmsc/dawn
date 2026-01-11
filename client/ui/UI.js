import { game } from '../controllers/game.js';
import { UIHelper } from './UIHelper.js';
import { UIButtons } from './UIButtons.js';
import { UI_COLORS, UI_FONTS } from '../../shared/Constants.js';
import { UIDialogs } from './UIDialogs.js';
import { UIStation } from './UIStation.js';
import { HUD } from './HUD.js';
import { InventoryGrid } from './InventoryGrid.js';
import { MessageQueue } from './MessageQueue.js';

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
        this.dialogWidth = 500;
        this.dialogHeight = 400;
        this.dialogX = game.canvas.width / 2 - this.dialogWidth / 2;
        this.dialogY = game.canvas.height / 2 - this.dialogHeight / 2;
        
        // Last mouse position for hover effects
        this.lastMousePos = null;
        
        // Shared inventory grid for all UI components
        this.inventoryGrid = new InventoryGrid();
        
        // Message queue for on-screen notifications
        this.messages = new MessageQueue();
        
        // Create specialized UI managers
        const uiButtons = new UIButtons();
        this.uiButtons = uiButtons;
        this.buttons = uiButtons.buttons;
        
        this.dialogs = new UIDialogs(this.dialogWidth, this.dialogHeight, this.dialogX, this.dialogY, this.inventoryGrid);
        this.station = new UIStation(this.inventoryGrid);
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
        if (this.showStationUI()) {
            game.missionManager.update(delta);
        }
        return this;
    }

    draw() {
        UIHelper.drawFps();
        this.#demoText();
        // Reset dialog states each frame
        this.dialogs.openInfoDialog = false;
        this.dialogs.openMenuDialog = false;
        if (this.showLoginUI()) { 
            this.#loginUI(); 
        } else if (this.showStationUI()) { 
            this.station.draw();
            this.#drawButtons(); // Draw buttons so their callbacks execute (e.g., E to undock)
        } else {
            this.#drawButtons();
            this.#drawHUD();
        }
    }

    showLoginUI() {
        return !game.player || !game.player.ship;
    }

    showStationUI() {
        return game.player && game.player.docked;
    }

    #loginUI() {
        const text = (s) => { game.ctx.fillText(s, game.canvas.width / 2, yOffset += 30) };
        game.ctx.fillStyle = UI_COLORS.TEXT_WHITE;
        game.ctx.font = UI_FONTS.LARGE;
        let yOffset = 100;
        text('Logging in...');
    }

    #demoText() {
        if (!game.server || !game.server.isConnected) {
            game.ctx.fillStyle = UI_COLORS.TEXT_WHITE;
            game.ctx.font = UI_FONTS.SMALL;
            const text = (s) => { game.ctx.fillText(s, game.canvas.width / 2, yOffset += 15) };
            let yOffset = 5;
            text('No server - DEMO');
        }
    }

    #drawButtons() {
        this.uiButtons.draw();
    }

    #drawHUD() {
        // System and station info
        game.ctx.fillStyle = UI_COLORS.TEXT_WHITE;
        game.ctx.font = UI_FONTS.HEADER;
        let yOffset = 80;
        game.ctx.fillText('System', 10, yOffset);
        game.ctx.font = UI_FONTS.SMALL;
        game.ctx.fillText(game.system.name, 20, yOffset += 20);
        game.ctx.font = UI_FONTS.HEADER;
        game.ctx.fillText('Station', 10, yOffset += 30);
        game.ctx.font = UI_FONTS.SMALL;
        game.ctx.fillText(game.system.stations[0].name, 20, yOffset += 20);
        
        if (game.player.docked) return;
        
        // Draw HUD health circles and velocity bar
        this.hud.draw();
        
        // Draw on-screen messages
        this.messages.draw();
    }

    // Public methods for click handling (called from GameEventListener)
    handleWarpDialogClick(clickPos) {
        return this.dialogs.handleWarpDialogClick(clickPos);
    }

    handleStationDialogClick(clickPos) {
        return this.station.handleStationDialogClick(clickPos);
    }
    
    handleStationDialogMouseUp(clickPos) {
        return this.station.handleStationDialogMouseUp(clickPos);
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
        this.uiButtons.setMousePos(mousePos);
        this.hud.lastMousePos = mousePos;
        if (game.player && game.player.docked) {
            this.station.setMousePos(mousePos);
        }
    }
    
    update(delta) {
        this.messages.update(delta);
        return this;
    }
}
