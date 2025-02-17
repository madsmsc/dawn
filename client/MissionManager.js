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
        game.ctx.save();

        // Draw title
        game.ctx.fillStyle = 'white';
        game.ctx.font = 'bold 14px Arial';
        let yOffset = y + 70;
        game.ctx.fillText('Missions', x, yOffset);

        // Draw active missions
        game.ctx.font = '12px Arial';
        if (this.activeMissions.length === 0) {
            game.ctx.fillText('No active missions', x + 10, yOffset += 30);
        } else {
            this.activeMissions.forEach(mission => {
                game.ctx.fillStyle = 'white';
                game.ctx.font = '12px Arial';
                game.ctx.fillText(mission.description, x + 10, yOffset += 20);
                game.ctx.fillText(`Reward: ${mission.reward} credits`, x + 10, yOffset += 20);
                if (mission instanceof MiningMission && mission.canComplete()) {
                    game.ctx.fillStyle = 'yellow';
                    const str = game.player.docked ? '(N to complete)' : '(complete)';
                    game.ctx.fillText(str, x + 130, yOffset);
                }
                yOffset += 20
            });
        }
        game.ctx.restore();
    }
}
