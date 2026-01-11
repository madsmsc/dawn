import { game } from '../controllers/game.js';
import { UI_COLORS, UI_FONTS } from '../../shared/Constants.js';

class Message {
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

export class MessageQueue {
    constructor() {
        this.messages = [];
        this.maxMessages = 5;
        this.messageSpacing = 25;
        this.startX = 20; // Left margin
        this.startY = null; // Will be calculated based on canvas height
    }
    
    addMessage(text, duration = 6000) {
        const message = new Message(text, duration);
        this.messages.unshift(message); // Add to front (top)
        
        // Remove oldest if we exceed max
        if (this.messages.length > this.maxMessages) {
            this.messages.pop();
        }
    }
    
    update(delta) {
        // Update all messages and remove expired ones
        this.messages = this.messages.filter(msg => !msg.update(delta));
    }
    
    draw() {
        if (this.messages.length === 0) return;
        
        game.ctx.save();
        
        // Calculate start position from bottom of screen
        const bottomY = game.canvas.height - 80; // 80px from bottom
        
        // Draw messages from oldest (bottom) to newest (top)
        for (let i = this.messages.length - 1; i >= 0; i--) {
            const msg = this.messages[i];
            const index = this.messages.length - 1 - i;
            
            // Calculate position - messages stack upward
            const targetY = bottomY - (index * this.messageSpacing);
            
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
