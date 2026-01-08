import { game } from '../controllers/game.js';
import { UIHelper } from './UIHelper.js';

/**
 * HUD manages head-up display rendering: health circles, shields, velocity bar, tooltips
 */
export class HUD {
    constructor() {
        this.lastMousePos = null; // Track mouse position for hover effects
    }

    draw() {
        const centerX = game.canvas.width / 2;
        const centerY = game.canvas.height - 100;
        const shieldRadius = 40;
        const hullRadius = 30;
        const shieldPercentage = (game.player.ship.shield / game.player.ship.maxShield) * 100;
        const hullPercentage = (game.player.ship.hull / game.player.ship.maxHull) * 100;

        // Draw shield circle
        this.#drawHealthCircle(shieldRadius, shieldPercentage, 'rgba(100, 150, 255, 0.6)');

        // Draw hull circle
        this.#drawHealthCircle(hullRadius, hullPercentage, 'rgba(255, 100, 100, 0.6)');

        // Draw velocity bar (30x40px) positioned in lower left of hull circle
        const barWidth = 30;
        const barHeight = 40;
        const barX = centerX - barWidth / 2;
        const barY = centerY - 20;

        // Background
        game.ctx.fillStyle = 'rgba(50, 50, 50, 0.7)';
        game.ctx.fillRect(barX, barY, barWidth, barHeight);

        // Bar fill (green, filling from bottom to top)
        const velPercentage = game.player.ship.vel / game.player.ship.maxVel;
        const fillHeight = barHeight * velPercentage;
        game.ctx.fillStyle = 'rgba(100, 255, 100, 0.8)';
        game.ctx.fillRect(barX, barY + barHeight - fillHeight, barWidth, fillHeight);

        // Bar border
        game.ctx.strokeStyle = 'rgba(150, 150, 150, 0.8)';
        game.ctx.lineWidth = 1;
        game.ctx.strokeRect(barX, barY, barWidth, barHeight);

        UIHelper.drawTexts(['shield', `${shieldPercentage.toFixed(1)}%`],
            { x: game.canvas.width / 2 - 90, y: game.canvas.height - 80 }, 15);
        UIHelper.drawTexts(['hull', `${hullPercentage.toFixed(1)}%`],
            { x: game.canvas.width / 2 + 60, y: game.canvas.height - 80 }, 15);

        // Draw tooltips on hover
        if (this.lastMousePos) {
            const distToShield = Math.sqrt(
                Math.pow(this.lastMousePos.x - centerX, 2) +
                Math.pow(this.lastMousePos.y - centerY, 2)
            );
            const distToHull = Math.sqrt(
                Math.pow(this.lastMousePos.x - centerX, 2) +
                Math.pow(this.lastMousePos.y - centerY, 2)
            );

            // Check if hovering over velocity bar
            const isOverVelBar = this.lastMousePos.x >= barX &&
                this.lastMousePos.x <= barX + barWidth &&
                this.lastMousePos.y >= barY &&
                this.lastMousePos.y <= barY + barHeight;

            if (isOverVelBar) {
                UIHelper.drawTooltip(
                    this.lastMousePos.x,
                    this.lastMousePos.y - 20,
                    `Velocity: ${game.player.ship.vel.toFixed(2)} / ${game.player.ship.maxVel}`
                );
            }
            // Check if hovering over shield circle (outer circle, radius 40 ± 4 for thickness)
            else if (distToShield >= 36 && distToShield <= 44) {
                UIHelper.drawTooltip(
                    this.lastMousePos.x,
                    this.lastMousePos.y - 20,
                    `Shield: ${game.player.ship.shield.toFixed(1)} / ${game.player.ship.maxShield}`
                );
            }
            // Check if hovering over hull circle (inner circle, radius 30 ± 4 for thickness)
            else if (distToHull >= 26 && distToHull <= 34) {
                UIHelper.drawTooltip(
                    this.lastMousePos.x,
                    this.lastMousePos.y - 20,
                    `Hull: ${game.player.ship.hull.toFixed(1)} / ${game.player.ship.maxHull}`
                );
            }
        }
    }

    #drawHealthCircle(radius, percentage, color) {
        const centerX = game.canvas.width / 2;
        const centerY = game.canvas.height - 100;

        // Background circle
        game.ctx.fillStyle = color;
        game.ctx.beginPath();
        game.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        game.ctx.fill();

        // Progress arc (pie slice)
        game.ctx.fillStyle = color.replace('0.6', '1');
        game.ctx.beginPath();
        game.ctx.moveTo(centerX, centerY);
        game.ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * percentage / 100), false);
        game.ctx.lineTo(centerX, centerY);
        game.ctx.fill();
    }
}
