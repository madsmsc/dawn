export class Vec {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add = (v) => {
        return new Vec(
            this.x + v.x,
            this.y + v.y,
        );
    };

    sub = (v) => {
        return new Vec(
            this.x - v.x,
            this.y - v.y,
        );
    };

    scale = (n) => {
        return new Vec(
            this.x * n,
            this.y * n,
        );
    };

    length = () => {
        return Math.sqrt(
            this.x * this.x +
            this.y * this.y
        );
    };

    normalize = () => {
        const len = this.length();
        if (len === 0) return new Vec();
        return this.scale(1 / len);
    };

    dot = (v) => {
        return this.x * v.x + this.y * v.y;
    };

    cross = (v) => {
        return this.x * v.y - this.y * v.x;
    };

    toString = () => {
        return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
    };

    clone = () => {
        return new Vec(this.x, this.y);
    };

    set = (x, y) => {
        this.x = x;
        this.y = y;
    };
}
