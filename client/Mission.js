import { game } from './game.js';

export class Mission {
    constructor(description, station, reward) {
        this.description = description;
        this.station = station;
        this.reward = reward;
        this.completed = false;
        this.active = false;
    }

    start () {
        this.active = true;
    }

    completeSuper () {
        this.completed = true;
        this.active = false;
        game.player.credits += this.reward;
    }

    update (delta) {

    }
}
