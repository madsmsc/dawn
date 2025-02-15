import { SPRITE, ORE } from '../shared/Constants.js';
import { Selectable } from './Selectable.js';
import { game } from './game.js';

export class Station extends Selectable {
    constructor (name, pos) {
        super();
        this.pos = pos;
        this.name = name;
        this.dockingRadius = 100;
        this.inventory = [];
        this.prices = {
            buy: {
                [ORE.Iron]: 50,
                [ORE.Ice]: 100,
                [ORE.Silicon]: 150,
                [ORE.Gold]: 200,
                [ORE.Titanium]: 300
            },
            sell: {
                [ORE.Iron]: 50/2,
                [ORE.Ice]: 100/2,
                [ORE.Silicon]: 150/2,
                [ORE.Gold]: 200/2,
                [ORE.Titanium]: 300/2

            }
        };
    }

    draw () {
        if (game.player.docked) return;
        super.draw();
        game.ctx.save();
        const p = {x: this.pos.x-20, y: this.pos.y-20};
        game.ui.drawIcon(SPRITE.STATION, p, false, undefined, false, 1);
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
    }

    missionsAtStation () {
        return game.missionManager.availableMissions.filter(m => m.station === this);
    }

    missionToAccept () {
        if (!game.player.docked) return undefined;
        const missions = this.missionsAtStation();
        if (!missions.length) return undefined;
        return missions[0];
    }

    acceptMission () {
        const mission = this.missionToAccept();
        if (!mission) return;
        game.missionManager.activeMissions.push(mission);
        game.missionManager.availableMissions.splice(0, 1);
        mission.start();
    }

    canDock () {
        return this.pos.sub(game.spaceship.pos).length() < this.dockingRadius;
    }
}
