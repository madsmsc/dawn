import { game } from './game.js';
import { Vec } from './Vec.js';

export class Button {
    constructor(key, pos, icon, enabled = () => true) {
        this.key = key;
        this.pos = pos;
        this.icon = icon;
        this.enabled = enabled;
        this.down = false;
        this.up = false;

        this.onDraw = () => {};
        this.onClick = () => {};
    }

    keyDown() {
        this.#flip();
    }

    keyUp () {
        this.up = true;
    }

    click(clickPos) {
        if (this.pos && clickPos.dist(this.pos) < 40) {
            this.#flip();
            this.onClick();
        }
    }

    draw () {
        if (this.enabled() && this.down) {
            this.onDraw();
        }
        if (this.enabled() && this.icon && this.pos) {
            game.sprites.draw(this.icon, this.pos, this.down, this.key);
        }
    }

    #flip() {
        if (!down) {
            this.down = true;
            this.up = false;
            this.onClick();
        } else if (up) {
            this.down = false;
            this.up = false;
        }
    }
}