import { game } from './game.js';
import { ORE } from '../shared/Constants.js';
import { MiningMission } from './MiningMission.js';

export class MissionManager {
    constructor() {
        this.availableMissions = [];
        this.activeMissions = [];
        this.completedMissions = [];
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
        // Draw mission UI
        // TODO: should probably be conditional
        game.ctx.save();
        
        // Draw panel background
        // game.ctx.fillStyle = 'rgba(20, 20, 20, 0.9)';
        // game.ctx.strokeStyle = 'rgba(100, 100, 255, 0.8)';
        // ui.roundedRectExt(ctx, x, y, width, 400, 10);
        
        // Draw title
        game.ctx.fillStyle = 'white';
        game.ctx.font = 'bold 16px Arial';
        let yOffset = y + 90;
        game.ctx.fillText('Missions', x + 20, yOffset);

        // Draw active missions
        game.ctx.font = '12px Arial';
        if (this.activeMissions.length === 0) {
            game.ctx.fillText('No active missions', x + 20, yOffset += 30);
        } else {
            this.activeMissions.forEach(mission => {
                game.ctx.fillStyle = 'white';
                game.ctx.font = '14px Arial';
                game.ctx.fillText(mission.description, x + 20, yOffset += 40);
                if (mission instanceof MiningMission && mission.canComplete()) {
                    game.ctx.fillStyle = 'yellow';
                    game.ctx.fillText(`can be completed`, x + 20, yOffset += 20);
                    if (game.player.docked) {
                        // TODO: only show this for the first/top mission
                        game.ctx.fillText(`(N to complete)`, x + 150, yOffset);
                    }
                }
                game.ctx.fillText(`Reward: ${mission.reward} credits`, x + 20, yOffset += 20);
            });
        }
        game.ctx.restore();
    }
}
