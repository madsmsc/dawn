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
        const centerY = game.canvas.height - 9;
        const shieldRadius = 70;
        const hullRadius = 50;
        const shieldPercentage = (game.player.ship.shield / game.player.ship.maxShield) * 100;
        const hullPercentage = (game.player.ship.hull / game.player.ship.maxHull) * 100;

        // Draw shield circle
        this.#drawHealthCircle(shieldRadius, shieldPercentage, 'rgba(30, 60, 120, 0.6)', centerY);

        // Draw hull circle
        this.#drawHealthCircle(hullRadius, hullPercentage, 'rgba(120, 30, 30, 0.6)', centerY);

        // Draw velocity bar (horizontal, 80x15px) positioned above HUD
        const barWidth = 60;
        const barHeight = 20;
        const barX = centerX - barWidth / 2;
        const barY = centerY - 15;

        // Background
        game.ctx.fillStyle = 'rgba(50, 50, 50, 0.7)';
        game.ctx.fillRect(barX, barY, barWidth, barHeight);

        // Bar fill (green, filling from left to right)
        const velPercentage = game.player.ship.vel / game.player.ship.maxVel;
        const fillWidth = barWidth * velPercentage;
        game.ctx.fillStyle = 'rgba(30, 150, 30, 0.8)';
        game.ctx.fillRect(barX, barY, fillWidth, barHeight);

        // Velocity text on bar
        UIHelper.drawTexts([game.player.ship.vel.toFixed(1)],
            { x: barX + barWidth / 2 - 8, y: barY + 15 }, 12);
        game.ctx.lineWidth = 1;

        UIHelper.drawTexts([`${shieldPercentage.toFixed(0)}%`],
            { x: game.canvas.width / 2 - 12, y: centerY - 65 }, 15);
        UIHelper.drawTexts([`${hullPercentage.toFixed(0)}%`],
            { x: game.canvas.width / 2 - 12, y: centerY - 45 }, 15);

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
            // Check if hovering over shield circle (outer circle, radius 70 ± 4 for thickness)
            else if (distToShield >= 66 && distToShield <= 74) {
                UIHelper.drawTooltip(
                    this.lastMousePos.x,
                    this.lastMousePos.y - 20,
                    `Shield: ${game.player.ship.shield.toFixed(1)} / ${game.player.ship.maxShield}`
                );
            }
            // Check if hovering over hull circle (inner circle, radius 50 ± 4 for thickness)
            else if (distToHull >= 46 && distToHull <= 54) {
                UIHelper.drawTooltip(
                    this.lastMousePos.x,
                    this.lastMousePos.y - 20,
                    `Hull: ${game.player.ship.hull.toFixed(1)} / ${game.player.ship.maxHull}`
                );
            }
        }
    }

    #drawHealthCircle(radius, percentage, color, centerY) {
        const centerX = game.canvas.width / 2;

        // Background semi-circle (top half, hollow, fat stroke)
        game.ctx.strokeStyle = color;
        game.ctx.lineWidth = 8;
        game.ctx.beginPath();
        game.ctx.arc(centerX, centerY, radius, 0, Math.PI, true);
        game.ctx.stroke();

        // Progress arc (left side shrinks moving right as damage taken, right side fixed at 0)
        game.ctx.strokeStyle = color.replace('0.6', '1');
        game.ctx.lineWidth = 12;
        game.ctx.beginPath();
        game.ctx.arc(centerX, centerY, radius, -(Math.PI * percentage / 100), 0, false);
        game.ctx.stroke();
    }
}
