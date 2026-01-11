import { game } from '../controllers/game.js';
import { UIHelper } from './UIHelper.js';
import { UI_COLORS, UI_FONTS } from '../../shared/Constants.js';

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
        this.#drawHealthCircle(shieldRadius, shieldPercentage, UI_COLORS.SHIELD_BG, centerY);

        // Draw hull circle
        this.#drawHealthCircle(hullRadius, hullPercentage, UI_COLORS.HULL_BG, centerY);

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
        game.ctx.fillStyle = UI_COLORS.BG_DARKER;
        game.ctx.fillRect(barX, barY, barWidth, barHeight);

        // Bar fill (green, filling from left to right)
        const velPercentage = game.player.ship.vel / game.player.ship.maxVel;
        const fillWidth = barWidth * velPercentage;
        game.ctx.fillStyle = UI_COLORS.BAR_GREEN;
        game.ctx.fillRect(barX, barY, fillWidth, barHeight);

        // Velocity text on bar
        UIHelper.drawTexts([game.player.ship.vel.toFixed(1)],
            { x: barX + barWidth / 2 - 8, y: barY + 15 }, 12);
    }

    #drawMiningProgressBar() {
        if (!game.player.ship.miningTarget || game.player.ship.miningProgress === 0) return;

        const miningButton = game.ui?.buttons?.find((b) => b.key === '2');
        if (!miningButton || !miningButton.pos) return;

        const barWidth = 40; // ICON_SIZE
        const barHeight = 4;
        const barX = miningButton.pos.x;
        const barY = miningButton.pos.y - 8; // 8px above the button
        
        // Background
        game.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        game.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Bar fill (blue, filling from left to right based on progress)
        const miningFillWidth = barWidth * game.player.ship.miningProgress;
        game.ctx.fillStyle = 'rgba(100, 150, 255, 0.9)';
        game.ctx.fillRect(barX, barY, miningFillWidth, barHeight);
        
        // Border
        game.ctx.strokeStyle = 'rgba(100, 150, 255, 1)';
        game.ctx.lineWidth = 1;
        game.ctx.strokeRect(barX, barY, barWidth, barHeight);
    }

    #drawLaserCooldownBar() {
        // Only show when weapon is cooling down (not ready)
        if (game.player.ship.attackCount >= game.player.ship.attackTime) return;
        
        const laserButton = game.ui?.buttons?.find((b) => b.key === '1');
        if (!laserButton || !laserButton.pos) return;

        const barWidth = 40; // ICON_SIZE
        const barHeight = 4;
        const barX = laserButton.pos.x;
        const barY = laserButton.pos.y - 8; // 8px above the button
        
        const laserCooldownPercentage = Math.min(game.player.ship.attackCount / game.player.ship.attackTime, 1);
        
        // Background
        game.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        game.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Bar fill (purple to match laser color, filling from left to right)
        const laserFillWidth = barWidth * laserCooldownPercentage;
        game.ctx.fillStyle = 'rgba(200, 100, 255, 0.9)';
        game.ctx.fillRect(barX, barY, laserFillWidth, barHeight);
        
        // Border
        game.ctx.strokeStyle = 'rgba(200, 100, 255, 1)';
        game.ctx.lineWidth = 1;
        game.ctx.strokeRect(barX, barY, barWidth, barHeight);
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
