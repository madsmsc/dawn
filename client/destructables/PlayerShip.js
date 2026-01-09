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
        
        // Mine if button is toggled on
        const mineButton = game.ui.buttons.find(b => b.key === '2');
        if (mineButton?.show) this.mine();
        
        // Fire if button is toggled on
        const fireButton = game.ui.buttons.find(b => b.key === '1');
        const aliveEnemies = game.system.enemies?.filter(e => !e.isDead) || [];
        
        if (aliveEnemies.length > 0 && this.attackCount > this.attackTime) {
            if (fireButton?.show) {
                this.attackCount = 0;
                this.target = aliveEnemies[0].pos.clone();
                this.shooting = true; 
                aliveEnemies[0].damage(this.dam);
            }
        } else if (fireButton?.show && aliveEnemies.length === 0) {
            // No alive enemies left - toggle off weapon
            fireButton.show = false;
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
                    
                    // Toggle off mining button since asteroid is gone
                    const mineButton = game.ui.buttons.find(b => b.key === '2');
                    if (mineButton) mineButton.show = false;
                    
                    ores.forEach(ore => {
                        let remaining = ore.amount;
                        
                        // Try to add to existing stacks first
                        const existingStacks = this.inventory.filter(m => m.name === ore.type);
                        for (const stack of existingStacks) {
                            if (remaining <= 0) break;
                            const spaceInStack = stack.stackSize - stack.amount;
                            const toAdd = Math.min(remaining, spaceInStack);
                            stack.amount += toAdd;
                            remaining -= toAdd;
                        }
                        
                        // Add remaining ore as new stacks
                        while (remaining > 0) {
                            const amountForStack = Math.min(remaining, new Module(ore.type, SPRITE.MINE, 0, 'kg').stackSize);
                            const m = new Module(ore.type, SPRITE.MINE, amountForStack, 'kg');
                            this.inventory.push(m);
                            remaining -= amountForStack;
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
