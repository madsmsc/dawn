import { Mission } from './Mission.js';

export class FightMission extends Mission {
    constructor(station, type, amount, reward) {
        const description = `Bring proof of shooting ${amount} ${type}s to ${station.name}`;
        super(description, station, reward);
        this.type = type;
        this.amount = amount;
        this.kills = 0;
    }

    canComplete () {
        return this.kills >= this.amount;
    }

    complete () {
        this.completeSuper();
    }
}