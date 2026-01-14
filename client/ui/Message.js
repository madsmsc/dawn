export class Message {
    constructor(text, duration = 6000) {
        this.text = text;
        this.duration = duration;
        this.age = 0;
        this.alpha = 1.0;
    }

    update(delta) {
        this.age += delta;

        // Start fading in the last 500ms
        const fadeStart = this.duration - 500;
        if (this.age > fadeStart) {
            this.alpha = 1.0 - (this.age - fadeStart) / 500;
        }

        return this.age >= this.duration;
    }
}
