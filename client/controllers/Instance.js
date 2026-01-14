import { Asteroid } from '../selectables/Asteroid.js';
import { Enemy } from '../destructables/Enemy.js';

/**
 * Instance represents a location in space with its own enemies and asteroids
 * Each warpable (station, gate) has its own instance
 */

// TODO: should warpable instead just have all this, instead of instance being an explicit class?
export class Instance {
    constructor(warpable, maxAsteroids = 5, maxEnemies = 4) {
        this.warpable = warpable; // The station or gate this instance is centered around
        this.maxAsteroids = Math.floor(Math.random() * 3) + 3; // Random 3-5 asteroids
        this.maxEnemies = maxEnemies;
        this.asteroids = [];
        this.enemies = [];
        this.isActive = false; // Track if player is currently at this instance
        this.initialSpawnComplete = false; // Track if initial spawn is done
        
        // Initialize enemies
        for (let i = 0; i < maxEnemies; i++) {
            this.enemies.push(Enemy.scanning());
        }
    }

    update(delta) {
        // Only spawn asteroids if initial spawn is not complete
        if (!this.initialSpawnComplete && this.asteroids.length < this.maxAsteroids) {
            this.asteroids.push(new Asteroid().moveAway());
            if (this.asteroids.length === 1 && this.enemies.length > 0) {
                this.enemies[0].pos = this.asteroids[0].pos.clone();
                this.enemies[0].target = this.asteroids[0].pos.clone();
            }
            
            // Mark initial spawn as complete when we reach max
            if (this.asteroids.length >= this.maxAsteroids) {
                this.initialSpawnComplete = true;
            }
        }
        
        this.asteroids.forEach(a => a.update(delta));
        this.enemies.forEach(e => e.update(delta));
        
        // Remove dead enemies after update (only remove, don't respawn while active)
        this.enemies = this.enemies.filter(e => !e.isDead);
        
        return this;
    }

    draw() {
        this.asteroids.forEach(a => a.draw());
        this.enemies.forEach(e => e.draw());
    }

    // Reset instance to full state when player leaves
    reset() {
        this.asteroids = [];
        this.enemies = [];
        this.initialSpawnComplete = false; // Allow respawn on next visit
        for (let i = 0; i < this.maxEnemies; i++) {
            this.enemies.push(Enemy.scanning());
        }
    }
}
