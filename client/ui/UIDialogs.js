import { game } from '../controllers/game.js';
import { Vec } from '../controllers/Vec.js';
import { UIHelper } from './UIHelper.js';
import { InventoryGrid } from './InventoryGrid.js';

/**
 * UIDialogs manages all dialog UI rendering and interactions: info, menu, warp
 */
export class UIDialogs {
    constructor(dialogWidth, dialogHeight, dialogX, dialogY) {
        this.dialogWidth = dialogWidth;
        this.dialogHeight = dialogHeight;
        this.dialogX = dialogX;
        this.dialogY = dialogY;
        this.warpableButtons = []; // Track clickable warpable items
        this.lastMousePos = null; // Track mouse position for hover effects
        this.inventoryGrid = new InventoryGrid();
        this.openInfoDialog = false;
        this.openMenuDialog = false;
    }

    drawWarpDialog() {
        UIHelper.roundedRect(this.dialogX, this.dialogY, this.dialogWidth, this.dialogHeight, 10);
        let yOffset = this.dialogY;
        yOffset = UIHelper.drawSectionHeader('Warp to:', this.dialogWidth, yOffset, this.dialogX);
        
        // Clear warpable buttons for this frame
        this.warpableButtons = [];
        
        // Draw all warpables as clickable items
        game.system.warpables.forEach((warpable) => {
            const itemHeight = 60;
            const itemY = yOffset;
            
            // Store clickable area
            this.warpableButtons.push({
                warpable: warpable,
                x: this.dialogX + 20,
                y: itemY,
                width: this.dialogWidth - 40,
                height: itemHeight
            });
            
            // Highlight on hover (check mouse position if available)
            const mousePos = this.lastMousePos;
            let isHovered = false;
            if (mousePos) {
                isHovered = mousePos.x >= this.dialogX + 20 && 
                           mousePos.x <= this.dialogX + this.dialogWidth - 20 &&
                           mousePos.y >= itemY && 
                           mousePos.y <= itemY + itemHeight;
            }
            
            // Draw item background
            game.ctx.fillStyle = isHovered ? 'rgba(100, 150, 255, 0.3)' : 'rgba(50, 50, 100, 0.2)';
            game.ctx.fillRect(this.dialogX + 20, itemY, this.dialogWidth - 40, itemHeight);
            
            // Draw border
            game.ctx.strokeStyle = isHovered ? 'rgba(150, 200, 255, 0.8)' : 'rgba(100, 100, 150, 0.5)';
            game.ctx.lineWidth = 1;
            game.ctx.strokeRect(this.dialogX + 20, itemY, this.dialogWidth - 40, itemHeight);
            
            // Draw warpable info
            game.ctx.fillStyle = 'rgba(200, 200, 255, 0.9)';
            game.ctx.font = 'bold 14px Arial';
            game.ctx.fillText(warpable.name, this.dialogX + 30, itemY + 20);
            
            game.ctx.fillStyle = 'rgba(150, 150, 200, 0.8)';
            game.ctx.font = '12px Arial';
            const dist = game.player.ship.pos.dist(warpable.pos).toFixed(0);
            game.ctx.fillText(`Distance: ${dist}`, this.dialogX + 30, itemY + 40);
            
            yOffset += itemHeight + 10;
        });
    }

    drawMenuDialog() {
        this.openMenuDialog = true;
        UIHelper.roundedRect(this.dialogX, this.dialogY, this.dialogWidth, this.dialogHeight, 10);
        let yOffset = this.dialogY;
        yOffset = UIHelper.drawSectionHeader('Menu', this.dialogWidth, yOffset, this.dialogX);
        yOffset += 20;
        game.ctx.fillStyle = 'rgba(150, 150, 255, 0.8)';
        game.ctx.fillText('Exit Now', this.dialogX + 30, yOffset);
    }

    drawInfoDialog() {
        this.openInfoDialog = true;
        // Draw extended backdrop covering the entire dialog area
        UIHelper.roundedRect(this.dialogX, this.dialogY, this.dialogWidth, this.dialogHeight, 10);
        
        // Create two-column layout
        const columnWidth = (this.dialogWidth - 60) / 2; // Account for padding
        const leftX = this.dialogX + 15;
        const rightX = leftX + columnWidth + 30;
        const leftSectionOffset = 30;
        let yOffset = this.dialogY + 15;
        
        // LEFT COLUMN: Pilot info and Equipped modules
        yOffset = UIHelper.drawSectionHeader('Pilot', columnWidth, yOffset, leftX);
        game.ctx.fillStyle = 'rgba(150, 150, 255, 0.8)';
        game.ctx.font = '14px Arial';
        game.ctx.fillText(`${game.player.name}`, leftX+leftSectionOffset, yOffset);
        game.ctx.fillStyle = 'rgba(200, 200, 200, 0.8)';
        game.ctx.font = '12px Arial';
        game.ctx.fillText(`${game.player.credits} credits`, leftX+leftSectionOffset, yOffset += 18);
        game.ctx.fillText(`${game.player.rep} rep`, leftX+leftSectionOffset, yOffset += 16);
        
        // Draw equipped modules section in left column
        yOffset += 15;
        yOffset = UIHelper.drawSectionHeader('Equipment', columnWidth, yOffset, leftX);
        const equippedYStart = yOffset;
        this.inventoryGrid.drawEquipped(leftX+leftSectionOffset, columnWidth, yOffset);
        
        // RIGHT COLUMN: Inventory (and Quantum Stash if docked side-by-side)
        let rightYOffset = this.dialogY + 15;
        
        if (game.player.docked) {
            // When docked, show inventory and stash side-by-side
            const halfColumnWidth = (columnWidth - 15) / 2;
            
            // Ship Inventory (left half)
            rightYOffset = UIHelper.drawSectionHeader('Ship Inventory', halfColumnWidth, rightYOffset, rightX);
            this.inventoryGrid.drawInventoryOnly(rightX, halfColumnWidth, rightYOffset);
            
            // Quantum Stash (right half)
            const stashX = rightX + halfColumnWidth + 15;
            const stashYOffset = this.dialogY + 15;
            UIHelper.drawSectionHeader('Quantum Stash', halfColumnWidth, stashYOffset, stashX);
            this.inventoryGrid.drawStash(stashX, halfColumnWidth, stashYOffset + 20);
        } else {
            // When not docked, show only inventory
            rightYOffset = UIHelper.drawSectionHeader('Inventory', columnWidth, rightYOffset, rightX);
            this.inventoryGrid.drawInventoryOnly(rightX, columnWidth, rightYOffset);
        }
        
        // Draw dragged item on top
        if (this.inventoryGrid.draggedItem) {
            this.inventoryGrid.drawDraggedItem();
        }
    }

    warpToTarget(target) {
        // If target is a gate, warp to the connected system
        if (target.targetSystem) {
            game.system = target.targetSystem;
            // Position player near the gate entrance in new system
            game.player.ship.pos = target.pos.clone().add(new Vec(50, 50));
        } else {
            // Warp to station or other warpable
            game.player.ship.pos = target.pos.clone().add(new Vec(30, 30));
        }
        // Close warp dialog after warping
        const warpButton = game.ui.buttons.find((b) => b.key === '3');
        if (warpButton) warpButton.hideUI();
    }

    handleWarpDialogClick(clickPos) {
        // Check if warp dialog is open
        const warpButton = game.ui.buttons.find((b) => b.key === '3');
        if (!warpButton || !warpButton.down) return false;
        
        // Check if click is on a warpable item
        for (const btn of this.warpableButtons) {
            if (clickPos.x >= btn.x && clickPos.x <= btn.x + btn.width &&
                clickPos.y >= btn.y && clickPos.y <= btn.y + btn.height) {
                this.warpToTarget(btn.warpable);
                return true;
            }
        }
        return false;
    }

    setMousePos(mousePos) {
        this.lastMousePos = mousePos;
        this.inventoryGrid.handleMouseMove(mousePos);
    }
    
    handleInfoDialogMouseDown(clickPos) {
        // Check if info dialog is open
        const infoButton = game.ui.buttons.find((b) => b.key === 'i');
        if (!infoButton || !infoButton.down) return false;
        
        return this.inventoryGrid.handleMouseDown(clickPos);
    }
    
    handleInfoDialogMouseUp(clickPos) {
        // Check if info dialog is open
        const infoButton = game.ui.buttons.find((b) => b.key === 'i');
        if (!infoButton || !infoButton.down) return false;
        
        return this.inventoryGrid.handleMouseUp(clickPos);
    }
}
    