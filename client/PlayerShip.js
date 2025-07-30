import { game } from './game.js';
import { SPRITE } from '../shared/Constants.js';
import { Vec } from './Vec.js';
import { Module } from './Module.js';
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
    }

    update (delta) {
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

        if (this.debug && this.targetCircle) { // draw target orbit circle
            game.ctx.strokeStyle = 'blue';
            game.ctx.beginPath();
            game.ctx.moveTo(this.targetCircle[0].x, this.targetCircle[0].y);
            this.targetCircle.forEach(p => {
                game.ctx.lineTo(p.x, p.y);
            });
            game.ctx.stroke();
        }
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
        game.player.dead = true;
        console.log('YOU ARE DEAD!');
    }
}
