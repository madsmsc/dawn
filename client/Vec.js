export class Vec {
    // Static constants
    // TODO: freeze them
    static ZERO = new Vec(0, 0);
    static UP = new Vec(0, -1);
    static DOWN = new Vec(0, 1);
    static LEFT = new Vec(-1, 0);
    static RIGHT = new Vec(1, 0);

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    // TODO: should all these method change 'this' or return new?
    // probably more effecient to change this and let caller use clone() for new reference
    add (v) {
        this.x = this.x + v.x;
        this.y = this.y + v.y;
        return this;
    }

    addScalar (s) {
        this.x += s;
        this.y += s;
        return this;
    }

    sub (v) {
        return new Vec(
            this.x - v.x,
            this.y - v.y,
        );
    }

    scale (n) {
        return new Vec(
            this.x * n,
            this.y * n,
        );
    }

    length () {
        return Math.sqrt(
            this.x * this.x +
            this.y * this.y
        );
    }

    dist (v2) {
        const diff = new Vec(v2.x - this.x, v2.y - this.y);
        return diff.length();
    }

    normalize () {
        const len = this.length();
        if (len === 0) return new Vec();
        return this.scale(1 / len);
    }

    dot (v) {
        return this.x * v.x + this.y * v.y;
    }

    cross (v) {
        return this.x * v.y - this.y * v.x;
    }

    toString () {
        console.log('toString '+this.x+', '+this.y);
        return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
    }

    clone () {
        return new Vec(this.x, this.y);
    }

    setV (v2) {
        this.x = v2.x;
        this.y = v2.y;
    }

    set (x, y) {
        this.x = x;
        this.y = y;
    }

    equals (v) {
        return this.sub(v).length() === 0;
    }
}
