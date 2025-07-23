import { game } from './game.js';
import { Selectable } from './Selectable.js';
import { SPRITE, ORE } from '../shared/Constants.js';

export class Asteroid extends Selectable {
    constructor() {
        super();

        this.rotationSpeed = Math.random() * 0.0008;
        this.rotation = Math.random() * Math.PI * 2;
    }

    moveAway () {
        const minDistance = 100;
        const entities = [...game.system.asteroids, game.player, game.spaceship, game.station];
        for (const entity of entities) {
            if (entity !== this) {
                if (!entity || !entity.pos) {
                    console.log('missing entity or pos');
                    continue;
                }
                const dx = this.pos.x - entity.pos.x;
                const dy = this.pos.y - entity.pos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < minDistance) {
                    // move this asteroid away
                    this.pos.x += (dx / distance) * (minDistance - distance);
                    this.pos.y += (dy / distance) * (minDistance - distance);
                }
            }
        }
        return this;
    }

    mine () {
        if (Math.random() < 0.5) { // 1 ore
            const amount = this.size * (1 + Math.random() * 0.2);
            return [{ type: this.randomOre(), amount }];
        } // 2 ores
        const amount = this.size * (1 + Math.random() * 0.2);
        const distribution = (Math.random()*60+20) / 100; // 20-80%
        return [{ type: this.randomOre(), amount: amount * distribution },
                { type: this.randomOre(), amount: amount * (1-distribution) }];
    }

    update (delta) {
        const rotation = this.rotation + this.rotationSpeed * delta;
        const clampedRotation = rotation % (Math.PI * 2);
        this.rotation = clampedRotation;
    }

    draw () {
        super.draw();
        game.ui.drawIcon(SPRITE.ASTEROID, this.pos, false,
            game.system.asteroids.indexOf(this), false, 1.5, this.rotation);
    }

    randomOre () {
        const oreTypes = Object.keys(ORE).length;
        const randomIndex = Math.floor(Math.random() * oreTypes);
        return Object.keys(ORE)[randomIndex];
    }
}
