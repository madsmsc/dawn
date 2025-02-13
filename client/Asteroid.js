import { game } from './game.js';
import { Selectable } from './Selectable.js';
import { Constants } from '../shared/Constants.js';

export class Asteroid extends Selectable {
    constructor() {
        super();
        this.rotationSpeed = Math.random() * 0.0008;
        this.rotation = Math.random() * Math.PI * 2;
    }

    moveAway = () => {
        // TODO: check if the asteroid is too close to another asteroid
        // if so, move it away
        // also, check if the asteroid is too close to the player
        // if so, move it away
        // also, check if the asteroid is too close to the spaceship
        // if so, move it away
        // also, check if the asteroid is too close to the station
        // if so, move it away
        return this;
    };

    mine = () => {
        if (Math.random() < 0.5) { // 1 ore
            const amount = this.size * (1 + Math.random() * 0.2);
            return [{ type: this.randomOre(), amount }];
        } // 2 ores
        const amount = this.size * (1 + Math.random() * 0.2);
        const distribution = (Math.random()*60+20) / 100; // 20-80%
        return [{ type: this.randomOre(), amount: amount * distribution },
                { type: this.randomOre(), amount: amount * (1-distribution) }];
    }

    update = (delta) => {
        const rotation = this.rotation + this.rotationSpeed * delta;
        const clampedRotation = rotation % (Math.PI * 2);
        this.rotation = clampedRotation;
    };

    draw = () => {
        this.drawSelection();
        game.ui.drawIcon(Constants.SPRITE.ASTEROID, this.pos, false,
            game.system.asteroids.indexOf(this), false, 2, this.rotation);
    };

    randomOre = () => {
        const oreTypes = Object.keys(Constants.ORES).length;
        const randomIndex = Math.floor(Math.random() * oreTypes);
        return Object.keys(Constants.ORES)[randomIndex];
    }
}
