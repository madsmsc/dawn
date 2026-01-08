import { game } from '../controllers/game.js';
import { UIHelper } from './UIHelper.js';
import { Research } from '../modules/Research.js';

/**
 * UIStation manages station docking UI rendering and mission interactions
 */
export class UIStation {
    constructor() {
        this.missionBoxBounds = null; // Track clickable mission box area for click detection
        this.currentTab = 'station'; // 'station', 'missions', 'research'
        this.tabBounds = {}; // Track clickable tab areas
    }

    draw() {
        game.ctx.save();
        // Draw main dialog
        const dialogWidth = 500;
        const dialogHeight = 500;
        const dialogX = game.canvas.width / 2 - dialogWidth / 2;
        const dialogY = game.canvas.height / 2 - dialogHeight / 2;
        
        UIHelper.roundedRect(dialogX, dialogY, dialogWidth, dialogHeight, 10);
        
        // Draw tabs
        this.#drawTabs(dialogX, dialogY, dialogWidth);
        
        // Draw content based on current tab
        let yOffset = dialogY + 50; // Account for tab bar
        
        if (this.currentTab === 'station') {
            this.#drawStationTab(dialogX, yOffset, dialogWidth, dialogHeight);
        } else if (this.currentTab === 'missions') {
            this.#drawMissionsTab(dialogX, yOffset, dialogWidth, dialogHeight);
        } else if (this.currentTab === 'research') {
            this.#drawResearchTab(dialogX, yOffset, dialogWidth, dialogHeight);
        }
        // Reset canvas state so HUD/mission list keep their alignment
        game.ctx.restore();
    }

    #drawTabs(dialogX, dialogY, dialogWidth) {
        const tabs = [
            { key: 'station', label: 'Station' },
            { key: 'missions', label: 'Missions' },
            { key: 'research', label: 'Research' }
        ];
        
        const tabWidth = dialogWidth / 3;
        const tabHeight = 40;
        
        tabs.forEach((tab, index) => {
            const tabX = dialogX + index * tabWidth;
            const tabY = dialogY + 10;
            
            // Store tab bounds for click detection
            this.tabBounds[tab.key] = { x: tabX, y: tabY, width: tabWidth, height: tabHeight };
            
            // Draw tab background
            const isActive = this.currentTab === tab.key;
            game.ctx.fillStyle = isActive ? 'rgba(100, 150, 255, 0.5)' : 'rgba(50, 50, 100, 0.3)';
            game.ctx.fillRect(tabX, tabY, tabWidth, tabHeight);
            
            // Draw tab border
            game.ctx.strokeStyle = isActive ? 'rgba(150, 200, 255, 0.8)' : 'rgba(100, 100, 150, 0.5)';
            game.ctx.lineWidth = 2;
            game.ctx.strokeRect(tabX, tabY, tabWidth, tabHeight);
            
            // Draw tab text
            game.ctx.fillStyle = isActive ? 'white' : 'rgba(200, 200, 200, 0.7)';
            game.ctx.font = 'bold 14px Arial';
            game.ctx.textAlign = 'center';
            game.ctx.fillText(tab.label, tabX + tabWidth / 2, tabY + 27);
        });
    }

    #drawStationTab(dialogX, yOffset, dialogWidth, dialogHeight) {
        let y = yOffset;
        const centerX = dialogX + dialogWidth / 2;
        
        // Station header
        y = UIHelper.drawCenteredHeader(`Docked at ${game.player.docked.name}`, dialogWidth, y, dialogX);
        
        // Welcome message
        game.ctx.fillStyle = 'rgba(150, 200, 255, 0.9)';
        game.ctx.font = '14px Arial';
        game.ctx.textAlign = 'center';
        game.ctx.fillText('Welcome aboard, Commander!', centerX, y);
        y += 30;
        
        // Station services section
        y = UIHelper.drawCenteredHeader('Available Services', dialogWidth, y, dialogX);
        
        // Draw service items
        const services = [
            { icon: '⚙️', name: 'Repair & Refit' },
            { icon: '📦', name: 'Cargo Bay' },
            { icon: '🛒', name: 'Market' }
        ];
        
        services.forEach((service) => {
            const itemY = y;
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
            game.ctx.textAlign = 'center';
            game.ctx.fillText(`${service.icon} ${service.name}`, centerX, itemY + 25);
            
            y += itemHeight + 8;
        });
    }

    #drawMissionsTab(dialogX, yOffset, dialogWidth, dialogHeight) {
        let y = yOffset;
        
        // Title
        y = UIHelper.drawCenteredHeader('Mission Board', dialogWidth, y, dialogX);
        
        const centerX = dialogX + dialogWidth / 2;
        
        // Draw available missions section
        const mission = game.player.docked.missionToAccept();
        if (mission) {
            y = UIHelper.drawCenteredHeader('Available Contracts', dialogWidth, y, dialogX);
            
            const missionBoxHeight = 120;
            const missionBoxX = dialogX + 20;
            const missionBoxWidth = dialogWidth - 40;
            
            // Mission background with accent
            game.ctx.fillStyle = 'rgba(50, 100, 150, 0.4)';
            game.ctx.fillRect(missionBoxX, y, missionBoxWidth, missionBoxHeight);
            
            // Left accent bar
            game.ctx.fillStyle = 'rgba(100, 200, 255, 0.8)';
            game.ctx.fillRect(missionBoxX, y, 4, missionBoxHeight);
            
            // Border
            game.ctx.strokeStyle = 'rgba(100, 150, 255, 0.6)';
            game.ctx.lineWidth = 2;
            game.ctx.strokeRect(missionBoxX, y, missionBoxWidth, missionBoxHeight);
            
            // Mission details
            game.ctx.fillStyle = 'rgba(255, 255, 100, 0.9)';
            game.ctx.font = 'bold 14px Arial';
            game.ctx.textAlign = 'center';
            game.ctx.fillText('⭐ New Contract Available', centerX, y + 25);

            game.ctx.fillStyle = 'rgba(200, 200, 255, 0.9)';
            game.ctx.font = '13px Arial';
            game.ctx.fillText(mission.description, centerX, y + 50);

            // Reward
            game.ctx.fillStyle = 'rgba(100, 255, 100, 0.9)';
            game.ctx.font = 'bold 14px Arial';
            game.ctx.fillText(`💰 Reward: ${mission.reward} credits`, centerX, y + 75);
            
            // Accept button - disable if player has 5 missions
            const canAccept = game.missionManager.activeMissions.length < 5;
            const buttonX = missionBoxX + 15;
            const buttonY = y + 90;
            const buttonWidth = 100;
            const buttonHeight = 25;
            
            game.ctx.fillStyle = canAccept ? 'rgba(100, 255, 100, 0.8)' : 'rgba(100, 100, 100, 0.5)';
            game.ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
            game.ctx.strokeStyle = canAccept ? 'rgba(50, 200, 50, 1)' : 'rgba(100, 100, 100, 0.5)';
            game.ctx.lineWidth = 1;
            game.ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
            game.ctx.fillStyle = canAccept ? 'rgba(0, 0, 0, 0.9)' : 'rgba(100, 100, 100, 0.7)';
            game.ctx.font = 'bold 12px Arial';
            game.ctx.textAlign = 'center';
            const buttonText = canAccept ? 'Click to Accept' : `${game.missionManager.activeMissions.length}/5 Missions`;
            game.ctx.fillText(buttonText, buttonX + buttonWidth / 2, buttonY + 17);
            
            // Store mission box bounds for click detection
            this.missionBoxBounds = canAccept ? {
                x: missionBoxX,
                y: y,
                width: missionBoxWidth,
                height: missionBoxHeight,
                buttonX: buttonX,
                buttonY: buttonY,
                buttonWidth: buttonWidth,
                buttonHeight: buttonHeight
            } : null;
            
            y += missionBoxHeight + 10;
        } else if (game.missionManager.activeMissions.length === 0) {
            game.ctx.fillStyle = 'rgba(150, 150, 150, 0.6)';
            game.ctx.font = '13px Arial';
            game.ctx.textAlign = 'center';
            game.ctx.fillText('No missions available at this time.', centerX, y);
            y += 30;
            this.missionBoxBounds = null;
        }
    }

    #drawResearchTab(dialogX, yOffset, dialogWidth, dialogHeight) {
        let y = yOffset;
        
        // Title
        y = UIHelper.drawCenteredHeader('Research Lab', dialogWidth, y, dialogX);
        const centerX = dialogX + dialogWidth / 2;
        
        // Info text
        game.ctx.fillStyle = 'rgba(150, 200, 255, 0.9)';
        game.ctx.font = '13px Arial';
        game.ctx.textAlign = 'center';
        game.ctx.fillText('Improve and modify your modules', centerX, y);
        y += 25;
        
        // Draw available research
        const available = Research.availableResearch();
        
        available.slice(0, 3).forEach((research) => {
            const itemHeight = 50;
            const itemX = dialogX + 20;
            
            // Background
            game.ctx.fillStyle = 'rgba(50, 80, 120, 0.4)';
            game.ctx.fillRect(itemX, y, dialogWidth - 40, itemHeight);
            
            // Border
            game.ctx.strokeStyle = 'rgba(100, 150, 200, 0.5)';
            game.ctx.lineWidth = 1;
            game.ctx.strokeRect(itemX, y, dialogWidth - 40, itemHeight);
            
            // Research name
            game.ctx.fillStyle = 'rgba(200, 220, 255, 0.9)';
            game.ctx.font = 'bold 13px Arial';
            game.ctx.textAlign = 'center';
            game.ctx.fillText(research.name, centerX, y + 15);

            // Description
            game.ctx.fillStyle = 'rgba(150, 170, 200, 0.8)';
            game.ctx.font = '11px Arial';
            game.ctx.fillText(research.desc, centerX, y + 32);

            // Cost
            game.ctx.fillStyle = 'rgba(255, 200, 100, 0.9)';
            game.ctx.font = 'bold 12px Arial';
            game.ctx.fillText(`Cost: ${research.cost} credits`, centerX, y + 25);
            
            y += itemHeight + 8;
        });
        
        game.ctx.fillStyle = 'rgba(150, 150, 150, 0.6)';
        game.ctx.font = '12px Arial';
        game.ctx.textAlign = 'center';
        game.ctx.fillText('Click research items to apply (coming soon)', centerX, y + 10);
    }

    handleStationDialogClick(clickPos) {
        // Check if docked and station UI is showing
        if (!game.player.docked) return false;
        
        // Check if click is on a tab
        for (const [tab, bounds] of Object.entries(this.tabBounds)) {
            if (clickPos.x >= bounds.x && clickPos.x <= bounds.x + bounds.width &&
                clickPos.y >= bounds.y && clickPos.y <= bounds.y + bounds.height) {
                this.currentTab = tab;
                return true;
            }
        }
        
        // Check if click is on mission complete button (only if on missions tab)
        if (this.currentTab === 'missions' && this.missionCompleteButtons) {
            for (const completeBtn of this.missionCompleteButtons) {
                if (clickPos.x >= completeBtn.x && clickPos.x <= completeBtn.x + completeBtn.width &&
                    clickPos.y >= completeBtn.y && clickPos.y <= completeBtn.y + completeBtn.height) {
                    if (completeBtn.mission.canComplete && completeBtn.mission.canComplete()) {
                        completeBtn.mission.complete();
                        return true;
                    }
                }
            }
        }
        
        // Check if click is on mission accept button (only if on missions tab)
        if (this.currentTab === 'missions' && this.missionBoxBounds) {
            const bounds = this.missionBoxBounds;
            if (clickPos.x >= bounds.buttonX && clickPos.x <= bounds.buttonX + bounds.buttonWidth &&
                clickPos.y >= bounds.buttonY && clickPos.y <= bounds.buttonY + bounds.buttonHeight) {
                game.player.docked.acceptMission();
                return true;
            }
        }
        
        return false;
    }
}
