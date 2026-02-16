import { game } from '../../controllers/game.js';
import { UIHelper } from '../UIHelper.js';
import { UI_COLORS, UI_FONTS } from '../../../shared/Constants.js';

export class UIHangarTab {
    draw(dialogX, yOffset, dialogWidth, dialogHeight) {
        let y = yOffset;
        const centerX = dialogX + dialogWidth / 2;
        const ships = game.player.ships || [];
        
        UIHelper.drawCenteredHeader('Hangar - Your Ships', dialogWidth, y, dialogX);
        y += 30;
        if (ships.length === 0) {
            this.drawText('No ships owned.', centerX, y, UI_COLORS.TEXT_DISABLED, UI_FONTS.SMALL);
            return;
        }
        // Draw ships as ASCII tree
        ships.forEach((ship, idx) => {
            const ascii = this.asciiShipTree(ship, 0);
            ascii.forEach((line, i) => {
                this.drawText(line, dialogX + 40, y + i * 16, UI_COLORS.TEXT_PRIMARY, UI_FONTS.TINY, 'left');
            });
            y += ascii.length * 16 + 10;
        });
    }

    asciiShipTree(ship, depth) {
        // Simple ASCII tree: ShipName
        //   |- Module1
        //   |- Module2
        //   |- ...
        let lines = [
            `${'  '.repeat(depth)}- ${ship.name}`
        ];
        if (ship.modules && ship.modules.length) {
            ship.modules.forEach(mod => {
                lines.push(`${'  '.repeat(depth + 1)}|- ${mod.name}`);
            });
        }
        return lines;
    }

    drawText(text, x, y, color, font, align = 'left') {
        game.ctx.fillStyle = color;
        game.ctx.font = font;
        game.ctx.textAlign = align;
        game.ctx.fillText(text, x, y);
    }
}
