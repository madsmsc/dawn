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
        
        this.#drawHealthCircles(centerX, centerY);
        this.#drawVelocityBar(centerX, centerY);
        this.#drawMiningProgressBar();
        this.#drawLaserCooldownBar();
        this.#drawHoverTooltips(centerX, centerY);
        
        // Reset line width to prevent leaking state
        game.ctx.lineWidth = 1;
    }

    #drawHealthCircles(centerX, centerY) {
        const shieldRadius = 70;
        const hullRadius = 50;
        const shieldPercentage = (game.player.ship.shield / game.player.ship.maxShield) * 100;
        const hullPercentage = (game.player.ship.hull / game.player.ship.maxHull) * 100;

        // Draw shield circle
        this.#drawHealthCircle(shieldRadius, shieldPercentage, 'rgba(30, 60, 120, 0.6)', centerY);

        // Draw hull circle
        this.#drawHealthCircle(hullRadius, hullPercentage, 'rgba(120, 30, 30, 0.6)', centerY);

        // Draw percentages
        UIHelper.drawTexts([`${shieldPercentage.toFixed(0)}%`],
            { x: centerX - 12, y: centerY - 65 }, 15);
        UIHelper.drawTexts([`${hullPercentage.toFixed(0)}%`],
            { x: centerX - 12, y: centerY - 45 }, 15);
    }

    #drawVelocityBar(centerX, centerY) {
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
    }

    #drawMiningProgressBar() {
        if (!game.player.ship.miningTarget || game.player.ship.miningProgress === 0) return;

        const miningBarWidth = 50;
        const miningBarHeight = 8;
        // Position above the mining button (second from right of center)
        const off = 40 + 10; // ICON_SIZE + 10
        const miningBarX = game.canvas.width / 2 - off * -3 - miningBarWidth / 2;
        const miningBarY = game.canvas.height - 80;
        
        // Background
        game.ctx.fillStyle = 'rgba(50, 50, 50, 0.7)';
        game.ctx.fillRect(miningBarX, miningBarY, miningBarWidth, miningBarHeight);
        
        // Bar fill (yellow, filling from left to right)
        const miningFillWidth = miningBarWidth * game.player.ship.miningProgress;
        game.ctx.fillStyle = 'rgba(200, 200, 50, 0.8)';
        game.ctx.fillRect(miningBarX, miningBarY, miningFillWidth, miningBarHeight);
        
        // Border
        game.ctx.strokeStyle = 'rgba(200, 200, 100, 0.8)';
        game.ctx.lineWidth = 1;
        game.ctx.strokeRect(miningBarX, miningBarY, miningBarWidth, miningBarHeight);
    }

    #drawLaserCooldownBar() {
        // Only show when weapon is cooling down (not ready)
        if (game.player.ship.attackCount >= game.player.ship.attackTime) return;
        
        const laserBarWidth = 50;
        const laserBarHeight = 8;
        // Position above the weapons button (third from right of center)
        const off = 40 + 10; // ICON_SIZE + 10
        const laserBarX = game.canvas.width / 2 - off * -2 - laserBarWidth / 2;
        const laserBarY = game.canvas.height - 80;
        
        const laserCooldownPercentage = Math.min(game.player.ship.attackCount / game.player.ship.attackTime, 1);
        
        // Background
        game.ctx.fillStyle = 'rgba(50, 50, 50, 0.7)';
        game.ctx.fillRect(laserBarX, laserBarY, laserBarWidth, laserBarHeight);
        
        // Bar fill (red, filling from left to right)
        const laserFillWidth = laserBarWidth * laserCooldownPercentage;
        game.ctx.fillStyle = 'rgba(255, 80, 80, 0.8)';
        game.ctx.fillRect(laserBarX, laserBarY, laserFillWidth, laserBarHeight);
        
        // Border
        game.ctx.strokeStyle = 'rgba(200, 100, 100, 0.8)';
        game.ctx.lineWidth = 1;
        game.ctx.strokeRect(laserBarX, laserBarY, laserBarWidth, laserBarHeight);
    }

    #drawHoverTooltips(centerX, centerY) {
        if (!this.lastMousePos) return;

        const velBarWidth = 60;
        const velBarHeight = 20;
        const velBarX = centerX - velBarWidth / 2;
        const velBarY = centerY - 15;

        const distToShield = Math.sqrt(
            Math.pow(this.lastMousePos.x - centerX, 2) +
            Math.pow(this.lastMousePos.y - centerY, 2)
        );
        const distToHull = Math.sqrt(
            Math.pow(this.lastMousePos.x - centerX, 2) +
            Math.pow(this.lastMousePos.y - centerY, 2)
        );

        // Check if hovering over velocity bar
        const isOverVelBar = this.lastMousePos.x >= velBarX &&
            this.lastMousePos.x <= velBarX + velBarWidth &&
            this.lastMousePos.y >= velBarY &&
            this.lastMousePos.y <= velBarY + velBarHeight;

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
