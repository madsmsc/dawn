import { game } from '../controllers/game.js';
import { ICON_SIZE, UI_COLORS, UI_FONTS } from '../../shared/Constants.js';

export class Sprites {
    constructor() {
        this.sprites = [];
        this.#loadSprites();
    }

    draw(spriteIndex, pos, selected = false, text = undefined,
        outline = true, scale = 1, rotation = 0) {
        const sprite = this.sprites[spriteIndex];
        if (!sprite) return;
        const size = ICON_SIZE * scale;
        if (selected) game.ctx.globalAlpha = 0.5;
        if (rotation !== 0) {
            game.ctx.save();
            game.ctx.translate(pos.x, pos.y);
            game.ctx.rotate(rotation);
            game.ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
            game.ctx.restore();
        } else {
            game.ctx.drawImage(sprite, pos.x, pos.y, size, size);
        }
        if (outline) {
            game.ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)';
            game.ctx.strokeRect(pos.x, pos.y, ICON_SIZE, ICON_SIZE);
        }
        if (text !== undefined) {
            game.ctx.font = UI_FONTS.SMALL;
            game.ctx.fillStyle = 'black';
            game.ctx.fillText(text, pos.x + 1, pos.y + 5);
            game.ctx.fillText(text, pos.x - 1, pos.y + 4);
            game.ctx.fillStyle = UI_COLORS.TEXT_WHITE;
            game.ctx.fillText(text, pos.x, pos.y + 4);
        }
        game.ctx.globalAlpha = 1;
    }

    // TODO: when replacing icons, the links/references can be removed.
    #loadSprites() {
        const spriteSheet = new Image();
        // icons from:
        // https://game-icons.net/
        // https://icons8.com/
        // https://www.flaticon.com/
        spriteSheet.src = 'client/icons.png';
        spriteSheet.onload = () => {
            const columns = spriteSheet.width / ICON_SIZE;
            const rows = spriteSheet.height / ICON_SIZE;

            // Create a temporary canvas to extract sprites
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = ICON_SIZE;
            tempCanvas.height = ICON_SIZE;
            this.#extractSprite(columns, rows, tempCtx, spriteSheet, tempCanvas);
        };
    }

    #extractSprite(columns, rows, tempCtx, spriteSheet, tempCanvas) {
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                tempCtx.clearRect(0, 0, ICON_SIZE, ICON_SIZE);
                // Draw the portion of the sprite sheet we want
                tempCtx.drawImage(
                    spriteSheet,
                    col * ICON_SIZE,    // source x
                    row * ICON_SIZE,   // source y
                    ICON_SIZE,          // source width
                    ICON_SIZE,         // source height
                    0,                          // dest x
                    0,                          // dest y
                    ICON_SIZE,          // dest width
                    ICON_SIZE          // dest height
                );
                // Convert to an image and store
                const sprite = new Image();
                sprite.src = tempCanvas.toDataURL();
                this.sprites.push(sprite);
            }
        }
    }
}
