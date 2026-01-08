import { game } from '../controllers/game.js';
import { UIHelper } from './UIHelper.js';

/**
 * UIStation manages station docking UI rendering and mission interactions
 */
export class UIStation {
    constructor() {
        this.missionBoxBounds = null; // Track clickable mission box area for click detection
    }

    draw() {
        // Draw main dialog
        const dialogWidth = 500;
        const dialogHeight = 500;
        const dialogX = game.canvas.width / 2 - dialogWidth / 2;
        const dialogY = game.canvas.height / 2 - dialogHeight / 2;
        
        UIHelper.roundedRect(dialogX, dialogY, dialogWidth, dialogHeight, 10);
        
        let yOffset = dialogY;
        
        // Station header
        yOffset = UIHelper.drawSectionHeader(`Docked at ${game.player.docked.name}`, dialogWidth, yOffset, dialogX);
        
        // Welcome message
        game.ctx.fillStyle = 'rgba(150, 200, 255, 0.9)';
        game.ctx.font = '14px Arial';
        game.ctx.fillText('Welcome aboard, Commander!', dialogX + 30, yOffset);
        yOffset += 30;
        
        // Station services section
        yOffset = UIHelper.drawSectionHeader('Available Services', dialogWidth, yOffset, dialogX);
        
        // Draw service items
        const services = [
            { icon: '⚙️', name: 'Repair & Refit', key: 'R' },
            { icon: '📦', name: 'Cargo Bay', key: 'C' },
            { icon: '🛒', name: 'Market', key: 'M' },
            { icon: '🔬', name: 'Research Lab', key: 'L' }
        ];
        
        services.forEach((service) => {
            const itemY = yOffset;
            const itemHeight = 40;
            
            // Background
            game.ctx.fillStyle = 'rgba(50, 50, 100, 0.3)';
            game.ctx.fillRect(dialogX + 20, itemY, dialogWidth - 40, itemHeight);
            
            // Border
            game.ctx.strokeStyle = 'rgba(100, 100, 150, 0.5)';
            game.ctx.lineWidth = 1;
            game.ctx.strokeRect(dialogX + 20, itemY, dialogWidth - 40, itemHeight);
            
            // Icon and text
            game.ctx.fillStyle = 'rgba(200, 200, 255, 0.9)';
            game.ctx.font = 'bold 16px Arial';
            game.ctx.fillText(service.icon + ' ' + service.name, dialogX + 35, itemY + 25);
            
            // Key hint
            game.ctx.fillStyle = 'rgba(150, 150, 200, 0.7)';
            game.ctx.font = '12px Arial';
            game.ctx.fillText(`[${service.key}]`, dialogX + dialogWidth - 70, itemY + 25);
            
            yOffset += itemHeight + 8;
        });
        
        // Missions section
        yOffset += 10;
        yOffset = UIHelper.drawSectionHeader('Mission Board', dialogWidth, yOffset, dialogX);
        
        const mission = game.player.docked.missionToAccept();
        if (mission) {
            const missionBoxY = yOffset;
            const missionBoxHeight = 120;
            const missionBoxX = dialogX + 20;
            const missionBoxWidth = dialogWidth - 40;
            
            // Mission background with accent
            game.ctx.fillStyle = 'rgba(50, 100, 150, 0.4)';
            game.ctx.fillRect(missionBoxX, missionBoxY, missionBoxWidth, missionBoxHeight);
            
            // Left accent bar
            game.ctx.fillStyle = 'rgba(100, 200, 255, 0.8)';
            game.ctx.fillRect(missionBoxX, missionBoxY, 4, missionBoxHeight);
            
            // Border
            game.ctx.strokeStyle = 'rgba(100, 150, 255, 0.6)';
            game.ctx.lineWidth = 2;
            game.ctx.strokeRect(missionBoxX, missionBoxY, missionBoxWidth, missionBoxHeight);
            
            // Mission details
            game.ctx.fillStyle = 'rgba(255, 255, 100, 0.9)';
            game.ctx.font = 'bold 14px Arial';
            game.ctx.fillText('⭐ New Contract Available', missionBoxX + 15, missionBoxY + 25);
            
            game.ctx.fillStyle = 'rgba(200, 200, 255, 0.9)';
            game.ctx.font = '13px Arial';
            game.ctx.fillText(mission.description, missionBoxX + 15, missionBoxY + 50);
            
            // Reward
            game.ctx.fillStyle = 'rgba(100, 255, 100, 0.9)';
            game.ctx.font = 'bold 14px Arial';
            game.ctx.fillText(`💰 Reward: ${mission.reward} credits`, missionBoxX + 15, missionBoxY + 75);
            
            // Accept button
            const buttonX = missionBoxX + 15;
            const buttonY = missionBoxY + 90;
            const buttonWidth = 100;
            const buttonHeight = 25;
            
            game.ctx.fillStyle = 'rgba(100, 255, 100, 0.8)';
            game.ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
            game.ctx.strokeStyle = 'rgba(50, 200, 50, 1)';
            game.ctx.lineWidth = 1;
            game.ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
            game.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            game.ctx.font = 'bold 12px Arial';
            game.ctx.fillText('Press F to Accept', buttonX + 10, buttonY + 17);
            
            // Store mission box bounds for click detection
            this.missionBoxBounds = {
                x: missionBoxX,
                y: missionBoxY,
                width: missionBoxWidth,
                height: missionBoxHeight,
                buttonX: buttonX,
                buttonY: buttonY,
                buttonWidth: buttonWidth,
                buttonHeight: buttonHeight
            };
            
            yOffset += missionBoxHeight + 10;
        } else {
            game.ctx.fillStyle = 'rgba(150, 150, 150, 0.6)';
            game.ctx.font = '13px Arial';
            game.ctx.fillText('No missions available at this time.', dialogX + 35, yOffset);
            yOffset += 30;
            this.missionBoxBounds = null;
        }
        
        // Footer
        yOffset = dialogY + dialogHeight - 35;
        game.ctx.fillStyle = 'rgba(150, 150, 200, 0.7)';
        game.ctx.font = '12px Arial';
        game.ctx.fillText('Press E to undock and leave station', dialogX + dialogWidth / 2, yOffset);
    }

    handleStationDialogClick(clickPos) {
        // Check if docked and station UI is showing
        if (!game.player.docked || !this.missionBoxBounds) return false;
        
        const bounds = this.missionBoxBounds;
        
        // Check if click is on the accept button
        if (clickPos.x >= bounds.buttonX && clickPos.x <= bounds.buttonX + bounds.buttonWidth &&
            clickPos.y >= bounds.buttonY && clickPos.y <= bounds.buttonY + bounds.buttonHeight) {
            game.player.docked.acceptMission();
            return true;
        }
        return false;
    }
}
