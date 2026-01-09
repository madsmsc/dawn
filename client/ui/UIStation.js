import { game } from '../controllers/game.js';
import { UIHelper } from './UIHelper.js';
import { Research } from '../modules/Research.js';
import { UI_COLORS, UI_FONTS } from '../../shared/Constants.js';

export class UIStation {
    constructor(inventoryGrid) {
        this.missionBoxBounds = null; // Track clickable mission box area for click detection
        this.currentTab = 'station'; // 'station', 'missions', 'research', 'stash'
        this.tabBounds = {}; // Track clickable tab areas
        this.inventoryGrid = inventoryGrid;
    }

    #drawItemBox(x, y, width, height, text, bgColor, borderColor, textColor, font) {
        game.ctx.fillStyle = bgColor;
        game.ctx.fillRect(x, y, width, height);
        game.ctx.strokeStyle = borderColor;
        game.ctx.lineWidth = 1;
        game.ctx.strokeRect(x, y, width, height);
        if (text) {
            game.ctx.fillStyle = textColor;
            game.ctx.font = font;
            game.ctx.textAlign = 'center';
            game.ctx.fillText(text, x + width / 2, y + height / 2 + 5);
        }
    }

    #drawText(text, x, y, color, font, align = 'center') {
        game.ctx.fillStyle = color;
        game.ctx.font = font;
        game.ctx.textAlign = align;
        game.ctx.fillText(text, x, y);
    }

    draw() {
        game.ctx.save();
        
        // Always draw info dialog when docked (left side)
        game.ui.dialogs.drawInfoDialog();
        
        // Draw main station dialog (right side)
        const dialogWidth = 500;
        const dialogHeight = 600; // Increased by 20%
        const dialogX = game.canvas.width - dialogWidth; // Right-align
        const dialogY = game.canvas.height / 2 - dialogHeight / 2;

        UIHelper.drawDialog(dialogX, dialogY, dialogWidth, dialogHeight);

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
        } else if (this.currentTab === 'stash') {
            this.#drawStashTab(dialogX, yOffset, dialogWidth, dialogHeight);
        }
        // Reset canvas state so HUD/mission list keep their alignment
        game.ctx.restore();
    }

    #drawTabs(dialogX, dialogY, dialogWidth) {
        const tabs = [
            { key: 'station', label: 'Station' },
            { key: 'missions', label: 'Missions' },
            { key: 'research', label: 'Research' },
            { key: 'stash', label: 'Stash' }
        ];

        const tabWidth = dialogWidth / 4;
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
        y = UIHelper.drawCenteredHeader(`Docked at ${game.player.docked.name}`, dialogWidth, y, dialogX);
        this.#drawText('Welcome aboard, Commander!', centerX, y, UI_COLORS.TEXT_PRIMARY, UI_FONTS.HEADER);
        y += 30;
        y = UIHelper.drawCenteredHeader('Available Services', dialogWidth, y, dialogX);
        const services = [
            { name: 'Repair & Refit' },
            { name: 'Cargo Bay' },
            { name: 'Market' }
        ];
        services.forEach((service) => {
            const itemHeight = 40;
            this.#drawItemBox(dialogX + 20, y, dialogWidth - 40, itemHeight,
                service.name,
                UI_COLORS.BG_PANEL, UI_COLORS.BORDER,
                UI_COLORS.TEXT_PRIMARY, UI_FONTS.ITEM);
            y += itemHeight + 8;
        });
    }

    #drawMissionsTab(dialogX, yOffset, dialogWidth, dialogHeight) {
        let y = yOffset;
        const mission = game.player.docked.missionToAccept();
        y = this.#drawAvailableMission(mission, dialogX, y, dialogWidth);
        y = this.#drawActiveMissions(mission, dialogX, y, dialogWidth);
    }

    #drawAvailableMission(mission, dialogX, y, dialogWidth) {
        const missionBoxX = dialogX + 20;
        const missionBoxWidth = dialogWidth - 40;
        const missionBoxHeight = 48;
        const buttonWidth = 80;

        y = UIHelper.drawCenteredHeader('Available missions', dialogWidth, y, dialogX);
        
        if (!mission) {
            // Show "no missions" message
            this.#drawText('There are no available missions', dialogX + dialogWidth / 2, y + 30, UI_COLORS.TEXT_DISABLED, UI_FONTS.ITEM);
            this.missionBoxBounds = null;
            return y + 60;
        }

        const canAccept = game.missionManager.activeMissions.length < 5;
        const button = {
            x: missionBoxX + 4,
            y: y,
            width: buttonWidth,
            height: missionBoxHeight,
            text: canAccept ? 'Accept' : `${game.missionManager.activeMissions.length}/5`,
            enabled: canAccept
        };
        
        UIHelper.drawMission(missionBoxX, y, missionBoxWidth, missionBoxHeight, button);
        
        const textX = missionBoxX + buttonWidth + 15;
        this.#drawText('New mission', textX, y + 22, UI_COLORS.TEXT_HIGHLIGHT, UI_FONTS.SMALL, 'left');
        this.#drawText(mission.description, textX, y + 38, UI_COLORS.TEXT_PRIMARY, UI_FONTS.SMALL, 'left');

        this.missionBoxBounds = canAccept ? {
            x: missionBoxX, y: y, width: missionBoxWidth, height: missionBoxHeight,
            buttonX: button.x, buttonY: button.y, buttonWidth: button.width, buttonHeight: button.height
        } : null;

        return y + missionBoxHeight + 10;
    }

    #drawActiveMissions(availableMission, dialogX, y, dialogWidth) {
        const missionBoxX = dialogX + 20;
        const missionBoxWidth = dialogWidth - 40;
        const missionBoxHeight = 48;
        const buttonWidth = 80;

        if (game.missionManager.activeMissions.length > 0) {
            y = UIHelper.drawCenteredHeader('Active Missions', dialogWidth, y, dialogX);
            
            this.missionCompleteButtons = [];
            game.missionManager.activeMissions.forEach((activeMission) => {
                const canComplete = activeMission.canComplete && activeMission.canComplete();
                const button = canComplete ? {
                    x: missionBoxX + 4,
                    y: y,
                    width: buttonWidth,
                    height: missionBoxHeight,
                    text: 'Complete',
                    enabled: true
                } : null;
                
                UIHelper.drawMission(missionBoxX, y, missionBoxWidth, missionBoxHeight, button);
                
                if (button) {
                    this.missionCompleteButtons.push({ mission: activeMission, ...button });
                }

                const textX = canComplete ? missionBoxX + buttonWidth + 15 : missionBoxX + 15;
                this.#drawMissionText(textX, y, activeMission.description, `${activeMission.reward} credits`);

                y += missionBoxHeight + 8;
            });
        }

        return y;
    }

    #drawMissionText(x, y, description, reward) {
        this.#drawText(description, x, y + 22, UI_COLORS.TEXT_PRIMARY, UI_FONTS.SMALL, 'left');
        this.#drawText(reward, x, y + 42, UI_COLORS.TEXT_REWARD, UI_FONTS.SMALL, 'left');
    }

    #drawResearchTab(dialogX, yOffset, dialogWidth, dialogHeight) {
        let y = yOffset;

        // Title
        y = UIHelper.drawCenteredHeader('Research Lab', dialogWidth, y, dialogX);
        const centerX = dialogX + dialogWidth / 2;

        // Info text
        this.#drawText('Improve and modify your modules', centerX, y, UI_COLORS.TEXT_PRIMARY, UI_FONTS.SMALL);
        y += 25;

        // Draw available research
        const available = Research.availableResearch();

        available.slice(0, 3).forEach((research) => {
            const itemHeight = 50;
            const itemX = dialogX + 20;

            // Background and border
            game.ctx.fillStyle = UI_COLORS.BG_PANEL;
            game.ctx.fillRect(itemX, y, dialogWidth - 40, itemHeight);
            game.ctx.strokeStyle = UI_COLORS.BORDER;
            game.ctx.lineWidth = 1;
            game.ctx.strokeRect(itemX, y, dialogWidth - 40, itemHeight);

            // Research name, cost, and description
            this.#drawText(research.name, centerX, y + 15, UI_COLORS.TEXT_PRIMARY, UI_FONTS.SMALL);
            this.#drawText(`Cost: ${research.cost} credits`, centerX, y + 25, UI_COLORS.TEXT_COST, UI_FONTS.SMALL);
            this.#drawText(research.desc, centerX, y + 32, UI_COLORS.TEXT_SECONDARY, UI_FONTS.SMALL);

            y += itemHeight + 8;
        });

        this.#drawText('Click research items to apply (coming soon)', centerX, y + 10, UI_COLORS.TEXT_DISABLED, UI_FONTS.SMALL);
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

        // Handle inventory/stash interactions on stash tab
        if (this.currentTab === 'stash') {
            return this.inventoryGrid.handleMouseDown(clickPos);
        }

        return false;
    }

    handleStationDialogMouseUp(clickPos) {
        // Handle inventory/stash drag-and-drop on stash tab
        if (this.currentTab === 'stash') {
            return this.inventoryGrid.handleMouseUp(clickPos);
        }
        return false;
    }

    setMousePos(mousePos) {
        // Update inventory grid hover state on stash tab
        if (this.currentTab === 'stash') {
            this.inventoryGrid.handleMouseMove(mousePos);
        }
    }

    #drawStashTab(dialogX, yOffset, dialogWidth, dialogHeight) {
        // Draw quantum stash in the station dialog area
        let y = yOffset;
        y = UIHelper.drawCenteredHeader('Quantum Stash', dialogWidth, y, dialogX);
        const centerX = dialogX + dialogWidth / 2;
        
        // Info text
        this.#drawText('Shared storage across all stations', centerX, y, UI_COLORS.TEXT_PRIMARY, UI_FONTS.SMALL);
        y += 30;
        
        // Draw quantum stash centered
        const stashX = dialogX + (dialogWidth - 250) / 2;
        this.inventoryGrid.drawStash(stashX, 250, y);
        
        // Draw dragged item on top
        if (this.inventoryGrid.draggedItem) {
            this.inventoryGrid.drawDraggedItem();
        }
    }
}
