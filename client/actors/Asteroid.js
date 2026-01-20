import { game } from '../controllers/game.js';
import { SPRITE, ORE } from '../../shared/Constants.js';
import { Vec } from '../util/Vec.js';

export class Asteroid {
    constructor() {
        this.size = 2 + Math.random();
        this.pos = new Vec(400 - Math.random() * 200, 400 - Math.random() * 200)
        this.rotationSpeed = Math.random() * 0.0008;
        this.rotation = Math.random() * Math.PI * 2;
    }

    moveAway() {
        const minDistance = 100;
        const entities = [...game.system.currentInstance.asteroids, game.player, game.player.ship];
        for (const entity of entities) {
            if (entity == this || !entity || !entity.pos) continue;
            const dx = this.pos.x - entity.pos.x;
            const dy = this.pos.y - entity.pos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < minDistance) {
                // console.log('moving asteroid away');
                this.pos.x += (dx / distance) * (minDistance - distance);
                this.pos.y += (dy / distance) * (minDistance - distance);
            } else {
                // console.log('not moving asteroid');
            }
        }
        return this;
    }

    mine() {
        if (Math.random() < 0.5) { // 1 ore
            const amount = this.size * (1 + Math.random() * 0.2);
            return [
                {
                    type: this.randomOre(),
                    amount
                }
            ];
        } // 2 ores
        const amount = this.size * (1 + Math.random() * 0.2);
        const distribution = (Math.random() * 60 + 20) / 100; // 20-80%
        return [
            {
                type: this.randomOre(),
                amount: amount * distribution
            },
            {
                type: this.randomOre(),
                amount: amount * (1 - distribution)
            }
        ];
    }

    update(delta) {
        const rotation = this.rotation + this.rotationSpeed * delta;
        const clampedRotation = rotation % (Math.PI * 2);
        this.rotation = clampedRotation;
    }

    draw() {
        const instanceAsteroids = game.system.currentInstance ? game.system.currentInstance.asteroids : [];
        const spriteIndex = instanceAsteroids.indexOf(this);
        game.sprites.draw(SPRITE.ASTEROID, this.pos, false,
            spriteIndex >= 0 ? spriteIndex : 0, false, this.size, this.rotation);
    }

    randomOre() {
        const oreTypes = Object.keys(ORE).length;
        const randomIndex = Math.floor(Math.random() * oreTypes);
        return Object.keys(ORE)[randomIndex];
    }
}
