import { game } from './game.js';
import { Asteroid } from './Asteroid.js';

// TODO: currently warping between systems
// instead, warp between warpables in system
// and use gates to connect systems
export class System {
    constructor(name, color, stations) {
        this.name = name;
        this.color = color;
        this.maxAsteroids = 5;
        this.asteroids = [];
        this.stations = stations;
        this.connections = [];
    }

    update = (delta) => {
        if (this.asteroids.length < this.maxAsteroids) {
            this.asteroids.push(new Asteroid().moveAway());
        }
        this.asteroids.forEach(a => a.update(delta));
        return this;
    };

    draw = (ctx) => {
        this.stations
            .filter(station => station.canDock())
            .forEach(station => {
            // Show docking indicator or enable docking menu
            this.showDockingPrompt(station);
        });
        this.stations.forEach(station => station.draw(ctx));
        if(game.player.docked) return;
        this.asteroids.forEach(a => a.draw());
    };

    // Draw docking prompt when ship is in range
    showDockingPrompt = (station) => {   
        game.ctx.save();
        game.ctx.fillStyle = 'grey';
        game.ctx.font = '12px Arial';
        game.ctx.textAlign = 'center';
        game.ctx.fillText(`Press F to dock`, 
                    station.pos.x, 
                    station.pos.y - 60);
        game.ctx.restore();
    };

    handleDocking = () => {
        if (game.player.docked) {
            game.player.docked = undefined;
            return;
        }
        const stationToDock = this.stations.find(s => s.canDock());
        if (stationToDock) {
            game.player.docked = stationToDock;
        }
    };
}
