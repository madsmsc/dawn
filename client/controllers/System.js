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
        this.stations.forEach(station => station.draw(ctx));
        this.warpables.forEach(w => w.draw(ctx));
        if (game.player.docked) return;
        this.asteroids.forEach(a => a.draw());
        this.enemies.forEach(e => e.draw());
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
