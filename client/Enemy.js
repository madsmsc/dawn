export class Enemy extends Selectable {
    constructor() {
        super();
        this.vel = new Vec(Math.random() * 0.01 - 0.005, Math.random() * 0.01 - 0.005);
     }
    
    update = (delta) => {
        return this;
    };

    draw = () => {
        this.drawSelection();
    };
}
