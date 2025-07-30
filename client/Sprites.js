import { game } from "./game.js";

export class Sprites {
    constructor() {
        this.sprites = [];
        this.#loadSprites();
    }

    #spriteWidth = 40;
    #spriteHeight = 40;

    draw(spriteIndex, pos, selected = false, text = undefined,
        outline = true, scale = 1, rotation = 0) {
        const sprite = this.sprites[spriteIndex];
        if (!sprite) return;
        const size = 40 * scale;
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
            game.ctx.strokeRect(pos.x, pos.y, 40, 40);
        }
        if (text !== undefined) {
            game.ctx.font = '11px Arial';
            game.ctx.fillStyle = 'black';
            game.ctx.fillText(text, pos.x + 1, pos.y + 5);
            game.ctx.fillText(text, pos.x - 1, pos.y + 4);
            game.ctx.fillStyle = 'white';
            game.ctx.fillText(text, pos.x, pos.y + 4);
        }
        game.ctx.globalAlpha = 1;
    }

    #loadSprites() {
        const spriteSheet = new Image();
        // icons from:
        // https://game-icons.net/
        // https://icons8.com/
        // https://www.flaticon.com/
        spriteSheet.src = 'client/icons.png';
        spriteSheet.onload = () => {
            const spriteWidth = 40;
            const spriteHeight = 40;
            const columns = spriteSheet.width / spriteWidth;
            const rows = spriteSheet.height / spriteHeight;

            // Create a temporary canvas to extract sprites
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = spriteWidth;
            tempCanvas.height = spriteHeight;
            this.#extractSprite(columns, rows, tempCtx, spriteSheet, tempCanvas);
        };
    }

    #extractSprite(columns, rows, tempCtx, spriteSheet, tempCanvas) {
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                tempCtx.clearRect(0, 0, this.#spriteWidth, this.#spriteHeight);
                // Draw the portion of the sprite sheet we want
                tempCtx.drawImage(
                    spriteSheet,
                    col * this.#spriteWidth,    // source x
                    row * this.#spriteHeight,   // source y
                    this.#spriteWidth,          // source width
                    this.#spriteHeight,         // source height
                    0,                          // dest x
                    0,                          // dest y
                    this.#spriteWidth,          // dest width
                    this.#spriteHeight          // dest height
                );
                // Convert to an image and store
                const sprite = new Image();
                sprite.src = tempCanvas.toDataURL();
                this.sprites.push(sprite);
            }
        }
    }
}
