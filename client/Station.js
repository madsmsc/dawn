import { Constants } from '../shared/Constants.js';
import { Selectable } from './Selectable.js';
import { game } from './game.js';

export class Station extends Selectable {
    constructor (name, pos) {
        super();
        this.name = name;
        this.pos = pos;
        this.dockingRadius = 100;
        this.inventory = [];
        this.prices = {
            buy: {
                [Constants.ORES.Iron]: 50,
                [Constants.ORES.Ice]: 100,
                [Constants.ORES.Silicon]: 150,
                [Constants.ORES.Gold]: 200,
                [Constants.ORES.Titanium]: 300
            },
            sell: {
                [Constants.ORES.Iron]: 50/2,
                [Constants.ORES.Ice]: 100/2,
                [Constants.ORES.Silicon]: 150/2,
                [Constants.ORES.Gold]: 200/2,
                [Constants.ORES.Titanium]: 300/2

            }
        };
    }

    draw = () => {
        if (game.player.docked) return;
        this.drawSelection();
        game.ctx.save();
        // Draw station
        game.ctx.fillStyle = 'rgba(150, 150, 200, 1)';
        game.ctx.strokeStyle = 'rgba(200, 200, 255, 0.8)';
        game.ctx.lineWidth = 2;
        // Main body
        game.ctx.beginPath();
        game.ctx.rect(this.pos.x - 30, this.pos.y - 30, 60, 60);
        game.ctx.fill();
        game.ctx.stroke();
        // Docking area indicator
        game.ctx.strokeStyle = 'rgba(100, 100, 255, 0.3)';
        game.ctx.beginPath();
        game.ctx.arc(this.pos.x, this.pos.y, this.dockingRadius, 0, Math.PI * 2);
        game.ctx.stroke();
        // Station name
        game.ctx.fillStyle = 'white';
        game.ctx.font = '14px Arial';
        game.ctx.textAlign = 'center';
        game.ctx.fillText(this.name, this.pos.x, this.pos.y - 45);
        game.ctx.restore();
    };

    missionsAtStation = () => {
        return game.missionManager.availableMissions.filter(m => m.station === this);
    };

    missionToAccept = () => {
        if (!game.player.docked) return undefined;
        const missions = this.missionsAtStation();
        if (!missions.length) return undefined;
        return missions[0];
    };

    acceptMission = () => {
        const mission = this.missionToAccept();
        if (!mission) return;
        game.missionManager.activeMissions.push(mission);
        game.missionManager.availableMissions.splice(0, 1);
        mission.start();
    };

    canDock = () => this.pos.sub(game.spaceship.pos).length() < this.dockingRadius;
}
