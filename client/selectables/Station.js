import { SPRITE, ORE, AFFIX } from '../../shared/Constants.js';
import { Selectable } from './Selectable.js';
import { game } from '../controllers/game.js';
import { Vec } from '../controllers/Vec.js';
import { Research } from '../modules/Research.js';

export class Station extends Selectable {
    constructor(name, pos) {
        super();
        this.pos = pos;
        this.name = name;
        this.dockingRadius = 100;
        this.inventory = [];
        this.prices = {
            buy: {
                [ORE.IRON]: 50,
                [ORE.ICE]: 100,
                [ORE.SILICON]: 150,
                [ORE.GOLD]: 200,
                [ORE.TITANIUM]: 300
            },
            sell: {
                [ORE.IRON]: 50 / 2,
                [ORE.ICE]: 100 / 2,
                [ORE.SILICON]: 150 / 2,
                [ORE.GOLD]: 200 / 2,
                [ORE.TITANIUM]: 300 / 2
            }
        };
    }

    update(delta) {
        // Stations are stationary; no movement or state updates needed
        return this;
    }

    draw() {
        if (game.player.docked) return;
        super.draw();
        game.ctx.save();
        const p = new Vec(this.pos.x - 20, this.pos.y - 20);
        game.sprites.draw(SPRITE.STATION, p, false, undefined, false, 1);
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

    drawResearch() {
        const available = Research.availableResearch();
        // draw box
        available.forEach((a) => {
            // draw square with abbreviation and cost
            // grey out the ones that you cannot afford
            // red out the ones that are not applicable to the item
            // 2 colored lines of text explaining the disabling
            // fix Name,Desc mouse-over.
        });
    }

    missionsAtStation() {
        return game.missionManager.availableMissions.filter(m => m.station === this);
    }

    missionToAccept() {
        if (!game.player.docked) return undefined;
        const missions = this.missionsAtStation();
        if (!missions.length) return undefined;
        return missions[0];
    }

    acceptMission() {
        const mission = this.missionToAccept();
        if (!mission) return;
        game.missionManager.activeMissions.push(mission);
        game.missionManager.availableMissions.splice(0, 1);
        mission.start();
    }

    canDock() {
        return this.pos.clone().sub(game.player.ship.pos).length() < this.dockingRadius;
    }

    startFit() {
        // show fitting dialog
        // and some way to put inventory modules into fitting
    }

    applyFit() {
        const ship = game.player.ship;
        // TODO: do not apply directly to fields
        // make modifiers so the "base ship values" are not changed
        // actually, maybe those should be inherited from the ship type
        // and the ships should not have their own totals?
        // but then the totals would have to be calculated each time?
        // maybe I do need the totals. but also the base. both?
        for(const module in ship.modules) {
            // apply effect of MODULE on ship
            // TODO: do something for constant.module like affix.
            const affixes = module.prefixes.concat(module.suffixes);
            for (const affix in affixes) {
                // apply effect of AFFIX on ship 
                if (affix[0] === AFFIX.DAMAGE.key) {
                    ship.dam *= AFFIX.DAMAGE.tier[affix[1]];
                } else if (affix[0] === AFFIX.SPEED.key) {
                    ship.maxVel *= AFFIX.DAMAGE.tier[affix[1]];
                    ship.acceleration *= AFFIX.DAMAGE.tier[affix[1]];
                } else if (affix[0] === AFFIX.ACCURACY.key) {
                    // add tracking
                    ship.miningRange = 11;
                }
            }
        }
    }
}
