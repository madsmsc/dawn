import { game } from '../../controllers/game.js';
import { UIHelper } from '../UIHelper.js';
import { UI_COLORS, UI_FONTS, ORE } from '../../../shared/Constants.js';

export class UIStashTab {
    constructor(inventoryGrid) {
        this.inventoryGrid = inventoryGrid;
        this.salvageMode = false;
        this.stashButtonBounds = {};
        this.salvageClickStart = null;
        this.salvageButtonClickStart = false;
    }

    draw(dialogX, yOffset, dialogWidth, dialogHeight) {
        let y = yOffset;
        y = UIHelper.drawCenteredHeader('Quantum Stash', dialogWidth, y, dialogX);
        const centerX = dialogX + dialogWidth / 2;
        
        // Info text
        this.#drawText('Shared storage across all stations', centerX, y, UI_COLORS.TEXT_PRIMARY, UI_FONTS.SMALL);
        y += 30;
        
        // Draw buttons
        const buttonWidth = 120;
        const buttonHeight = 30;
        const buttonSpacing = 10;
        const buttonsX = centerX - buttonWidth - buttonSpacing / 2;
        
        // Stash All button
        const stashAllX = buttonsX;
        this.stashButtonBounds.stashAll = { x: stashAllX, y: y, width: buttonWidth, height: buttonHeight };
        game.ctx.fillStyle = 'rgba(50, 150, 50, 0.5)';
        game.ctx.fillRect(stashAllX, y, buttonWidth, buttonHeight);
        game.ctx.strokeStyle = 'rgba(100, 200, 100, 0.8)';
        game.ctx.lineWidth = 2;
        game.ctx.strokeRect(stashAllX, y, buttonWidth, buttonHeight);
        game.ctx.fillStyle = 'white';
        game.ctx.font = 'bold 12px Arial';
        game.ctx.textAlign = 'center';
        game.ctx.fillText('Stash All', stashAllX + buttonWidth / 2, y + buttonHeight / 2 + 4);
        
        // Salvage button
        const salvageX = buttonsX + buttonWidth + buttonSpacing;
        this.stashButtonBounds.salvage = { x: salvageX, y: y, width: buttonWidth, height: buttonHeight };
        const salvageColor = this.salvageMode ? 'rgba(255, 100, 100, 0.7)' : 'rgba(150, 100, 50, 0.5)';
        const salvageBorder = this.salvageMode ? 'rgba(255, 150, 150, 1)' : 'rgba(200, 150, 100, 0.8)';
        game.ctx.fillStyle = salvageColor;
        game.ctx.fillRect(salvageX, y, buttonWidth, buttonHeight);
        game.ctx.strokeStyle = salvageBorder;
        game.ctx.lineWidth = 2;
        game.ctx.strokeRect(salvageX, y, buttonWidth, buttonHeight);
        game.ctx.fillStyle = 'white';
        game.ctx.fillText(this.salvageMode ? 'Salvage: ON' : 'Salvage', salvageX + buttonWidth / 2, y + buttonHeight / 2 + 4);
        
        y += buttonHeight + 20;
        
        // Show salvage instructions when active
        if (this.salvageMode) {
            this.#drawText('Click non-ore items to salvage for credits', centerX, y, UI_COLORS.TEXT_HIGHLIGHT, UI_FONTS.SMALL);
            y += 20;
        }
        
        // Draw quantum stash centered
        const stashX = dialogX + (dialogWidth - 250) / 2;
        this.inventoryGrid.drawStash(stashX, 250, y, this.salvageMode);
        
        // Draw dragged item on top
        if (this.inventoryGrid.draggedItem) {
            this.inventoryGrid.drawDraggedItem();
        }
    }

    handleClick(clickPos) {
        // Check if click is on Stash All button
        if (this.stashButtonBounds.stashAll) {
            const btn = this.stashButtonBounds.stashAll;
            if (clickPos.x >= btn.x && clickPos.x <= btn.x + btn.width &&
                clickPos.y >= btn.y && clickPos.y <= btn.y + btn.height) {
                this.#stashAll();
                return true;
            }
        }
        return false;
    }

    handleMouseDown(clickPos) {
        // Check if click is on Salvage button
        if (this.stashButtonBounds.salvage) {
            const btn = this.stashButtonBounds.salvage;
            if (clickPos.x >= btn.x && clickPos.x <= btn.x + btn.width &&
                clickPos.y >= btn.y && clickPos.y <= btn.y + btn.height) {
                // Track that salvage button was clicked, but don't toggle yet
                this.salvageButtonClickStart = true;
                return true;
            }
        }
        
        // If in salvage mode, handle salvage clicks
        if (this.salvageMode && !this.salvageButtonClickStart) {
            this.salvageClickStart = this.#getSalvageItemIndex(clickPos);
            return this.salvageClickStart !== null;
        }
        
        return this.inventoryGrid.handleMouseDown(clickPos, this.salvageMode);
    }

    handleMouseUp(clickPos) {
        // Check if mouse up is on Salvage button - toggle only if mouse down was also on it
        if (this.stashButtonBounds.salvage && this.salvageButtonClickStart) {
            const btn = this.stashButtonBounds.salvage;
            if (clickPos.x >= btn.x && clickPos.x <= btn.x + btn.width &&
                clickPos.y >= btn.y && clickPos.y <= btn.y + btn.height) {
                this.salvageMode = !this.salvageMode;
                this.salvageClickStart = null;
                this.salvageButtonClickStart = false;
                return true;
            }
            this.salvageButtonClickStart = false;
            return false;
        }
        
        // If in salvage mode and we have a click start, check if mouse up is on same item
        if (this.salvageMode && this.salvageClickStart !== null) {
            const mouseUpIndex = this.#getSalvageItemIndex(clickPos);
            if (mouseUpIndex === this.salvageClickStart) {
                const salvaged = this.#handleSalvageAtIndex(mouseUpIndex);
                this.salvageClickStart = null;
                if (salvaged) return true;
            }
            this.salvageClickStart = null;
            return false;
        }
        
        return this.inventoryGrid.handleMouseUp(clickPos);
    }

    handleMouseMove(mousePos) {
        this.inventoryGrid.handleMouseMove(mousePos);
    }

    #stashAll() {
        const itemsToMove = [...game.player.ship.inventory];
        game.player.ship.inventory = [];
        game.player.quantumStash.push(...itemsToMove);
        game.ui.messages.addMessage(`Stashed ${itemsToMove.length} items`);
    }
    
    #getSalvageItemIndex(clickPos) {
        const stashGrid = this.inventoryGrid.stashGrid;
        const relX = clickPos.x - stashGrid.x;
        const relY = clickPos.y - stashGrid.y;
        
        if (relX < 0 || relY < 0) return null;
        
        const cellSize = this.inventoryGrid.cellSize;
        const cellPadding = this.inventoryGrid.cellPadding;
        const col = Math.floor(relX / (cellSize + cellPadding));
        const row = Math.floor(relY / (cellSize + cellPadding));
        
        if (col >= stashGrid.cols || row >= stashGrid.rows) return null;
        
        const cellX = relX % (cellSize + cellPadding);
        const cellY = relY % (cellSize + cellPadding);
        if (cellX >= cellSize || cellY >= cellSize) return null;
        
        const index = row * stashGrid.cols + col;
        if (index >= game.player.quantumStash.length) return null;
        
        return index;
    }
    
    #handleSalvageAtIndex(index) {
        if (index === null || index >= game.player.quantumStash.length) return false;
        
        const item = game.player.quantumStash[index];
        
        // Check if item is ore
        const oreNames = Object.keys(ORE);
        if (oreNames.includes(item.name)) {
            return false;
        }
        
        // Salvage the item for credits
        const salvageValue = 10 + Math.floor(Math.random() * 20);
        game.player.credits += salvageValue;
        game.player.quantumStash.splice(index, 1);
        game.ui.messages.addMessage(`Salvaged ${item.name} for ${salvageValue} credits`);
        
        return true;
    }

    #drawText(text, x, y, color, font, align = 'center') {
        game.ctx.fillStyle = color;
        game.ctx.font = font;
        game.ctx.textAlign = align;
        game.ctx.fillText(text, x, y);
    }
}
