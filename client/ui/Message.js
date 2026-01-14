export class Message {
    constructor(text, duration = 6000) {
        this.text = text;
        this.duration = duration;
        this.age = 0;
        this.alpha = 1.0;
    }

    update(delta) {
        this.age += delta;
        this.alpha = 1.0 - (this.duration - this.age);
        return this;
    }
}
