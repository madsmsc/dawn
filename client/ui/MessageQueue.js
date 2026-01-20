import { game } from '../controllers/game.js';
import { UI_FONTS } from '../../shared/Constants.js';

export class MessageQueue {
    constructor() {
        this.messages = [];
        this.maxMessages = 20;
        this.messageSpacing = 25;
        this.startX = 20; // Left margin
        this.startY = null; // Will be calculated based on canvas height
        this.speed = 0.0001;
    }

    addMessage(text) {
        this.messages.push({ text, alpha: 1.0 });
        if (this.messages.length > this.maxMessages) {
            let oldestMsg = undefined;
            this.messages.forEach(m => {
                if (!oldestMsg || m.alpha < oldestMsg.alpha) oldestMsg = m;
            });
            const index = this.messages.indexOf(oldestMsg);
            if (index > -1) {
                // console.log('max messages. removing ' + oldestMsg.text);
                this.messages.splice(index, 1);
            } else {
                // console.log('max messages. could not find message to remove');
            }
        }
    }

    update(delta) {
        this.messages.forEach(msg => { msg.alpha -= delta * this.speed; });
        this.messages = this.messages.filter(msg => msg.alpha > 0);
        return this;
    }

    draw() {
        if (this.messages.length === 0) return;
        game.ctx.save();
        const bottomY = game.canvas.height - 80;

        // Draw messages from oldest (bottom) to newest (top)
        for (let i = this.messages.length - 1; i >= 0; i--) {
            const msg = this.messages[i];
            const index = this.messages.length - 1 - i;

            // Calculate position - messages stack upward
            const targetY = bottomY - (i * this.messageSpacing);

            // Draw message background
            game.ctx.font = UI_FONTS.SMALL;
            game.ctx.textAlign = 'left';
            const textWidth = game.ctx.measureText(msg.text).width;
            const padding = 8;
            const bgWidth = textWidth + padding * 2;
            const bgHeight = 20;
            const bgX = this.startX;
            const bgY = targetY - bgHeight / 2;

            // Background with alpha (darker)
            game.ctx.fillStyle = `rgba(0, 0, 0, ${0.85 * msg.alpha})`;
            game.ctx.fillRect(bgX, bgY, bgWidth, bgHeight);

            // Text
            game.ctx.fillStyle = `rgba(200, 220, 255, ${msg.alpha})`;
            game.ctx.fillText(msg.text, this.startX + padding, targetY + 4);

            // Draw line above message
            game.ctx.strokeStyle = `rgba(100, 150, 255, ${0.6 * msg.alpha})`;
            game.ctx.lineWidth = 1;
            game.ctx.beginPath();
            game.ctx.moveTo(bgX, bgY);
            game.ctx.lineTo(bgX + bgWidth, bgY);
            game.ctx.stroke();

            // Draw line below message
            game.ctx.beginPath();
            game.ctx.moveTo(bgX, bgY + bgHeight);
            game.ctx.lineTo(bgX + bgWidth, bgY + bgHeight);
            game.ctx.stroke();
        }

        game.ctx.restore();
    }
}
