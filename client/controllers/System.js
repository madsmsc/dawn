import { game } from './game.js';
import { Asteroid } from '../selectables/Asteroid.js';
import { Enemy } from '../destructables/Enemy.js';

export class System {
    constructor(name, color, stations, warpables = []) {
        this.name = name;
        this.color = color;
        this.maxAsteroids = 5;
        this.asteroids = [];
        this.stations = stations;
        this.warpables = warpables; // stations, planets, sun, gates - all things you can warp to
        this.enemies = [Enemy.scanning()];
    }

    // TODO: make the buttons that are toggled more clear - much darker color
    // untoggle all buttons when docking
    // enable using all modules at the same time. so shoot, mine, warp, etc...
    // shooting does show the right direction and give the laser a unique color - purple?

    update(delta) {
        // always 'maxAsteroids' number of asteroids
        if (this.asteroids.length < this.maxAsteroids) {
            this.asteroids.push(new Asteroid().moveAway());
            if (this.asteroids.length === 1) {
                this.enemies[0].pos = this.asteroids[0].pos.clone();
                this.enemies[0].target = this.asteroids[0].pos.clone();
            }
        }
        this.asteroids.forEach(a => a.update(delta));
        this.enemies.forEach(e => e.update(delta));
        this.warpables.forEach(w => w.update(delta));
        return this;
    }

    draw() {
        this.stations
            .filter(station => station.canDock())
            .forEach(station => {
                // Show docking indicator or enable docking menu
                this.#showDockingPrompt(station);
            });
        
        // Only show warp prompt for closest gate if no station is in docking range
        const hasDockableStation = this.stations.some(s => s.canDock());
        if (!hasDockableStation) {
            const closestGate = this.#getClosestGateInRange();
            if (closestGate) {
                this.#showWarpPrompt(closestGate);
            }
        }
        
        this.stations.forEach(station => station.draw());
        this.warpables.forEach(w => w.draw());
        if (game.player.docked) return;
        this.asteroids.forEach(a => a.draw());
        this.enemies.forEach(e => e.draw());
        
        // Remove dead enemies after they've been drawn (particles rendered)
        this.enemies = this.enemies.filter(e => !e.isDead);
    }

    #showDockingPrompt(station) {
        game.ctx.save();
        game.ctx.fillStyle = 'grey';
        game.ctx.font = '12px Arial';
        game.ctx.textAlign = 'center';
        game.ctx.fillText(`Press E to dock`,
            station.pos.x,
            station.pos.y - 60);
        game.ctx.restore();
    }

    #getClosestGateInRange() {
        let closestGate = null;
        let closestDist = 150;
        
        this.warpables.forEach(w => {
            if (w.targetSystem) {
                const dist = game.player.ship.pos.clone().sub(w.pos).length();
                if (dist < closestDist) {
                    closestDist = dist;
                    closestGate = w;
                }
            }
        });
        
        return closestGate;
    }

    #showWarpPrompt(gate) {
        game.ctx.save();
        game.ctx.fillStyle = '#555555';
        game.ctx.font = '12px Arial';
        game.ctx.textAlign = 'center';
        game.ctx.fillText(`Press E jump`,
            gate.pos.x,
            gate.pos.y - 45);
        game.ctx.restore();
    }

    handleDocking() {
        if (game.player.docked) {
            game.player.docked = undefined;
            return;
        }
        const stationToDock = this.stations.find(s => s.canDock());
        if (stationToDock) {
            game.player.docked = stationToDock;
        }
    }
}
