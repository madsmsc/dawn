export class Sounds {
    constructor() { }

    #make(src, volume = 0.07, loop = false) {
        const audio = new Audio('/client/static/' + src);
        audio.volume = volume;
        audio.loop = loop;
        return audio;
    }

    // TODO: shorten and loop? can probably save ~50% size
    laser1() {
        if (!this.laser1sound) { 
            this.laser1sound = this.#make('laser1.webm');
        }
        this.laser1sound.play();
    }

    laser7() {
        if (!this.laser7sound) {
            this.laser7sound = this.#make('laser7.webm');
        }
        this.laser7sound.play();
    }

    background() {
        if (!this.backgroundSound) {
            this.backgroundSound = this.#make('background.webm', 0.1, true);
        }
        this.backgroundSound.play().catch(err => {
            // browsers sometimes block autoplay. 
            // may need user interaction before playing
            console.warn('Background music failed to play: ', err);
        });
    }
}
