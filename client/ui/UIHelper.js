import { game } from '../controllers/game.js';

/**
 * UIHelper provides shared drawing utilities for UI rendering
 */
export class UIHelper {
    static roundedRect(x, y, width, height, radius) {
        game.ctx.beginPath();
        game.ctx.moveTo(x + radius, y);
        game.ctx.lineTo(x + width - radius, y);
        game.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        game.ctx.lineTo(x + width, y + height - radius);
        game.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        game.ctx.lineTo(x + radius, y + height);
        game.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        game.ctx.lineTo(x, y + radius);
        game.ctx.quadraticCurveTo(x, y, x + radius, y);
        game.ctx.closePath();
        game.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        game.ctx.fill();
        game.ctx.strokeStyle = 'rgba(100, 100, 255, 0.5)';
        game.ctx.lineWidth = 2;
        game.ctx.stroke();
    }

    static drawPanel(pos, w, h) {
        game.ctx.setLineDash([]);
        game.ctx.strokeStyle = 'black';
        game.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        game.ctx.fillRect(pos.x, pos.y, w, h);

        game.ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        game.ctx.lineWidth = 2;
        game.ctx.strokeRect(pos.x, pos.y, w, h);
    }

    static drawTexts(texts, pos, off = 30, hor = false, color = 'white') {
        game.ctx.fillStyle = color;
        for (let i = 0; i < texts.length; i++)
            game.ctx.fillText(texts[i], pos.x + (hor ? i * 200 : 0), pos.y + (hor ? 0 : i * off));
    }

    static drawFps() {
        game.ctx.fillStyle = 'white';
        game.ctx.font = '14px Arial';
        game.ctx.fillText(`FPS: ${game.ui.fpsDisplay}`, game.canvas.width - 60, 20);
    }

    static drawTooltip(x, y, text) {
        const padding = 8;
        const fontSize = 12;
        game.ctx.font = `${fontSize}px Arial`;
        const textWidth = game.ctx.measureText(text).width;
        const boxWidth = textWidth + padding * 2;
        const boxHeight = fontSize + padding * 2;

        // Draw dark background
        game.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        game.ctx.fillRect(x - boxWidth / 2, y - boxHeight, boxWidth, boxHeight);

        // Draw blue border
        game.ctx.strokeStyle = 'rgba(100, 150, 255, 0.9)';
        game.ctx.lineWidth = 2;
        game.ctx.strokeRect(x - boxWidth / 2, y - boxHeight, boxWidth, boxHeight);

        // Draw text
        game.ctx.fillStyle = 'white';
        game.ctx.fillText(text, x - textWidth / 2, y - padding);
    }

    static drawSectionHeader(text, width, yOffset, x) {
        yOffset += 20;
        game.ctx.fillStyle = 'white';
        game.ctx.font = 'bold 20px Arial';
        game.ctx.fillText(text, x + 20, yOffset += 20);
        game.ctx.beginPath();
        game.ctx.strokeStyle = 'rgba(100, 100, 255, 0.5)';
        game.ctx.moveTo(x + 10, yOffset += 20);
        game.ctx.lineTo(x + width - 10, yOffset);
        game.ctx.stroke();
        game.ctx.font = '14px Arial';
        return yOffset + 20;
    }

    static drawSectionItems(modules, yOffset, x) {
        modules.forEach((module) => {
            game.ctx.fillStyle = 'rgba(150, 150, 255, 0.8)';
            game.ctx.fillText(`${module.name}`, x + 30, yOffset);
            game.ctx.fillStyle = 'rgba(200, 200, 200, 0.8)';
            const amount = module.amount > 1 ? module.amount.toFixed(2) : module.amount;
            game.ctx.fillText(`${amount} ${module.unit}`, x + 200, yOffset);
            yOffset += 20;
        });
        return yOffset;
    }
}
