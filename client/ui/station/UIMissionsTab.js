import { game } from '../../controllers/game.js';
import { UIHelper } from '../UIHelper.js';
import { UI_COLORS, UI_FONTS } from '../../../shared/Constants.js';

export class UIMissionsTab {
    constructor() {
        this.missionBoxBounds = null;
        this.missionCompleteButtons = [];
    }

    draw(dialogX, yOffset, dialogWidth, dialogHeight) {
        let y = yOffset;
        const centerX = dialogX + dialogWidth / 2;

        // Title
        y = UIHelper.drawCenteredHeader('Mission Board', dialogWidth, y, dialogX);

        // Info text
        this.#drawText('Take on missions to earn credits and reputation', centerX, y, UI_COLORS.TEXT_PRIMARY, UI_FONTS.SMALL);
        y += 25;

        // Draw available mission
        const availableMissions = game.player.docked.missionsAtStation();
        const missionToShow = availableMissions.length > 0 ? availableMissions[0] : null;
        
        if (missionToShow && !game.missionManager.activeMissions.includes(missionToShow)) {
            const mission = missionToShow;
            const missionBoxHeight = 48;
            const missionBoxX = dialogX + 20;
            const buttonWidth = 80;
            const buttonHeight = missionBoxHeight;

            // Store bounds for click detection
            this.missionBoxBounds = {
                x: missionBoxX,
                y: y,
                width: dialogWidth - 40,
                height: missionBoxHeight,
                buttonX: missionBoxX + 10,
                buttonY: y,
                buttonWidth: buttonWidth,
                buttonHeight: buttonHeight
            };

            // Background and border
            game.ctx.fillStyle = UI_COLORS.BG_PANEL;
            game.ctx.fillRect(missionBoxX, y, dialogWidth - 40, missionBoxHeight);
            game.ctx.strokeStyle = UI_COLORS.BORDER;
            game.ctx.lineWidth = 1;
            game.ctx.strokeRect(missionBoxX, y, dialogWidth - 40, missionBoxHeight);

            // Accept button (left side, full height)
            const bounds = this.missionBoxBounds;
            game.ctx.fillStyle = 'rgba(50, 150, 50, 0.5)';
            game.ctx.fillRect(bounds.buttonX, bounds.buttonY, bounds.buttonWidth, bounds.buttonHeight);
            game.ctx.strokeStyle = 'rgba(100, 200, 100, 0.8)';
            game.ctx.lineWidth = 1;
            game.ctx.strokeRect(bounds.buttonX, bounds.buttonY, bounds.buttonWidth, bounds.buttonHeight);
            game.ctx.fillStyle = 'white';
            game.ctx.font = 'bold 12px Arial';
            game.ctx.textAlign = 'center';
            game.ctx.fillText('Accept', bounds.buttonX + bounds.buttonWidth / 2, bounds.buttonY + bounds.buttonHeight / 2 + 4);

            // Mission details (to the right of button)
            const textX = missionBoxX + buttonWidth + 25;
            this.#drawText(mission.description, textX, y + 18, UI_COLORS.TEXT_PRIMARY, UI_FONTS.SMALL, 'left');
            this.#drawText(`Reward: ${mission.reward} credits`, textX, y + 33, UI_COLORS.TEXT_REWARD, UI_FONTS.SMALL, 'left');

            y += missionBoxHeight + 8;
        } else {
            this.#drawText('No new missions available', centerX, y, UI_COLORS.TEXT_DISABLED, UI_FONTS.SMALL);
            y += 30;
        }

        // Draw active missions
        if (game.missionManager.activeMissions.length > 0) {
            y += 10;
            this.#drawText('Active Missions:', centerX, y, UI_COLORS.TEXT_SECONDARY, UI_FONTS.SMALL);
            y += 20;

            this.missionCompleteButtons = [];
            game.missionManager.activeMissions.forEach((mission) => {
                const missionBoxHeight = 48;
                const missionBoxX = dialogX + 20;
                const buttonWidth = 80;
                const buttonHeight = missionBoxHeight;

                // Background and border
                game.ctx.fillStyle = UI_COLORS.BG_PANEL;
                game.ctx.fillRect(missionBoxX, y, dialogWidth - 40, missionBoxHeight);
                game.ctx.strokeStyle = UI_COLORS.BORDER_BRIGHT;
                game.ctx.lineWidth = 1;
                game.ctx.strokeRect(missionBoxX, y, dialogWidth - 40, missionBoxHeight);

                // Complete button (left side, full height, if mission can be completed)
                if (mission.canComplete && mission.canComplete()) {
                    const buttonY = y;
                    
                    this.missionCompleteButtons.push({
                        x: missionBoxX + 10,
                        y: buttonY,
                        width: buttonWidth,
                        height: buttonHeight,
                        mission: mission
                    });

                    game.ctx.fillStyle = 'rgba(100, 200, 100, 0.5)';
                    game.ctx.fillRect(missionBoxX + 10, buttonY, buttonWidth, buttonHeight);
                    game.ctx.strokeStyle = 'rgba(150, 255, 150, 0.8)';
                    game.ctx.lineWidth = 1;
                    game.ctx.strokeRect(missionBoxX + 10, buttonY, buttonWidth, buttonHeight);
                    game.ctx.fillStyle = 'white';
                    game.ctx.font = 'bold 12px Arial';
                    game.ctx.textAlign = 'center';
                    game.ctx.fillText('Complete', missionBoxX + 10 + buttonWidth / 2, buttonY + buttonHeight / 2 + 4);
                }

                // Mission details (to the right of button)
                const textX = missionBoxX + buttonWidth + 25;
                this.#drawText(mission.description, textX, y + 18, UI_COLORS.TEXT_HIGHLIGHT, UI_FONTS.SMALL, 'left');
                this.#drawText(`Reward: ${mission.reward} credits`, textX, y + 33, UI_COLORS.TEXT_REWARD, UI_FONTS.SMALL, 'left');

                y += missionBoxHeight + 8;
            });
        }

        return y;
    }

    handleClick(clickPos) {
        // Check if click is on mission complete button
        if (this.missionCompleteButtons) {
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

        // Check if click is on mission accept button
        if (this.missionBoxBounds) {
            const bounds = this.missionBoxBounds;
            if (clickPos.x >= bounds.buttonX && clickPos.x <= bounds.buttonX + bounds.buttonWidth &&
                clickPos.y >= bounds.buttonY && clickPos.y <= bounds.buttonY + bounds.buttonHeight) {
                game.player.docked.acceptMission();
                return true;
            }
        }

        return false;
    }

    #drawText(text, x, y, color, font, align = 'center') {
        game.ctx.fillStyle = color;
        game.ctx.font = font;
        game.ctx.textAlign = align;
        game.ctx.fillText(text, x, y);
    }
}
