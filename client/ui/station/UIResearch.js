import { game } from '../../controllers/game.js';
import { UIHelper } from '../UIHelper.js';
import { Research } from '../../modules/Research.js';
import { UI_COLORS, UI_FONTS, ORE, AFFIX } from '../../../shared/Constants.js';

export class UIResearch {
    constructor(inventoryGrid) {
        this.inventoryGrid = inventoryGrid;
        this.researchSlot = null; // Single slot for item to be modified
        this.researchButtonBounds = {}; // Track research action button click areas
    }

    draw(dialogX, yOffset, dialogWidth, dialogHeight) {
        let y = yOffset;

        // Title
        y = UIHelper.drawCenteredHeader('Research Lab', dialogWidth, y, dialogX);
        const centerX = dialogX + dialogWidth / 2;

        // Info text
        this.#drawText('Drag a module to the research slot', centerX, y, UI_COLORS.TEXT_PRIMARY, UI_FONTS.SMALL);
        y += 25;

        // Draw research slot and description side by side
        const slotX = dialogX + 30;
        const slotY = y;
        const slotSize = 50;
        
        // Store research slot grid for drag/drop
        this.inventoryGrid.researchSlotGrid = {
            x: slotX,
            y: slotY,
            cols: 1,
            rows: 1,
            cellSize: slotSize
        };
        
        // Draw research slot
        game.ctx.fillStyle = UI_COLORS.BG_GRID;
        game.ctx.fillRect(slotX, slotY, slotSize, slotSize);
        game.ctx.strokeStyle = UI_COLORS.BORDER_BRIGHT;
        game.ctx.lineWidth = 2;
        game.ctx.strokeRect(slotX, slotY, slotSize, slotSize);
        
        // Draw item in research slot if present
        if (this.researchSlot) {
            this.inventoryGrid._drawItemInSlot(this.researchSlot, slotX, slotY, slotSize);
        }
        
        // Draw item description on the right side
        const descX = slotX + slotSize + 20;
        const descWidth = dialogWidth - (descX - dialogX) - 30;
        const descY = slotY;
        
        if (this.researchSlot) {
            this.#drawItemDescription(this.researchSlot, descX, descY, descWidth);
        } else {
            game.ctx.fillStyle = UI_COLORS.TEXT_DISABLED;
            game.ctx.font = UI_FONTS.SMALL;
            game.ctx.textAlign = 'left';
            game.ctx.fillText('No item in research slot', descX, descY + 20);
        }
        
        y += slotSize + 30;
        
        // Draw action buttons for all research types
        const buttonWidth = 110;
        const buttonHeight = 35;
        const buttonSpacing = 8;
        const buttonsPerRow = 4;
        const researchTypes = Research.availableResearch();
        
        researchTypes.forEach((research, index) => {
            const row = Math.floor(index / buttonsPerRow);
            const col = index % buttonsPerRow;
            const rowStartX = dialogX + (dialogWidth - (buttonWidth * buttonsPerRow + buttonSpacing * (buttonsPerRow - 1))) / 2;
            const btnX = rowStartX + col * (buttonWidth + buttonSpacing);
            const btnY = y + row * (buttonHeight + buttonSpacing);
            
            // Check if button should be enabled
            const canUse = this.researchSlot && 
                          research.worksOn.includes(this.researchSlot.rarity) &&
                          game.player.credits >= research.cost;
            
            // Store button bounds
            this.researchButtonBounds[research.short] = {
                x: btnX,
                y: btnY,
                width: buttonWidth,
                height: buttonHeight,
                research: research,
                enabled: canUse
            };
            
            // Draw button
            game.ctx.fillStyle = canUse ? 'rgba(50, 150, 50, 0.5)' : UI_COLORS.BUTTON_DISABLED;
            game.ctx.fillRect(btnX, btnY, buttonWidth, buttonHeight);
            game.ctx.strokeStyle = canUse ? UI_COLORS.BUTTON_ENABLED_BORDER : UI_COLORS.BORDER;
            game.ctx.lineWidth = 2;
            game.ctx.strokeRect(btnX, btnY, buttonWidth, buttonHeight);
            
            // Button text
            game.ctx.fillStyle = canUse ? UI_COLORS.TEXT_WHITE : UI_COLORS.TEXT_DISABLED;
            game.ctx.font = UI_FONTS.BUTTON;
            game.ctx.textAlign = 'center';
            game.ctx.fillText(research.name, btnX + buttonWidth / 2, btnY + 15);
            game.ctx.font = UI_FONTS.TINY;
            game.ctx.fillText(`${research.cost} credits`, btnX + buttonWidth / 2, btnY + 27);
        });
        
        // Calculate total height used by buttons
        const totalRows = Math.ceil(researchTypes.length / buttonsPerRow);
        y += totalRows * buttonHeight + (totalRows - 1) * buttonSpacing + 20;
        
        // Draw instructions
        this.#drawText('Select an action to modify the item', centerX, y, UI_COLORS.TEXT_SECONDARY, UI_FONTS.SMALL);
    }

    handleClick(clickPos) {
        // Check if click is on research action buttons
        for (const [key, btn] of Object.entries(this.researchButtonBounds)) {
            if (btn.enabled &&
                clickPos.x >= btn.x && clickPos.x <= btn.x + btn.width &&
                clickPos.y >= btn.y && clickPos.y <= btn.y + btn.height) {
                this.#applyResearch(btn.research);
                return true;
            }
        }
        return false;
    }

    handleMouseDown(clickPos) {
        return this.inventoryGrid.handleMouseDown(clickPos, false, this);
    }

    handleMouseUp(clickPos) {
        return this.inventoryGrid.handleMouseUp(clickPos, this);
    }

    handleMouseMove(mousePos) {
        this.inventoryGrid.handleMouseMove(mousePos);
    }

    #drawText(text, x, y, color, font, align = 'center') {
        game.ctx.fillStyle = color;
        game.ctx.font = font;
        game.ctx.textAlign = align;
        game.ctx.fillText(text, x, y);
    }

    #drawItemDescription(item, x, y, width) {
        game.ctx.fillStyle = UI_COLORS.TEXT_PRIMARY;
        game.ctx.font = UI_FONTS.HEADER;
        game.ctx.textAlign = 'left';
        game.ctx.fillText(item.name, x, y);
        
        let descY = y + 18;
        
        // Rarity
        const rarityNames = ['Simple', 'Modified', 'Complex'];
        const rarityName = item.rarity !== undefined ? rarityNames[item.rarity] : 'Unknown';
        game.ctx.fillStyle = UI_COLORS.TEXT_HIGHLIGHT;
        game.ctx.font = UI_FONTS.SMALL;
        game.ctx.fillText(`Rarity: ${rarityName}`, x, descY);
        descY += 15;
        
        // Prefixes
        if (item.prefixes && item.prefixes.length > 0) {
            game.ctx.fillStyle = UI_COLORS.TEXT_SECONDARY;
            game.ctx.fillText('Prefixes:', x, descY);
            descY += 12;
            item.prefixes.forEach(([affix, tier]) => {
                const affixName = Object.keys(AFFIX).find(key => AFFIX[key] === affix);
                game.ctx.fillStyle = UI_COLORS.TEXT_LIGHT;
                game.ctx.font = UI_FONTS.TINY;
                game.ctx.fillText(`  ${affixName} (Tier ${tier})`, x, descY);
                descY += 11;
            });
            game.ctx.font = UI_FONTS.SMALL;
        }
        
        // Suffixes
        if (item.suffixes && item.suffixes.length > 0) {
            game.ctx.fillStyle = UI_COLORS.TEXT_SECONDARY;
            game.ctx.fillText('Suffixes:', x, descY);
            descY += 12;
            item.suffixes.forEach(([affix, tier]) => {
                const affixName = Object.keys(AFFIX).find(key => AFFIX[key] === affix);
                game.ctx.fillStyle = UI_COLORS.TEXT_LIGHT;
                game.ctx.font = UI_FONTS.TINY;
                game.ctx.fillText(`  ${affixName} (Tier ${tier})`, x, descY);
                descY += 11;
            });
            game.ctx.font = UI_FONTS.SMALL;
        }
    }
    
    #applyResearch(research) {
        if (!this.researchSlot) return;
        
        if (game.player.credits < research.cost) {
            game.ui.messages.addMessage('Not enough credits');
            return;
        }
        
        // Deduct credits
        game.player.credits -= research.cost;
        
        // Apply research to item
        research.apply(this.researchSlot);
        
        game.ui.messages.addMessage(`Applied ${research.name} to ${this.researchSlot.name}`);
    }
}
