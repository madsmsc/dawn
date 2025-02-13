export class Player {
    constructor(obj) {
        this.name = undefined; // string
        this.credits = undefined; // number
        this.docked = undefined; // Station
        Object.assign(this, obj);
    }

    update = (delta) => {
        return this;
    };

    draw = () => { };
}
