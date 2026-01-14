import { game } from '../controllers/game.js';
import { SPRITE, RARITY } from '../../shared/Constants.js';
import { Vec } from '../util/Vec.js';
import { Module } from '../modules/Module.js';
import { Destructable } from './Destructable.js';
import { Drone } from './Drone.js';

export class PlayerShip extends Destructable {
    constructor(obj) {
        super();
        // load from DB
        Object.assign(this, obj);
        // convert to vectors
        this.pos = new Vec(obj.pos.x, obj.pos.y);
        this.target = new Vec(obj.target.x, obj.target.y);

        // Convert modules to Module instances
        if (this.modules) {
            this.modules = this.modules.map(m => {
                const module = new Module(m.name, m.sprite, m.amount, m.unit, m.rarity);
                // Copy any other properties like prefixes/suffixes
                if (m.prefixes) module.prefixes = m.prefixes;
                if (m.suffixes) module.suffixes = m.suffixes;
                return module;
            });
        }

        // Convert inventory to Module instances
        if (this.inventory) {
            this.inventory = this.inventory.map(m => {
                const module = new Module(m.name, m.sprite, m.amount, m.unit, m.rarity);
                if (m.prefixes) module.prefixes = m.prefixes;
                if (m.suffixes) module.suffixes = m.suffixes;
                return module;
            });
        }

        this.miningRange = 22; // TODO: should be a function of the mining module equipped
        this.dam = 4; // override dam, 2x the enemy

        // mark as player-controlled so AI movement is skipped in Destructable.move
        this.isPlayer = true;
        // velocity vector for directional movement (WASD)
        this.velVec = new Vec(0, 0);
        
        // Mining state
        this.miningTarget = null; // which asteroid we're mining
        this.miningProgress = 0; // 0-1 progress on current target
        this.miningDuration = 2000; // 2 seconds to mine an asteroid
        
        // Drone state
        this.drones = []; // Active drones
        this.maxDrones = 3; // Maximum number of drones
    }

    update (delta) {
        // Player ship does not perform AI movement in Destructable.move (isPlayer === true)
        super.update(delta);
        this.attackCount += delta;
        
        // Update drones
        this.updateDrones(delta);
        
        // Mine if button is toggled on
        const mineButton = game.ui.buttons.find(b => b.key === '2');
        if (mineButton?.show) this.mine();
        
        // Fire if button is toggled on
        const fireButton = game.ui.buttons.find(b => b.key === '1');
        const instanceEnemies = game.system.currentInstance ? game.system.currentInstance.enemies : [];
        const aliveEnemies = instanceEnemies.filter(e => !e.isDead);
        
        if (aliveEnemies.length > 0 && this.attackCount > this.attackTime) {
            if (fireButton?.show) {
                this.attackCount = 0;
                this.target = aliveEnemies[0].pos.clone();
                this.shooting = true;
                const audio = new Audio('client/static/laser1.wav');
                audio.volume = 0.1;
                audio.play();
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
                    const instanceAsteroids = game.system.currentInstance ? game.system.currentInstance.asteroids : [];
                    const asteroidIndex = instanceAsteroids.indexOf(this.miningTarget);
                    if (asteroidIndex !== -1) {
                        instanceAsteroids.splice(asteroidIndex, 1);
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
                        
                        // Show message about mined ore
                        game.ui.messages.addMessage(`Mined: ${ore.amount.toFixed(0)} kg ${ore.type}`);
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
        
        // Draw mining laser when actively mining
        if (this.miningTarget) {
            game.ctx.lineWidth = 4; // Thicker laser for mining
            game.ctx.strokeStyle = 'rgba(50, 255, 50, 0.8)'; // Green laser
            game.ctx.globalAlpha = 0.6 + Math.sin(Date.now() / 100) * 0.2; // Pulsing effect
            game.ctx.beginPath();
            game.ctx.moveTo(this.pos.x, this.pos.y);
            game.ctx.lineTo(this.miningTarget.pos.x, this.miningTarget.pos.y);
            game.ctx.stroke();
            game.ctx.globalAlpha = 1.0;
        }
        
        // Draw drones
        this.drones.forEach(drone => {
            if (!drone.isDead) drone.draw();
        });
    }

    mine () {
        // If already mining, continue current operation
        if (this.miningTarget) return;
        
        // Find an asteroid in mining range and target it
        const instanceAsteroids = game.system.currentInstance ? game.system.currentInstance.asteroids : [];
        instanceAsteroids.forEach((a) => {
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
    
    updateDrones(delta) {
        const droneButton = game.ui.buttons.find(b => b.key === '4');
        
        // Deploy drones if button is active and we don't have full complement
        if (droneButton?.show && this.drones.length < this.maxDrones) {
            this.deployDrones();
        }
        
        // Recall drones if button is toggled off
        if (droneButton && !droneButton.show && this.drones.length > 0) {
            this.recallDrones();
        }
        
        // Update all active drones
        this.drones.forEach(drone => {
            if (!drone.isDead) {
                drone.update(delta);
            }
        });
        
        // Remove dead drones
        this.drones = this.drones.filter(d => !d.isDead);
    }
    
    deployDrones() {
        // Deploy remaining drones up to max
        while (this.drones.length < this.maxDrones) {
            const drone = new Drone(this);
            // Spread drones randomly around the ship for chaotic movement
            const angle = Math.random() * Math.PI * 2;
            const spawnDist = 25;
            drone.pos.x = this.pos.x + Math.cos(angle) * spawnDist;
            drone.pos.y = this.pos.y + Math.sin(angle) * spawnDist;
            // Give each drone a random initial velocity direction
            drone.angle = angle;
            this.drones.push(drone);
        }
    }
    
    recallDrones() {
        // Clear all drones (they disappear)
        this.drones = [];
    }
}
