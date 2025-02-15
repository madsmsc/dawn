import { Mission } from './Mission.js';
import { game } from './game.js';

export class MiningMission extends Mission {
    constructor(station, requiredOre, amount, reward) {
        const description = `Deliver ${amount} units of ${requiredOre} to ${station.name}`;
        super(description, station, reward);
        this.requiredOre = requiredOre;
        this.amount = amount;
    }

    canComplete () {
        return game.spaceship.inventory
            .find(item => item.name === this.requiredOre && item.amount >= this.amount);
    }

    complete () {
        this.completeSuper();
        const cargo = this.canComplete();
        // Transfer ore from ship to station
        cargo.amount -= this.amount;
        // Remove cargo item if empty
        if (cargo.amount <= 0) {
            const index = game.spaceship.inventory.indexOf(cargo);
            game.spaceship.inventory.splice(index, 1);
        }
    }
    
    update (delta) {
        super.update(delta);
    }
}
