import { game } from '../controllers/game.js';
import { Vec } from '../util/Vec.js';
import { UIHelper } from './UIHelper.js';
import { UI_COLORS, UI_FONTS } from '../../shared/Constants.js';

/**
 * UIDialogs manages all dialog UI rendering and interactions: info, menu, warp
 */
export class UIDialogs {
    constructor(dialogWidth, dialogHeight, dialogX, dialogY, inventoryGrid) {
        this.dialogWidth = dialogWidth;
        this.dialogHeight = dialogHeight;
        this.dialogX = dialogX;
        this.dialogY = dialogY;
        this.warpableButtons = []; // Track clickable warpable items
        this.lastMousePos = null; // Track mouse position for hover effects
        this.inventoryGrid = inventoryGrid;
        this.openInfoDialog = false;
        this.openMenuDialog = false;
    }

    drawWarpDialog() {
        UIHelper.drawDialog(this.dialogX, this.dialogY, this.dialogWidth, this.dialogHeight);
        let yOffset = this.dialogY;
        yOffset = UIHelper.drawSectionHeader('Warp to:', this.dialogWidth, yOffset, this.dialogX);

        // Clear warpable buttons for this frame
        this.warpableButtons = [];

        // Draw all warpables as clickable items (except current instance)
        const currentWarpable = game.system.currentInstance?.warpable;

        game.system.warpables.forEach((warpable) => {
            // Skip the warpable we're currently at
            if (warpable === currentWarpable) return;

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

    // TODO: this doens't work - fix checkbox
    drawMenuDialog() {
        this.openMenuDialog = true;
        UIHelper.drawDialog(this.dialogX, this.dialogY, this.dialogWidth, this.dialogHeight);
        let yOffset = this.dialogY;
        yOffset = UIHelper.drawSectionHeader('Menu', this.dialogWidth, yOffset, this.dialogX);
        yOffset += 20;

        // Settings section
        game.ctx.fillStyle = UI_COLORS.TEXT_SECONDARY;
        game.ctx.font = UI_FONTS.SMALL;
        game.ctx.textAlign = 'left';
        game.ctx.fillText('Settings', this.dialogX + 30, yOffset);
        yOffset += 25;

        // Velocity vectors checkbox
        const checkboxSize = 16;
        const checkboxX = this.dialogX + 50;
        const checkboxY = yOffset - 12;
        const isChecked = game.player?.settings?.showVelocityVectors;

        // Store bounds for click detection
        this.velocityVectorCheckbox = {
            x: checkboxX,
            y: checkboxY,
            size: checkboxSize
        };

        // Draw checkbox
        game.ctx.strokeStyle = UI_COLORS.BORDER;
        game.ctx.lineWidth = 1;
        game.ctx.strokeRect(checkboxX, checkboxY, checkboxSize, checkboxSize);

        if (isChecked) {
            game.ctx.fillStyle = UI_COLORS.TEXT_HIGHLIGHT;
            game.ctx.fillRect(checkboxX + 3, checkboxY + 3, checkboxSize - 6, checkboxSize - 6);
        }

        // Draw label
        game.ctx.fillStyle = UI_COLORS.TEXT_PRIMARY;
        game.ctx.fillText('Show Velocity Vectors', checkboxX + checkboxSize + 10, yOffset);
        yOffset += 30;

        game.ctx.fillStyle = UI_COLORS.TEXT_PRIMARY;
        game.ctx.fillText('Exit Now', this.dialogX + 30, yOffset);
    }

    drawInfoDialog() {
        this.openInfoDialog = true;

        // Position dialog at left edge when docked, centered otherwise
        const dialogX = game.player && game.player.docked ? 0 : this.dialogX;

        // Draw extended backdrop covering the entire dialog area
        UIHelper.drawDialog(dialogX, this.dialogY, this.dialogWidth, this.dialogHeight);

        // Create two-column layout
        const columnWidth = (this.dialogWidth - 60) / 2; // Account for padding
        const leftX = dialogX + 15;
        const rightX = leftX + columnWidth + 30;
        const leftSectionOffset = 30;
        let yOffset = this.dialogY + 15;

        // LEFT COLUMN: Pilot info and Equipped modules
        yOffset = UIHelper.drawSectionHeader('Pilot', columnWidth, yOffset, leftX);
        game.ctx.fillStyle = UI_COLORS.TEXT_PRIMARY;
        game.ctx.font = UI_FONTS.MEDIUM;
        game.ctx.fillText(`${game.player.name}`, leftX + leftSectionOffset, yOffset);
        game.ctx.fillStyle = UI_COLORS.TEXT_LIGHT;
        game.ctx.font = UI_FONTS.SMALL;
        game.ctx.fillText(`${game.player.credits} credits`, leftX + leftSectionOffset, yOffset += 18);

        // Draw equipped modules section in left column
        yOffset += 15;
        yOffset = UIHelper.drawSectionHeader('Equipment', columnWidth, yOffset, leftX);
        const equippedYStart = yOffset;
        this.inventoryGrid.drawEquipped(leftX + leftSectionOffset, columnWidth, yOffset);

        // RIGHT COLUMN: Inventory
        let rightYOffset = this.dialogY + 15;

        // Show inventory
        rightYOffset = UIHelper.drawSectionHeader('Inventory', columnWidth, rightYOffset, rightX);
        this.inventoryGrid.drawInventoryOnly(rightX, columnWidth, rightYOffset);

        // Draw dragged item on top
        if (this.inventoryGrid.draggedItem) {
            this.inventoryGrid.drawDraggedItem();
        }
    }

    warpToTarget(target) {
        game.system.setCurrentInstance(target);
        game.player.ship.pos.x = target.pos.x + 30;
        game.player.ship.pos.y = target.pos.y + 30;
        // Close warp dialog after warping
        const warpButton = game.ui.buttons.find((b) => b.key === '3');
        if (warpButton) warpButton.hideUI();
    }

    handleWarpDialogClick(clickPos) {
        // Check if warp dialog is open (check show state, not down state)
        const warpButton = game.ui.buttons.find((b) => b.key === '3');
        if (!warpButton || !warpButton.show) {
            return false;
        }
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
        if (!infoButton || !infoButton.show) return false;

        return this.inventoryGrid.handleMouseDown(clickPos);
    }

    handleInfoDialogMouseUp(clickPos) {
        // Check if info dialog is open
        const infoButton = game.ui.buttons.find((b) => b.key === 'i');
        if (!infoButton || !infoButton.show) return false;

        return this.inventoryGrid.handleMouseUp(clickPos);
    }
}
