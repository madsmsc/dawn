import { game } from '../controllers/game.js';
import { SPRITE, MOVE } from '../../shared/Constants.js';
import { Destructable } from './Destructable.js';
import { Vec } from '../util/Vec.js';

export class Drone extends Destructable {
    constructor(ownerShip) {
        super();
        this.ownerShip = ownerShip;
        
        // Drone stats - smaller and weaker than main ship
        this.hull = 5;
        this.maxHull = 5;
        this.shield = 0;
        this.maxShield = 0;
        this.size = 5; // Much smaller than regular ships
        
        // Movement
        this.acceleration = 0.04;
        this.vel = 0;
        this.maxVel = 1; // Same speed as regular ships
        this.moveMode = MOVE.APPROACH;
        
        // Combat
        this.controlRange = 300; // Range within which drones can engage enemies
        this.attackRange = 120; // Range to start shooting
        this.scanRange = 350; // Range to detect enemies
        this.dam = 0.8; // 1/10th of player ship damage (8 * 0.1 = 0.8)
        this.attackTime = 800; // Fire every 800ms
        this.attackCount = 0;
        
        // Randomize orbit parameters for variety
        this.orbitRadius = 70 + Math.random() * 30; // Random orbit between 70-100
        this.orbitDir = Math.random() < 0.5 ? 1 : -1; // Random orbit direction
        
        // Spawn at owner's position
        this.pos = ownerShip.pos.clone();
        this.target = this.pos.clone();
        this.currentTarget = null; // Enemy currently engaging
        
        // Visual identification
        this.isDrone = true;
        this.angle = Math.random() * Math.PI * 2; // Random initial angle
    }
    
    update(delta) {
        super.update(delta);
        
        if (this.isDead) return this;
        
        this.attackCount += delta;
        
        // Find enemies within control range
        const instanceEnemies = game.system.currentInstance ? game.system.currentInstance.enemies : [];
        const aliveEnemies = instanceEnemies.filter(e => !e.isDead);
        const enemiesInRange = aliveEnemies.filter(e => {
            const dist = this.ownerShip.pos.clone().sub(e.pos).length();
            return dist < this.controlRange;
        });
        
        if (enemiesInRange.length > 0) {
            // Find closest enemy to this drone
            let closestEnemy = null;
            let closestDist = Infinity;
            
            enemiesInRange.forEach(e => {
                const dist = this.pos.clone().sub(e.pos).length();
                if (dist < closestDist) {
                    closestDist = dist;
                    closestEnemy = e;
                }
            });
            
            this.currentTarget = closestEnemy;
            this.target = closestEnemy.pos.clone();
            this.moveMode = MOVE.ORBIT;
            // Use the randomized orbit radius set in constructor
            
            // Attack if in range
            if (closestDist < this.attackRange && this.attackCount > this.attackTime) {
                this.attackCount = 0;
                this.shooting = true;
                closestEnemy.damage(this.dam);
            }
        } else {
            // No enemies in range - orbit around owner ship
            this.currentTarget = null;
            this.target = this.ownerShip.pos.clone();
            this.moveMode = MOVE.ORBIT;
            this.orbitRadius = 40;
        }
        
        return this;
    }
    
    draw() {
        // Draw a smaller ship sprite for drones
        game.ctx.save();
        
        // Position correctly
        game.ctx.translate(this.pos.x, this.pos.y);
        game.ctx.rotate(this.angle + Math.PI / 2.0);
        const off = this.size * 1.0;
        game.ctx.translate(-off, -off);
        
        // Draw a smaller version of the ship sprite
        game.sprites.draw(SPRITE.SHIP, new Vec(0, 0), false, undefined, false, 0.4);
        
        // Draw velocity vector if enabled
        if (game.player?.settings?.showVelocityVectors) {
            game.ctx.translate(off, 0);
            game.ctx.lineWidth = 1;
            game.ctx.globalAlpha = 0.3;
            game.ctx.strokeStyle = 'rgb(100, 255, 100)'; // Green for friendly drones
            game.ctx.beginPath();
            game.ctx.setLineDash([]);
            game.ctx.moveTo(0, 0);
            game.ctx.lineTo(0, -this.vel * 20);
            game.ctx.stroke();
            game.ctx.globalAlpha = 1.0;
        }
        
        game.ctx.restore();
        
        // Draw laser when shooting
        if (this.shooting) {
            if (this.attackCount > 300) { // Shorter laser duration
                this.shooting = false;
            } else {
                game.ctx.lineWidth = 2; // Thinner laser
                game.ctx.strokeStyle = 'rgba(100, 150, 255, 1)'; // Blue laser for drones
                game.ctx.globalAlpha = 1.0 - this.attackCount / 300.0;
                game.ctx.beginPath();
                game.ctx.moveTo(this.pos.x, this.pos.y);
                game.ctx.lineTo(this.target.x, this.target.y);
                game.ctx.stroke();
                game.ctx.globalAlpha = 1.0;
            }
        }
    }
    
    die() {
        super.die();
        // Drones can die but enemies don't target them currently
        console.log('Drone destroyed!');
    }
}
