import { game } from '../controllers/game.js';
import { SPRITE } from '../../shared/Constants.js';
import { Vec } from '../controllers/Vec.js';
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
        
        // Mining state
        this.miningTarget = null; // which asteroid we're mining
        this.miningProgress = 0; // 0-1 progress on current target
        this.miningDuration = 2000; // 2 seconds to mine an asteroid
    }

    update (delta) {
        // Player ship does not perform AI movement in Destructable.move (isPlayer === true)
        super.update(delta);
        this.attackCount += delta;
        
        // Mine if button exists and is pressed
        const mineButton = game.ui.buttons.find(b => b.key === '2');
        if (mineButton?.down) this.mine();
        
        // Fire if button exists and is pressed
        if (game.system.enemies && this.attackCount > this.attackTime) {
            const fireButton = game.ui.buttons.find(b => b.key === '1');
            if (fireButton?.down) {
                this.attackCount = 0;
                this.shooting = true; 
                game.system.enemies[0].damage(this.dam);
            }
        }
        
        // Update mining progress
        if (this.miningTarget) {
            const dist = this.pos.clone().sub(this.miningTarget.pos).length();
            const range = this.miningRange + this.miningTarget.size;
            
            if (dist > range) {
                // Out of range - cancel mining
                this.miningTarget = null;
                this.miningProgress = 0;
            } else {
                // Continue mining
                this.miningProgress += delta / this.miningDuration;
                
                if (this.miningProgress >= 1) {
                    // Mining complete - harvest the ore
                    const ores = this.miningTarget.mine();
                    const asteroidIndex = game.system.asteroids.indexOf(this.miningTarget);
                    if (asteroidIndex !== -1) {
                        game.system.asteroids.splice(asteroidIndex, 1);
                    }
                    
                    ores.forEach(ore => {
                        const oreModule = this.inventory.find(m => m.name === ore.type);
                        if (oreModule) {
                            oreModule.amount += ore.amount;
                        } else {
                            const m = new Module(ore.type, SPRITE.MINE, ore.amount, 'kg');
                            this.inventory.push(m);
                        }
                    });
                    
                    this.miningTarget = null;
                    this.miningProgress = 0;
                }
            }
        }
        
        return this;
    }

    draw () {
        if(game.player.docked) return;
        super.draw(SPRITE.SPACESHIP);
        
        // Draw mining progress bar if mining
        if (this.miningTarget && this.miningProgress > 0) {
            const barWidth = this.size * 2;
            const barHeight = 4;
            const barX = this.pos.x - barWidth / 2;
            const barY = this.pos.y - this.size - 10;
            
            game.ctx.fillStyle = '#333';
            game.ctx.fillRect(barX, barY, barWidth, barHeight);
            
            game.ctx.fillStyle = '#00ff00';
            game.ctx.fillRect(barX, barY, barWidth * this.miningProgress, barHeight);
            
            game.ctx.strokeStyle = '#00ff00';
            game.ctx.lineWidth = 1;
            game.ctx.strokeRect(barX, barY, barWidth, barHeight);
        }
    }

    mine () {
        // If already mining, continue current operation
        if (this.miningTarget) return;
        
        // Find an asteroid in mining range and target it
        game.system.asteroids.forEach((a) => {
            const dist = this.pos.clone().sub(a.pos).length();
            const range = this.miningRange + a.size;
            if (dist > range) return;
            
            // Target this asteroid if we haven't already
            if (!this.miningTarget) {
                this.miningTarget = a;
                this.miningProgress = 0;
            }
        });
    }

    die () {
        super.die();
        game.player.dead = true;
        console.log('YOU ARE DEAD!');
    }
}
