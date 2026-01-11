import { game } from '../controllers/game.js';
import { SPRITE, MOVE, MODULE, UI_COLORS, UI_FONTS } from '../../shared/Constants.js';
import { Destructable } from './Destructable.js';
import { Module } from '../modules/Module.js';

export class Enemy extends Destructable {
    constructor() {
        super();

        this.bounty = 25;
        this.rep = 5;
    }

    static orbiting () {
        const e = new Enemy();
        e.hull = 10;
        e.maxHull = 10;
        e.shield = 10;
        e.maxShield = 10;

        e.target = e.pos;
        e.moveMode = MOVE.ORBIT;
        e.orbitRadius = 100 + Math.random() * 40; // Random orbit 100-140
        e.scanRange = 0;
        return e;
    }

    static scanning () {
        const e = new Enemy();
        e.hull = 10;
        e.maxHull = 10;
        e.shield = 10;
        e.maxShield = 10;
        e.orbitRadius = 100 + Math.random() * 40; // Random orbit 100-140
        return e;
    }

    update (delta) {
        super.update(delta);

        if (this.isDead) return this;

        // Get first asteroid from current instance if available
        const instanceAsteroids = game.system.currentInstance ? game.system.currentInstance.asteroids : [];
        if (instanceAsteroids.length > 0) {
            this.target = instanceAsteroids[0].pos;
            this.moveMode = MOVE.ORBIT;
        }

        this.attackCount += delta;
        this.attack(this.scan());
        return this;
    }

    draw () {
        super.draw(SPRITE.SHIP);

        // Health bars above enemy
        const barWidth = 40;
        const barHeight = 4;
        const barSpacing = 6;
        const barX = this.pos.x - barWidth / 2;
        const barY = this.pos.y - 50;

        // Shield bar (blue)
        const shieldPercentage = (this.shield / this.maxShield) * 100;
        game.ctx.fillStyle = UI_COLORS.SHIELD_BG;
        game.ctx.fillRect(barX, barY, barWidth, barHeight);
        game.ctx.fillStyle = UI_COLORS.SHIELD_FILL;
        game.ctx.fillRect(barX, barY, (barWidth * shieldPercentage) / 100, barHeight);

        // Hull bar (red) - below shield bar
        const hullPercentage = (this.hull / this.maxHull) * 100;
        game.ctx.fillStyle = UI_COLORS.HULL_BG;
        game.ctx.fillRect(barX, barY + barHeight + barSpacing, barWidth, barHeight);
        game.ctx.fillStyle = UI_COLORS.HULL_FILL;
        game.ctx.fillRect(barX, barY + barHeight + barSpacing, (barWidth * hullPercentage) / 100, barHeight);

        // Enemy type label
        game.ctx.fillStyle = UI_COLORS.TEXT_WHITE;
        game.ctx.font = UI_FONTS.MEDIUM;
        game.ctx.textAlign = 'center';
        game.ctx.fillText(this.type, this.pos.x, this.pos.y - 30);
    }

    scan () { 
        if (this.pos.clone().sub(game.player.ship.pos).length() < this.scanRange) { 
            return game.player.ship.pos; 
        } 
    }

    attack (target) { 
        if (!target) {
            return;
        } 
        this.target = target; 
        if (this.pos.clone().sub(target).length() < this.attackRange) {
            this.shoot();
        } 
    }

    shoot () { 
        if (this.attackCount < this.attackTime) return;
        this.attackCount = 0;
        this.shooting = true; 
        const dam = Math.random() * this.dam; // TODO: too random 
        game.player.ship.damage(dam); 
    }

    die () {
        super.die();
        this.isDead = true;
        const rand = (max) => Math.floor(Math.random() * max); 
        const moduleAmount = rand(2) + 1; // drop 1-2 modules
        for (let i = 0; i < moduleAmount; i++) {
            const moduleTypeIndex = rand(5);
            const moduleTypeName = Object.keys(MODULE)[moduleTypeIndex];
            const moduleTierIndex = rand(5);
            const moduleTierName = MODULE[moduleTypeName][moduleTierIndex];
            const module = new Module(moduleTierName, undefined, 1, 'module');
            game.player.ship.inventory.push(module);
            game.ui.messages.addMessage(`Received: ${moduleTierName}`);
        }
        game.player.credits = this.bounty;
        game.player.rep = this.rep;
    }
}
