import { game } from '../controllers/game.js';
import { UIHelper } from './UIHelper.js';
import { Research } from '../modules/Research.js';
import { UI_COLORS, UI_FONTS, ORE } from '../../shared/Constants.js';

export class UIStation {
    constructor(inventoryGrid) {
        this.missionBoxBounds = null; // Track clickable mission box area for click detection
        this.currentTab = 'station'; // 'station', 'missions', 'research', 'stash'
        this.tabBounds = {}; // Track clickable tab areas
        this.inventoryGrid = inventoryGrid;
        this.salvageMode = false; // Track if salvage mode is active
        this.stashButtonBounds = {}; // Track stash button click areas
        this.salvageClickStart = null; // Track where salvage click started (item index)
        this.salvageButtonClickStart = false; // Track if salvage button was clicked
        this.repairButtonBounds = null; // Track repair button click area
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
        
        // Station name
        y = UIHelper.drawCenteredHeader(game.player.docked.name, dialogWidth, y, dialogX);
        const centerX = dialogX + dialogWidth / 2;

        // Ship Status Section
        y += 10;
        this.#drawText('Ship Status', centerX, y, UI_COLORS.TEXT_WHITE, UI_FONTS.MEDIUM);
        y += 25;

        const ship = game.player.ship;
        const shieldPercent = (ship.shield / ship.maxShield * 100).toFixed(0);
        const hullPercent = (ship.hull / ship.maxHull * 100).toFixed(0);
        
        // Shield bar
        this.#drawText(`Shield: ${ship.shield.toFixed(0)} / ${ship.maxShield} (${shieldPercent}%)`, centerX, y, UI_COLORS.TEXT_PRIMARY, UI_FONTS.SMALL);
        y += 20;
        const shieldBarWidth = 300;
        const shieldBarHeight = 20;
        const shieldBarX = centerX - shieldBarWidth / 2;
        game.ctx.fillStyle = UI_COLORS.BG_PANEL;
        game.ctx.fillRect(shieldBarX, y - 15, shieldBarWidth, shieldBarHeight);
        game.ctx.fillStyle = 'rgba(100, 150, 255, 0.8)';
        game.ctx.fillRect(shieldBarX, y - 15, shieldBarWidth * (ship.shield / ship.maxShield), shieldBarHeight);
        game.ctx.strokeStyle = UI_COLORS.BORDER;
        game.ctx.strokeRect(shieldBarX, y - 15, shieldBarWidth, shieldBarHeight);
        
        y += 15;
        // Hull bar
        this.#drawText(`Hull: ${ship.hull.toFixed(0)} / ${ship.maxHull} (${hullPercent}%)`, centerX, y, UI_COLORS.TEXT_PRIMARY, UI_FONTS.SMALL);
        y += 20;
        game.ctx.fillStyle = UI_COLORS.BG_PANEL;
        game.ctx.fillRect(shieldBarX, y - 15, shieldBarWidth, shieldBarHeight);
        game.ctx.fillStyle = 'rgba(255, 100, 100, 0.8)';
        game.ctx.fillRect(shieldBarX, y - 15, shieldBarWidth * (ship.hull / ship.maxHull), shieldBarHeight);
        game.ctx.strokeStyle = UI_COLORS.BORDER;
        game.ctx.strokeRect(shieldBarX, y - 15, shieldBarWidth, shieldBarHeight);

        y += 30;

        // Repair section
        const missingShield = ship.maxShield - ship.shield;
        const missingHull = ship.maxHull - ship.hull;
        const shieldCost = Math.ceil(missingShield * 1); // 1 credit per shield
        const hullCost = Math.ceil(missingHull * 2); // 2 credits per hull
        const totalCost = shieldCost + hullCost;

        if (totalCost > 0) {
            // Repair button
            const buttonWidth = 150;
            const buttonHeight = 40;
            const buttonX = centerX - buttonWidth / 2;
            const buttonY = y;

            const canAfford = game.player.credits >= totalCost;
            const buttonColor = canAfford ? 'rgba(100, 200, 100, 0.3)' : 'rgba(100, 100, 100, 0.2)';
            const borderColor = canAfford ? 'rgba(150, 255, 150, 0.8)' : 'rgba(150, 150, 150, 0.5)';

            game.ctx.fillStyle = buttonColor;
            game.ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
            game.ctx.strokeStyle = borderColor;
            game.ctx.lineWidth = 2;
            game.ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

            this.#drawText('Repair Ship', centerX, buttonY + 25, canAfford ? UI_COLORS.TEXT_WHITE : UI_COLORS.TEXT_DISABLED, UI_FONTS.MEDIUM);

            // Store button bounds for click detection
            this.repairButtonBounds = { x: buttonX, y: buttonY, width: buttonWidth, height: buttonHeight, cost: totalCost, canAfford };

            y += buttonHeight + 15;

            // Cost breakdown
            this.#drawText(`Total Cost: ${totalCost} credits`, centerX, y, UI_COLORS.TEXT_COST, UI_FONTS.SMALL);
            y += 18;
            if (missingShield > 0) {
                this.#drawText(`Shield repair: ${shieldCost} credits (${missingShield.toFixed(0)} points)`, centerX, y, UI_COLORS.TEXT_SECONDARY, UI_FONTS.SMALL);
                y += 16;
            }
            if (missingHull > 0) {
                this.#drawText(`Hull repair: ${hullCost} credits (${missingHull.toFixed(0)} points)`, centerX, y, UI_COLORS.TEXT_SECONDARY, UI_FONTS.SMALL);
                y += 16;
            }

            if (!canAfford) {
                this.#drawText(`Insufficient credits (need ${totalCost - game.player.credits} more)`, centerX, y, UI_COLORS.TEXT_COST, UI_FONTS.SMALL);
            }
        } else {
            this.repairButtonBounds = null;
            this.#drawText('Ship is fully repaired', centerX, y, UI_COLORS.TEXT_REWARD, UI_FONTS.SMALL);
        }
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
                    // Verify mission is still active before completing
                    if (game.missionManager.activeMissions.includes(completeBtn.mission) &&
                        completeBtn.mission.canComplete && completeBtn.mission.canComplete()) {
                        completeBtn.mission.complete();
                        // Remove from active missions immediately to update UI
                        const index = game.missionManager.activeMissions.indexOf(completeBtn.mission);
                        if (index > -1) {
                            game.missionManager.activeMissions.splice(index, 1);
                            game.missionManager.completedMissions.push(completeBtn.mission);
                        }
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

        // Check if click is on repair button (only if on station tab)
        if (this.currentTab === 'station' && this.repairButtonBounds) {
            const btn = this.repairButtonBounds;
            if (clickPos.x >= btn.x && clickPos.x <= btn.x + btn.width &&
                clickPos.y >= btn.y && clickPos.y <= btn.y + btn.height) {
                if (btn.canAfford) {
                    // Perform repair
                    game.player.credits -= btn.cost;
                    game.player.ship.shield = game.player.ship.maxShield;
                    game.player.ship.hull = game.player.ship.maxHull;
                    return true;
                }
            }
        }

        // Handle inventory/stash interactions on stash tab
        if (this.currentTab === 'stash') {
            // Check if click is on Stash All button
            if (this.stashButtonBounds.stashAll) {
                const btn = this.stashButtonBounds.stashAll;
                if (clickPos.x >= btn.x && clickPos.x <= btn.x + btn.width &&
                    clickPos.y >= btn.y && clickPos.y <= btn.y + btn.height) {
                    this.#stashAll();
                    return true;
                }
            }
            
            // Check if click is on Salvage button
            if (this.stashButtonBounds.salvage) {
                const btn = this.stashButtonBounds.salvage;
                if (clickPos.x >= btn.x && clickPos.x <= btn.x + btn.width &&
                    clickPos.y >= btn.y && clickPos.y <= btn.y + btn.height) {
                    // Track that salvage button was clicked, but don't toggle yet
                    this.salvageButtonClickStart = true;
                    return true;
                }
            }
            
            // If in salvage mode, handle salvage clicks
            // Skip if we're toggling salvage mode (button was just clicked)
            if (this.salvageMode && !this.salvageButtonClickStart) {
                // Store click position but don't salvage yet - wait for mouse up
                this.salvageClickStart = this.#getSalvageItemIndex(clickPos);
                return this.salvageClickStart !== null;
            }
            
            return this.inventoryGrid.handleMouseDown(clickPos, this.salvageMode);
        }

        return false;
    }

    handleStationDialogMouseUp(clickPos) {
        // Handle inventory/stash drag-and-drop on stash tab
        if (this.currentTab === 'stash') {
            // Check if mouse up is on Salvage button - toggle only if mouse down was also on it
            if (this.stashButtonBounds.salvage && this.salvageButtonClickStart) {
                const btn = this.stashButtonBounds.salvage;
                if (clickPos.x >= btn.x && clickPos.x <= btn.x + btn.width &&
                    clickPos.y >= btn.y && clickPos.y <= btn.y + btn.height) {
                    this.salvageMode = !this.salvageMode;
                    this.salvageClickStart = null;
                    this.salvageButtonClickStart = false;
                    return true;
                }
                this.salvageButtonClickStart = false;
                return false;
            }
            
            // If in salvage mode and we have a click start, check if mouse up is on same item
            if (this.salvageMode && this.salvageClickStart !== null) {
                const mouseUpIndex = this.#getSalvageItemIndex(clickPos);
                if (mouseUpIndex === this.salvageClickStart) {
                    // Mouse down and up on same item - execute salvage
                    const salvaged = this.#handleSalvageAtIndex(mouseUpIndex);
                    this.salvageClickStart = null;
                    if (salvaged) return true;
                }
                this.salvageClickStart = null;
                return false;
            }
            
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
        
        // Draw buttons
        const buttonWidth = 120;
        const buttonHeight = 30;
        const buttonSpacing = 10;
        const buttonsX = centerX - buttonWidth - buttonSpacing / 2;
        
        // Stash All button
        const stashAllX = buttonsX;
        this.stashButtonBounds.stashAll = { x: stashAllX, y: y, width: buttonWidth, height: buttonHeight };
        game.ctx.fillStyle = 'rgba(50, 150, 50, 0.5)';
        game.ctx.fillRect(stashAllX, y, buttonWidth, buttonHeight);
        game.ctx.strokeStyle = 'rgba(100, 200, 100, 0.8)';
        game.ctx.lineWidth = 2;
        game.ctx.strokeRect(stashAllX, y, buttonWidth, buttonHeight);
        game.ctx.fillStyle = 'white';
        game.ctx.font = 'bold 12px Arial';
        game.ctx.textAlign = 'center';
        game.ctx.fillText('Stash All', stashAllX + buttonWidth / 2, y + buttonHeight / 2 + 4);
        
        // Salvage button
        const salvageX = buttonsX + buttonWidth + buttonSpacing;
        this.stashButtonBounds.salvage = { x: salvageX, y: y, width: buttonWidth, height: buttonHeight };
        const salvageColor = this.salvageMode ? 'rgba(255, 100, 100, 0.7)' : 'rgba(150, 100, 50, 0.5)';
        const salvageBorder = this.salvageMode ? 'rgba(255, 150, 150, 1)' : 'rgba(200, 150, 100, 0.8)';
        game.ctx.fillStyle = salvageColor;
        game.ctx.fillRect(salvageX, y, buttonWidth, buttonHeight);
        game.ctx.strokeStyle = salvageBorder;
        game.ctx.lineWidth = 2;
        game.ctx.strokeRect(salvageX, y, buttonWidth, buttonHeight);
        game.ctx.fillStyle = 'white';
        game.ctx.fillText(this.salvageMode ? 'Salvage: ON' : 'Salvage', salvageX + buttonWidth / 2, y + buttonHeight / 2 + 4);
        
        y += buttonHeight + 20;
        
        // Show salvage instructions when active
        if (this.salvageMode) {
            this.#drawText('Click non-ore items to salvage for credits', centerX, y, UI_COLORS.TEXT_HIGHLIGHT, UI_FONTS.SMALL);
            y += 20;
        }
        
        // Draw quantum stash centered
        const stashX = dialogX + (dialogWidth - 250) / 2;
        this.inventoryGrid.drawStash(stashX, 250, y, this.salvageMode);
        
        // Draw dragged item on top
        if (this.inventoryGrid.draggedItem) {
            this.inventoryGrid.drawDraggedItem();
        }
    }
    
    #stashAll() {
        // Move all items from inventory to stash
        const itemsToMove = [...game.player.ship.inventory];
        game.player.ship.inventory = [];
        game.quantumStash.push(...itemsToMove);
        game.ui.messages.addMessage(`Stashed ${itemsToMove.length} items`);
    }
    
    #getSalvageItemIndex(clickPos) {
        // Get stash grid position
        const stashGrid = this.inventoryGrid.stashGrid;
        const relX = clickPos.x - stashGrid.x;
        const relY = clickPos.y - stashGrid.y;
        
        if (relX < 0 || relY < 0) return null;
        
        const cellSize = this.inventoryGrid.cellSize;
        const cellPadding = this.inventoryGrid.cellPadding;
        const col = Math.floor(relX / (cellSize + cellPadding));
        const row = Math.floor(relY / (cellSize + cellPadding));
        
        if (col >= stashGrid.cols || row >= stashGrid.rows) return null;
        
        // Check if actually inside the cell (not in padding)
        const cellX = relX % (cellSize + cellPadding);
        const cellY = relY % (cellSize + cellPadding);
        if (cellX >= cellSize || cellY >= cellSize) return null;
        
        const index = row * stashGrid.cols + col;
        if (index >= game.quantumStash.length) return null;
        
        return index;
    }
    
    #handleSalvageAtIndex(index) {
        if (index === null || index >= game.quantumStash.length) return false;
        
        const item = game.quantumStash[index];
        
        // Check if item is ore (don't allow salvaging ore)
        const oreNames = Object.keys(ORE);
        if (oreNames.includes(item.name)) {
            return false; // Ore items are not salvageable
        }
        
        // Salvage the item for credits
        const salvageValue = 10 + Math.floor(Math.random() * 20); // 10-30 credits
        game.player.credits += salvageValue;
        game.quantumStash.splice(index, 1);
        game.ui.messages.addMessage(`Salvaged ${item.name} for ${salvageValue} credits`);
        
        return true;
    }
}
