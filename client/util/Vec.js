export class Vec {
    // Static constants
    static ZERO = Object.freeze(new Vec(0, 0));
    static UP = Object.freeze(new Vec(0, -1));
    static DOWN = Object.freeze(new Vec(0, 1));
    static LEFT = Object.freeze(new Vec(-1, 0));
    static RIGHT = Object.freeze(new Vec(1, 0));

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    // mutable class! use clone to preverse original object.

    add(v) {
        this.x = this.x + v.x;
        this.y = this.y + v.y;
        return this;
    }

    addScalar(s) {
        this.x += s;
        this.y += s;
        return this;
    }

    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    scale(n) {
        this.x *= n;
        this.y *= n;
        return this;
    }

    length() {
        return Math.sqrt(
            this.x * this.x +
            this.y * this.y
        );
    }

    dist(v2) {
        const diff = new Vec(v2.x - this.x, v2.y - this.y);
        return diff.length();
    }

    normalize() {
        const len = this.length();
        if (len === 0) return this;
        this.x /= len;
        this.y /= len;
        return this;
    }

    toString() {
        return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
    }

    clone() {
        return new Vec(this.x, this.y);
    }

    setV(v2) {
        this.x = v2.x;
        this.y = v2.y;
    }

    set(x, y) {
        this.x = x;
        this.y = y;
    }
}
