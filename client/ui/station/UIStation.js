import { game } from '../../controllers/game.js';
import { UIHelper } from '../UIHelper.js';
import { UIStationTab } from './UIStationTab.js';
import { UIMissionsTab } from './UIMissionsTab.js';
import { UIResearch } from './UIResearch.js';
import { UIStashTab } from './UIStashTab.js';
import { UI_COLORS, UI_FONTS } from '../../../shared/Constants.js';

export class UIStation {
    constructor(inventoryGrid) {
        this.currentTab = 'station';
        this.tabBounds = {};
        
        // Create tab handlers
        this.stationTab = new UIStationTab();
        this.missionsTab = new UIMissionsTab();
        this.researchTab = new UIResearch(inventoryGrid);
        this.stashTab = new UIStashTab(inventoryGrid);
        
        // Load station background image (randomly select one)
        const backgrounds = ['station_blue.png', 'station_gold.png', 'station_rust.png'];
        const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
        this.backgroundImage = new Image();
        this.backgroundImage.src = `client/static/${randomBg}`;
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
        
        // Draw station background image
        if (this.backgroundImage && this.backgroundImage.complete) {
            const imgAspect = this.backgroundImage.width / this.backgroundImage.height;
            const canvasAspect = game.canvas.width / game.canvas.height;
            
            // First, draw blurred stretched background
            game.ctx.filter = 'blur(20px)';
            game.ctx.drawImage(this.backgroundImage, 0, 0, game.canvas.width, game.canvas.height);
            game.ctx.filter = 'none';
            
            // Then draw properly scaled image on top (fit to canvas, no cropping)
            let drawWidth, drawHeight, drawX, drawY;
            
            if (imgAspect > canvasAspect) {
                // Image is wider - fit to width
                drawWidth = game.canvas.width;
                drawHeight = drawWidth / imgAspect;
                drawX = 0;
                drawY = (game.canvas.height - drawHeight) / 2;
            } else {
                // Image is taller - fit to height
                drawHeight = game.canvas.height;
                drawWidth = drawHeight * imgAspect;
                drawX = (game.canvas.width - drawWidth) / 2;
                drawY = 0;
            }
            
            game.ctx.drawImage(this.backgroundImage, drawX, drawY, drawWidth, drawHeight);
        }
        
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
        let yOffset = dialogY + 50;

        if (this.currentTab === 'station') {
            this.stationTab.draw(dialogX, yOffset, dialogWidth, dialogHeight);
        } else if (this.currentTab === 'missions') {
            this.missionsTab.draw(dialogX, yOffset, dialogWidth, dialogHeight);
        } else if (this.currentTab === 'research') {
            this.researchTab.draw(dialogX, yOffset, dialogWidth, dialogHeight);
        } else if (this.currentTab === 'stash') {
            this.stashTab.draw(dialogX, yOffset, dialogWidth, dialogHeight);
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

    handleStationDialogClick(clickPos) {
        if (!game.player.docked) return false;

        // Check if click is on a tab
        for (const [tab, bounds] of Object.entries(this.tabBounds)) {
            if (clickPos.x >= bounds.x && clickPos.x <= bounds.x + bounds.width &&
                clickPos.y >= bounds.y && clickPos.y <= bounds.y + bounds.height) {
                this.currentTab = tab;
                return true;
            }
        }
        
        // Route click to appropriate tab handler
        switch(this.currentTab) {
            case 'station':
                return this.stationTab.handleClick(clickPos);
            case 'missions':
                return this.missionsTab.handleClick(clickPos);
            case 'research':
                return this.researchTab.handleClick(clickPos);
            case 'stash':
                return this.stashTab.handleClick(clickPos);
        }

        return false;
    }

    handleStationDialogMouseDown(clickPos) {
        // Only stash and research tabs need mouse down handling
        if (this.currentTab === 'stash') {
            return this.stashTab.handleMouseDown(clickPos);
        } else if (this.currentTab === 'research') {
            return this.researchTab.handleMouseDown(clickPos);
        }
        return false;
    }

    handleStationDialogMouseUp(clickPos) {
        // Only stash and research tabs need mouse up handling
        if (this.currentTab === 'stash') {
            return this.stashTab.handleMouseUp(clickPos);
        } else if (this.currentTab === 'research') {
            return this.researchTab.handleMouseUp(clickPos);
        }
        return false;
    }

    setMousePos(mousePos) {
        // Route mouse position to appropriate tab
        if (this.currentTab === 'stash') {
            this.stashTab.handleMouseMove(mousePos);
        } else if (this.currentTab === 'research') {
            this.researchTab.handleMouseMove(mousePos);
        }
    }
}
