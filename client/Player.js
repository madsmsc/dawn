export class Player {
    constructor(obj) {
        this.name = '';
        this.credits = 0;
        this.rep = 0;
        this.docked = undefined; // Station
        Object.assign(this, obj);
    }

    update (delta) {
        return this;
    }

    draw () { 

    }
}
