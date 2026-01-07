import { game } from '../game/game.js';

export class Button {
    constructor(key, pos, icon, enabled = () => true) {
        this.key = key;
        this.pos = pos;
        this.icon = icon;
        this.enabled = enabled;
        this.down = false;
        this.up = false;
        this.show = false;

        this.onDraw = () => { };
        this.onClick = () => { };
    }

    keyDown() {
        if (!this.enabled()) return;
        // If this button's UI is already shown, toggle it off
        if (this.show) {
            this.hideUI();
            return;
        }
        // Close any other open button UIs
        game.ui.buttons.forEach((b) => {
            if (b !== this) b.hideUI()
        });
        this.down = true;
        this.up = false;
        this.show = true;
    }

    hideUI() {
        this.show = false;
        this.down = false;
        this.up = false;
    }

    keyUp() {
        this.down = false;
        this.up = true;
    }

    click(clickPos) {
        if (this.pos && clickPos.dist(this.pos) < 40) {
            this.onClick();
        }
    }

    draw() {
        if (this.enabled() && (this.show || this.down)) {
            this.onDraw();
        }
        if (this.enabled() && this.icon && this.pos) {
            game.sprites.draw(this.icon, this.pos, this.down, this.key);
        }
    }
}