import { game } from '../controllers/game.js';
import { UI_COLORS, UI_FONTS } from '../../shared/Constants.js';

/**
 * UIHelper provides shared drawing utilities for UI rendering
 */
export class UIHelper {
    static drawDialog(x, y, width, height) {
        // Black background
        game.ctx.fillStyle = UI_COLORS.BG_DARK;
        game.ctx.fillRect(x, y, width, height);

        // Single border
        game.ctx.strokeStyle = UI_COLORS.BORDER;
        game.ctx.lineWidth = 1;
        game.ctx.strokeRect(x, y, width, height);
    }

    static drawMission(x, y, width, height, button = null) {
        // Mission box background
        game.ctx.fillStyle = UI_COLORS.BG_PANEL;
        game.ctx.fillRect(x, y, width, height);

        // Left accent bar
        game.ctx.fillStyle = UI_COLORS.SHIELD_FILL;
        game.ctx.fillRect(x, y, 4, height);

        // Border
        game.ctx.strokeStyle = UI_COLORS.BORDER;
        game.ctx.lineWidth = 2;
        game.ctx.strokeRect(x, y, width, height);

        // Draw button if provided
        if (button) {
            game.ctx.fillStyle = button.enabled ? UI_COLORS.TEXT_REWARD : UI_COLORS.BUTTON_DISABLED;
            game.ctx.fillRect(button.x, button.y, button.width, button.height);
            game.ctx.strokeStyle = button.enabled ? UI_COLORS.BUTTON_ENABLED_BORDER : UI_COLORS.BUTTON_DISABLED;
            game.ctx.lineWidth = 1;
            game.ctx.strokeRect(button.x, button.y, button.width, button.height);
            game.ctx.fillStyle = button.enabled ? UI_COLORS.BORDER_DARK : UI_COLORS.TEXT_DISABLED;
            game.ctx.font = UI_FONTS.BUTTON;
            game.ctx.textAlign = 'center';
            game.ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height / 2 + 5);
        }
    }

    static drawPanel(x, y, width, height) {
        game.ctx.fillStyle = UI_COLORS.BG_DARK;
        game.ctx.fillRect(x, y, width, height);
        game.ctx.strokeStyle = UI_COLORS.BORDER_DARK;
        game.ctx.lineWidth = 2;
        game.ctx.strokeRect(x, y, width, height);
    }

    static drawTexts(texts, pos, off = 30, hor = false, color = 'white') {
        game.ctx.fillStyle = color;
        for (let i = 0; i < texts.length; i++)
            game.ctx.fillText(texts[i], pos.x + (hor ? i * 200 : 0), pos.y + (hor ? 0 : i * off));
    }

    static drawFps() {
        game.ctx.fillStyle = UI_COLORS.TEXT_WHITE;
        game.ctx.font = UI_FONTS.MEDIUM;
        game.ctx.fillText(`fps: ${game.ui.fpsDisplay}, ${game.ui.spareTime}`, game.canvas.width - 200, 20);
    }

    static drawTooltip(x, y, text) {
        const padding = 6;
        const fontSize = 12;
        game.ctx.font = UI_FONTS.SMALL;
        const textWidth = game.ctx.measureText(text).width;
        const boxWidth = textWidth + padding * 2;
        const boxHeight = fontSize + padding * 2;

        // Draw dark background
        game.ctx.fillStyle = UI_COLORS.BG_DARKER;
        game.ctx.fillRect(x - boxWidth / 2, y - boxHeight, boxWidth, boxHeight);

        // Draw border
        game.ctx.strokeStyle = UI_COLORS.BORDER;
        game.ctx.lineWidth = 1;
        game.ctx.strokeRect(x - boxWidth / 2, y - boxHeight, boxWidth, boxHeight);

        // Draw text
        game.ctx.fillStyle = UI_COLORS.TEXT_WHITE;
        game.ctx.fillText(text, x - textWidth / 2, y - padding);
    }

    static drawTooltipLines(x, y, lines) {
        const padding = 6;
        const fontSize = 12;
        const textLines = Array.isArray(lines) ? lines : [String(lines)];
        game.ctx.font = UI_FONTS.SMALL;
        const maxWidth = Math.max(...textLines.map((line) => game.ctx.measureText(line).width));
        const lineHeight = fontSize + 2;
        const boxWidth = maxWidth + padding * 2;
        const boxHeight = textLines.length * lineHeight + padding * 2;
        const boxX = x - boxWidth / 2;
        const boxY = y - boxHeight;

        // Background
        game.ctx.fillStyle = UI_COLORS.BG_DARKER;
        game.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

        // Border
        game.ctx.strokeStyle = UI_COLORS.BORDER;
        game.ctx.lineWidth = 1;
        game.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        // Text
        game.ctx.fillStyle = UI_COLORS.TEXT_WHITE;
        game.ctx.textAlign = 'left';
        game.ctx.textBaseline = 'top';
        textLines.forEach((line, idx) => {
            game.ctx.fillText(line, boxX + padding, boxY + padding + idx * lineHeight);
        });
        game.ctx.textAlign = 'left';
        game.ctx.textBaseline = 'alphabetic';
    }

    static drawSectionHeader(text, width, yOffset, x) {
        yOffset += 12;
        game.ctx.fillStyle = UI_COLORS.TEXT_SECONDARY;
        game.ctx.font = UI_FONTS.HEADER;
        game.ctx.fillText(text, x + 10, yOffset);
        game.ctx.font = UI_FONTS.MEDIUM;
        return yOffset + 8;
    }

    static drawCenteredHeader(text, width, yOffset, x) {
        const centerX = x + width / 2;
        yOffset += 15;
        game.ctx.fillStyle = UI_COLORS.TEXT_PRIMARY;
        game.ctx.font = UI_FONTS.ITEM;
        game.ctx.textAlign = 'center';
        game.ctx.fillText(text, centerX, yOffset);
        game.ctx.font = UI_FONTS.MEDIUM;
        return yOffset + 12;
    }

    static drawProgressBar(x, y, width, height, progress, fillColor, bgColor = 'rgba(0, 0, 0, 0.7)', borderColor = null) {
        // Background
        game.ctx.fillStyle = bgColor;
        game.ctx.fillRect(x, y, width, height);

        // Progress fill
        game.ctx.fillStyle = fillColor;
        game.ctx.fillRect(x, y, width * Math.max(0, Math.min(1, progress)), height);

        // Border
        if (borderColor) {
            game.ctx.strokeStyle = borderColor;
            game.ctx.lineWidth = 1;
            game.ctx.strokeRect(x, y, width, height);
        }
    }

    static drawHealthBars(x, y, shield, maxShield, hull, maxHull, width = 40, height = 4) {
        const barX = x - width / 2;
        const spacing = 6;

        // Shield bar (blue)
        const shieldProgress = maxShield > 0 ? shield / maxShield : 0;
        game.ctx.fillStyle = UI_COLORS.SHIELD_BG;
        game.ctx.fillRect(barX, y, width, height);
        game.ctx.fillStyle = UI_COLORS.SHIELD_FILL;
        game.ctx.fillRect(barX, y, width * shieldProgress, height);

        // Hull bar (red) - below shield bar
        const hullProgress = maxHull > 0 ? hull / maxHull : 0;
        game.ctx.fillStyle = UI_COLORS.HULL_BG;
        game.ctx.fillRect(barX, y + height + spacing, width, height);
        game.ctx.fillStyle = UI_COLORS.HULL_FILL;
        game.ctx.fillRect(barX, y + height + spacing, width * hullProgress, height);
    }
}
