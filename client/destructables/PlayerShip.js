import { game } from '../game/game.js';
import { SPRITE } from '../../shared/Constants.js';
import { Vec } from '../util/Vec.js';
import { Module } from '../modules/Module.js';
import { Destructable } from './Destructable.js';

export class PlayerShip extends Destructable {
    constructor(obj) {
        super();
        // load from DB
        Object.assign(this, obj);
        // convert to vectors
        this.pos = new Vec(obj.pos.x, obj.pos.y);
        this.target = new Vec(obj.target.x, obj.target.y);

        this.miningRange = 11; // TODO: should be a function of the mining module equipped
        this.dam = 8; // override dam, 4x the enemy
        // TODO: for testing
        this.maxVel = 2;
        this.acceleration = 0.05;

        // mark as player-controlled so AI movement is skipped in Destructable.move
        this.isPlayer = true;
        // velocity vector for directional movement (WASD)
        this.velVec = new Vec(0, 0);
    }

    update (delta) {
        // Player ship does not perform AI movement in Destructable.move (isPlayer === true)
        super.update(delta);
        this.attackCount += delta;
        if (game.ui.k2down) this.mine();
        if (game.ui.k3down && game.system.enemies && this.attackCount > this.attackTime) {
            this.attackCount = 0;
            this.shooting = true; 
            game.system.enemies[0].damage(this.dam);
        }
        return this;
    }

    draw () {
        if(game.player.docked) return;
        super.draw(SPRITE.SPACESHIP);
    }

    mine () {
        // TODO: find() instead of forEach()
        // so ores.forEach is not nested
        // and so that you only mine one asteroid at a time
        game.system.asteroids.forEach((a, i) => {
            const dist = this.pos.sub(a.pos).length();
            const range = this.miningRange + a.size;
            if (dist > range) return;
            game.system.asteroids.splice(i, 1);
            const ores = a.mine(); // [{ type, amount }, ...]
            ores.forEach(ore => {
                const oreModule = this.inventory.find(m => m.name === ore.type);
                if (oreModule) {
                    oreModule.amount += ore.amount;
                } else {
                    const m = new Module(ore.type, SPRITE.MINE, ore.amount, 'kg');
                    this.inventory.push(m);
                }
            });  
        });
    }

    die () {
        super.die();
        game.player.dead = true;
        console.log('YOU ARE DEAD!');
    }
}
