import { game } from '../../controllers/game.js';
import { UIHelper } from '../UIHelper.js';
import { UI_COLORS, UI_FONTS } from '../../../shared/Constants.js';

export class UIStationTab {
    constructor() {
        this.repairButtonBounds = null;
    }

    draw(dialogX, yOffset, dialogWidth, dialogHeight) {
        let y = yOffset;
        const centerX = dialogX + dialogWidth / 2;

        // Welcome message
        y = UIHelper.drawCenteredHeader(`Docked at ${game.player.docked.name}`, dialogWidth, y, dialogX);
        
        this.#drawText('Welcome, pilot. How can we assist you today?', centerX, y, UI_COLORS.TEXT_PRIMARY, UI_FONTS.SMALL);
        y += 30;

        // Status info
        this.#drawText('Station Services:', centerX, y, UI_COLORS.TEXT_SECONDARY, UI_FONTS.SMALL);
        y += 25;
        
        // Ship status
        const shield = game.player.ship.shield;
        const maxShield = game.player.ship.maxShield;
        const hull = game.player.ship.hull;
        const maxHull = game.player.ship.maxHull;
        const needsRepair = shield < maxShield || hull < maxHull;
        
        this.#drawText(`Ship Status:`, centerX, y, UI_COLORS.TEXT_PRIMARY, UI_FONTS.SMALL);
        y += 20;
        this.#drawText(`Shield: ${shield.toFixed(0)}/${maxShield.toFixed(0)}`, centerX, y, shield < maxShield ? UI_COLORS.TEXT_COST : UI_COLORS.TEXT_SECONDARY, UI_FONTS.SMALL);
        y += 18;
        this.#drawText(`Hull: ${hull.toFixed(0)}/${maxHull.toFixed(0)}`, centerX, y, hull < maxHull ? UI_COLORS.TEXT_COST : UI_COLORS.TEXT_SECONDARY, UI_FONTS.SMALL);
        y += 30;
        
        // Repair button
        if (needsRepair) {
            const repairCost = Math.floor((maxShield - shield) + (maxHull - hull));
            const canAfford = game.player.credits >= repairCost;
            const buttonWidth = 200;
            const buttonHeight = 40;
            const buttonX = centerX - buttonWidth / 2;
            
            this.repairButtonBounds = {
                x: buttonX,
                y: y,
                width: buttonWidth,
                height: buttonHeight,
                cost: repairCost,
                canAfford: canAfford
            };
            
            game.ctx.fillStyle = canAfford ? 'rgba(50, 150, 50, 0.5)' : UI_COLORS.BUTTON_DISABLED;
            game.ctx.fillRect(buttonX, y, buttonWidth, buttonHeight);
            game.ctx.strokeStyle = canAfford ? UI_COLORS.BUTTON_ENABLED_BORDER : UI_COLORS.BORDER;
            game.ctx.lineWidth = 2;
            game.ctx.strokeRect(buttonX, y, buttonWidth, buttonHeight);
            
            game.ctx.fillStyle = canAfford ? UI_COLORS.TEXT_WHITE : UI_COLORS.TEXT_DISABLED;
            game.ctx.font = UI_FONTS.BUTTON;
            game.ctx.textAlign = 'center';
            game.ctx.fillText('Repair Ship', centerX, y + 18);
            game.ctx.font = UI_FONTS.TINY;
            game.ctx.fillText(`Cost: ${repairCost} credits`, centerX, y + 30);
            
            y += buttonHeight + 20;
        } else {
            this.#drawText('Ship is in perfect condition!', centerX, y, UI_COLORS.TEXT_REWARD, UI_FONTS.SMALL);
            y += 30;
        }
        
        // Info
        this.#drawText('Switch tabs to access other station services', centerX, y, UI_COLORS.TEXT_DISABLED, UI_FONTS.SMALL);
    }

    handleClick(clickPos) {
        // Check if click is on repair button
        if (this.repairButtonBounds) {
            const btn = this.repairButtonBounds;
            if (clickPos.x >= btn.x && clickPos.x <= btn.x + btn.width &&
                clickPos.y >= btn.y && clickPos.y <= btn.y + btn.height) {
                if (btn.canAfford) {
                    // Perform repair
                    game.player.credits -= btn.cost;
                    game.player.ship.shield = game.player.ship.maxShield;
                    game.player.ship.hull = game.player.ship.maxHull;
                    return true;
                }
            }
        }
        return false;
    }

    #drawText(text, x, y, color, font, align = 'center') {
        game.ctx.fillStyle = color;
        game.ctx.font = font;
        game.ctx.textAlign = align;
        game.ctx.fillText(text, x, y);
    }
}
