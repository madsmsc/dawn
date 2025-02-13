import { game } from './game.js';
import { SPRITE, MOVE, MODULE } from '../shared/Constants.js';
import { Destructable } from './Ship.js';
import { Module } from './Module.js';

export class Enemy extends Destructable {
    constructor() {
        super();
    }

    static orbiting () {
        const e = new Enemy();
        e.hull = 10;
        e.maxHull = 10;
        e.shield = 10;
        e.maxShield = 10;

        e.target = e.pos;
        e.moveMode = MOVE.ORBIT;
        e.scanRange = 0;
        e.maxVel = 0.5;
        e.acceleration = 0.1;
        return e;
    }

    static scanning () {
        const e = new Enemy();
        e.hull = 10;
        e.maxHull = 10;
        e.shield = 10;
        e.maxShield = 10;
        
        e.maxVel = 2;
        e.acceleration = 0.1;
        return e;
    }

    update (delta) {
        super.update(delta);

        this.target = game.system.asteroids[0].pos;
        this.moveMode = MOVE.ORBIT;

        this.attackCount += delta;
        this.attack(this.scan());
        return this;
    }

    draw () {
        super.draw();
        game.ctx.save();
        const p = {x: this.pos.x-20, y: this.pos.y-20};
        game.ui.drawIcon(SPRITE.SHIP, p, false, undefined, false, 1);
        // Station name
        game.ctx.fillStyle = 'white';
        game.ctx.font = '14px Arial';
        game.ctx.textAlign = 'center';
        const str = `${this.type} [${this.shield}] [${this.hull}]`;
        game.ctx.fillText(str, this.pos.x, this.pos.y - 45);
        game.ctx.restore();
    }

    scan () { 
        if (this.pos.sub(game.spaceship.pos).length() < this.scanRange) { 
            return game.spaceship.pos; 
        } 
    }

    attack (target) { 
        if (!target) {
            return;
        } 
        this.target = target; 
        if (this.pos.sub(target).length() < this.attackRange) {
            this.shoot();
        } 
    }

    shoot () { 
        if (this.attackCount < this.attackTime) return;
        this.attackCount = 0;
        this.shooting = true; 
        const dam = Math.random() * this.damage; // TODO: too random 
        game.spaceship.damage(dam); 
    }

    die () {
        const rand = (max) => Math.floor(Math.random() * max); 
        const moduleAmount = rand(2) + 1; // drop 1-2 modules
        for (let i = 0; i < moduleAmount; i++) {
            const moduleTypeIndex = rand(5);
            const moduleTypeName = Object.keys(MODULE)[moduleTypeIndex];
            const moduleTierIndex = rand(5);
            const moduleTierName = MODULE[moduleTypeName][moduleTierIndex];
            const module = new Module(moduleTierName, undefined, 1, 'module');
            game.spaceship.inventory.push(module);
            console.log('enemy dropped module: ' + module.toString());
        }
        game.system.enemies.splice(game.system.enemies.indexOf(this), 1);
    }
}
