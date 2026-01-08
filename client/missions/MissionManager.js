import { game } from '../controllers/game.js';
import { ORE } from '../../shared/Constants.js';
import { MiningMission } from './MiningMission.js';

export class MissionManager {
    constructor() {
        this.availableMissions = [];
        this.activeMissions = [];
        this.completedMissions = [];
        this.completeButtonBounds = []; // Track clickable complete buttons
    }

    generateNewMissions () {
        game.system.stations
            .filter(station => station.missionsAtStation().length < 3) // max 3 missions per station
            .filter(station => Math.random() < 0.3) // 30% chance per station
            .forEach(station => {
            const ores = Object.keys(ORE);
            const ore = ores[Math.floor(Math.random() * ores.length)];
            const amount = Math.floor(Math.random() * 10) + 5;  // 5-15 units
            const reward = amount * (ore === 'Gold' ? 100 : ore === 'Copper' ? 50 : 25);
            const mission = new MiningMission(station, ore, amount, reward);
            this.availableMissions.push(mission);
        });
    }

    update (delta) {
        this.activeMissions.forEach(mission => {
            mission.update(delta);
            if (mission.completed) {
                const index = this.activeMissions.indexOf(mission);
                this.activeMissions.splice(index, 1);
                this.completedMissions.push(mission);
            }
        });
        return this;
    }

    draw (x = 10, y = 110, width = 300) {
        game.ctx.save();
        game.ctx.textAlign = 'start';

        // Draw title
        game.ctx.fillStyle = 'white';
        game.ctx.font = 'bold 14px Arial';
        let yOffset = y + 70;
        game.ctx.fillText('Missions', x, yOffset);

        // Draw active missions
        game.ctx.font = '12px Arial';
        if (this.activeMissions.length === 0) {
            game.ctx.fillText('No active missions', x, yOffset += 30);
        } else {
            this.completeButtonBounds = [];
            this.activeMissions.forEach((mission, index) => {
                game.ctx.fillStyle = 'white';
                game.ctx.font = '12px Arial';
                game.ctx.fillText(mission.description, x, yOffset += 20);
                game.ctx.fillText(`Reward: ${mission.reward} credits`, x, yOffset += 20);
                
                const canComplete = mission.canComplete ? mission.canComplete() : false;
                if (mission instanceof MiningMission && canComplete) {
                    // Draw complete button
                    const buttonX = x + 150;
                    const buttonY = yOffset - 8;
                    const buttonWidth = 80;
                    const buttonHeight = 18;
                    
                    game.ctx.fillStyle = 'rgba(100, 255, 100, 0.8)';
                    game.ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
                    game.ctx.strokeStyle = 'rgba(50, 200, 50, 1)';
                    game.ctx.lineWidth = 1;
                    game.ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
                    game.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
                    game.ctx.font = 'bold 10px Arial';
                    game.ctx.textAlign = 'center';
                    game.ctx.fillText('Complete', buttonX + buttonWidth / 2, buttonY + 13);
                    game.ctx.textAlign = 'start'; // Reset alignment
                    
                    this.completeButtonBounds.push({
                        mission: mission,
                        x: buttonX,
                        y: buttonY,
                        width: buttonWidth,
                        height: buttonHeight
                    });
                }
                yOffset += 20
            });
        }
        game.ctx.restore();
    }

    handleCompleteClick(clickPos) {
        for (const btn of this.completeButtonBounds) {
            if (clickPos.x >= btn.x && clickPos.x <= btn.x + btn.width &&
                clickPos.y >= btn.y && clickPos.y <= btn.y + btn.height) {
                if (btn.mission.canComplete && btn.mission.canComplete()) {
                    btn.mission.complete();
                    return true;
                }
            }
        }
        return false;
    }
}