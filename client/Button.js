import { game } from './game.js';

export class Button {
    constructor(key, pos, icon, enabled = () => true) {
        this.key = key;
        this.pos = pos;
        this.icon = icon;
        this.enabled = enabled;
        this.down = false;
        this.up = false;
        this.show = false;

        this.onDraw = () => {};
        this.onClick = () => {};
    }

    keyDown() {
        if (!this.down && !this.up) { // show
            this.down = true;
            this.show = true;
        } else if (this.up) { // hide
            this.down = false;
            this.up = false;
            this.show = false;
        }
    }

    keyUp () {
        this.up = true;
    }

    click(clickPos) {
        if (this.pos && clickPos.dist(this.pos) < 40) {
            this.onClick();
        }
    }

    draw () {
        if (this.enabled() && this.show) {
            this.onDraw();
        }
        if (this.enabled() && this.icon && this.pos) {
            game.sprites.draw(this.icon, this.pos, this.down, this.key);
        }
    }
}