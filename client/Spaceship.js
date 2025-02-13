import { game } from './game.js';
import { Constants } from '../shared/Constants.js';
import { Vec } from './Vec.js';
import { Module } from './Module.js';

export class Spaceship {
    constructor(obj) {
        this.type = undefined; // string
        this.shield = undefined; // number
        this.maxShield = undefined; // number
        this.hull = undefined; // number
        this.maxHull = undefined; // number
        this.size = undefined; // number
        this.acceleration = undefined; // number
        this.vel = undefined; // Vec
        this.pos = undefined; // Vec
        this.target = undefined; // Vec
        this.miningRange = undefined; // number
        this.mode = undefined; // Constants.MOVE
        this.modules = undefined; // Module[]
        this.inventory = undefined; // Module[]

        Object.assign(this, obj);
        this.pos = new Vec(obj.pos.x, obj.pos.y);
        this.target = new Vec(obj.target.x, obj.target.y);
        this.vel = new Vec(obj.vel.x, obj.vel.y);
        // TODO: fix modules
    }

    update = (delta) => {
        this.move(delta);
        if (game.ui.k2down) this.mine();
        return this;
    };

    draw = () => {
        if(game.player.docked) return;
        game.ctx.save();
        // position correctly
        game.ctx.translate(this.pos.x, this.pos.y);
        game.ctx.rotate(this.angle + Math.PI/2.0);
        game.ctx.translate(-this.size*1.5, -this.size*1.5);
        // draw ship
        game.ui.drawIcon(Constants.SPRITE.SPACESHIP, { x: 0, y: 0 }, false, undefined, false, 1);
        // draw vector
        game.ctx.translate(this.size * 1.5, 0);
        game.ctx.beginPath();
        game.ctx.lineWidth = 3;
        game.ctx.setLineDash([]);
        game.ctx.strokeStyle = 'lightblue';
        game.ctx.moveTo(0, 0);
        const speed = this.vel; //.length();
        game.ctx.lineTo(0, -speed * 10);
        game.ctx.stroke();
        game.ctx.restore();
        game.ctx.lineWidth = 1;
    };

    move = (delta) => {
        if (this.mode === Constants.MOVE.APPROACH) {
            const dir = this.target.sub(this.pos);
            this.vel += this.acceleration * delta;
            if (dir.length() > this.size) {
                const normalizedDir = dir.normalize();
                // "REAL" PHYSICS
                // const scaledDir = normalizedDir.scale(this.acceleration * delta);
                // const slow = scaledDir.clone().scale(-0.5);
                // this.vel = this.vel.add(scaledDir);
                // this.pos = this.pos.add(slow).add(this.vel);
                // this.angle = Math.atan2(this.vel.y, this.vel.x);

                // FAKE PHYSICS
                this.pos = this.pos.add(normalizedDir.scale(this.vel));
                this.angle = Math.atan2(normalizedDir.y, normalizedDir.x);
            } else {
                this.vel = 0; //.set(0, 0);
            };

        } else if (this.mode === Constants.MOVE.ORBIT) {
            
        }
    };

    mine = () => {
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
                    const m = new Module(ore.type, Constants.SPRITE.MINE, ore.amount, 'kg');
                    this.inventory.push(m);
                }
            });  
        });
    };
}
