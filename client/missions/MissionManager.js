import { game } from '../controllers/game.js';
import { ORE, UI_COLORS, UI_FONTS } from '../../shared/Constants.js';
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
        game.ctx.fillStyle = UI_COLORS.TEXT_WHITE;
        game.ctx.font = UI_FONTS.HEADER;
        let yOffset = y + 70;
        game.ctx.fillText('Missions', x, yOffset);

        // Draw active missions
        game.ctx.font = UI_FONTS.SMALL;
        if (this.activeMissions.length === 0) {
            game.ctx.fillText('No active missions', x, yOffset += 30);
        } else {
            this.activeMissions.forEach((mission, index) => {
                game.ctx.fillStyle = UI_COLORS.TEXT_WHITE;
                game.ctx.font = UI_FONTS.SMALL;
                game.ctx.fillText(mission.description, x, yOffset += 20);
                
                // Show reward with (complete) indicator if mission can be completed
                const canComplete = mission.canComplete ? mission.canComplete() : false;
                game.ctx.fillText(`Reward: ${mission.reward} credits`, x, yOffset += 20);
                
                if (canComplete) {
                    game.ctx.fillStyle = UI_COLORS.TEXT_REWARD;
                    game.ctx.fillText(' (complete)', x + game.ctx.measureText(`Reward: ${mission.reward} credits`).width, yOffset);
                }
                
                yOffset += 20
            });
        }
        game.ctx.restore();
    }
}