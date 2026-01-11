import { game } from '../controllers/game.js';
import { ICON_SIZE } from '../../shared/Constants.js';

export class Button {
    constructor(key, pos, icon, enabled = () => true, tooltip = null) {
        this.key = key;
        this.pos = pos;
        this.icon = icon;
        this.enabled = enabled;
        this.tooltip = tooltip;
        this.down = false;
        this.up = false;
        this.show = false;

        this.onDraw = () => { };
        this.onClick = () => { };
    }

    isEnabled() {
        if (typeof this.enabled === 'function') return this.enabled();
        return !!this.enabled;
    }

    keyDown() {
        if (!this.isEnabled()) return;
        
        // Only toggle/close other UIs if this button has a UI dialog
        if (this.onDraw && this.onDraw.toString() !== '() => { }') {
            // If this button's UI is already shown, toggle it off
            if (this.show) {
                this.hideUI();
                return;
            }
            // Close any other open button UIs (only for UI buttons with dialogs)
            game.ui.buttons.forEach((b) => {
                if (b !== this && b.onDraw && b.onDraw.toString() !== '() => { }') {
                    b.hideUI();
                }
            });
        }
        
        // Toggle show state for all buttons (modules can be active simultaneously)
        this.show = !this.show;
        this.down = true;
        this.up = false;
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
        if (this.pos) {
            const centerX = this.pos.x + ICON_SIZE / 2;
            const centerY = this.pos.y + ICON_SIZE / 2;
            const distance = Math.sqrt((clickPos.x - centerX) ** 2 + (clickPos.y - centerY) ** 2);
            if (distance < ICON_SIZE / 2) {
                // Trigger the same behavior as keyboard press
                this.keyDown();
                this.onClick();
            }
        }
    }

    draw() {
        if (this.isEnabled() && (this.show || this.down)) {
            this.onDraw();
        }
        if (this.isEnabled() && this.icon && this.pos) {
            game.sprites.draw(this.icon, this.pos, this.show || this.down, this.key);
        }
    }
}