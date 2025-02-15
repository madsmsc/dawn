export class Module {
    constructor(name, sprite = undefined, amount = 1, unit = 'units') {
        this.name = name;
        this.sprite = sprite;
        this.amount = amount;
        this.unit = unit;
    }
}
