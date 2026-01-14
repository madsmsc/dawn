import { game } from '../controllers/game.js';
import { Selectable } from './Selectable.js';
import { Particle } from '../util/Particle.js';
import { UIHelper } from '../ui/UIHelper.js';
import { ICON_SIZE, UI_COLORS, UI_FONTS } from '../../shared/Constants.js';

export class Gate extends Selectable {
    constructor(name, pos, targetSystem = null) {
        super();
        this.name = name;
        this.pos = pos;
        this.targetSystem = targetSystem; // Reference to the system this gate leads to
        this.size = ICON_SIZE / 2;
        this.activating = false; // Is gate being activated
        this.activationTime = 0; // Current activation time
        this.activationDuration = 3000; // 3 seconds
        this.particles = []; // Particles during activation
    }

    draw() {
        super.draw();
        game.ctx.save();
        game.ctx.translate(this.pos.x, this.pos.y);
        
        // Draw gate as a ring
        game.ctx.strokeStyle = this.activating ? 'rgba(100, 255, 255, 1)' : 'rgba(100, 200, 255, 0.8)';
        game.ctx.lineWidth = this.activating ? 4 : 3;
        game.ctx.beginPath();
        game.ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        game.ctx.stroke();
        
        // Draw inner glow
        game.ctx.strokeStyle = this.activating ? 'rgba(200, 255, 255, 0.8)' : 'rgba(150, 220, 255, 0.5)';
        game.ctx.lineWidth = 1;
        game.ctx.beginPath();
        game.ctx.arc(0, 0, this.size - 5, 0, Math.PI * 2);
        game.ctx.stroke();
        
        game.ctx.restore();
        
        // Draw activation progress bar
        if (this.activating) {
            const barWidth = 60;
            const barHeight = 8;
            const barX = this.pos.x - barWidth / 2;
            const barY = this.pos.y - this.size - 30;
            
            const progress = this.activationTime / this.activationDuration;
            UIHelper.drawProgressBar(barX, barY, barWidth, barHeight, progress, 
                'rgba(100, 255, 255, 0.9)', 'rgba(0, 0, 0, 0.7)', 'rgba(100, 200, 255, 0.8)');
            
            // Time remaining text
            const timeRemaining = Math.ceil((this.activationDuration - this.activationTime) / 1000);
            game.ctx.fillStyle = 'white';
            game.ctx.font = UI_FONTS.TINY;
            game.ctx.textAlign = 'center';
            game.ctx.fillText(`${timeRemaining}s`, this.pos.x, barY - 5);
        }
        
        // Draw gate label
        game.ctx.fillStyle = this.activating ? 'white' : 'cyan';
        game.ctx.font = UI_FONTS.SMALL;
        game.ctx.textAlign = 'center';
        game.ctx.fillText(this.name, this.pos.x, this.pos.y - this.size - (this.activating ? 50 : 10));
        
        // Draw particles
        this.particles.forEach(particle => particle.draw());
    }

    update(delta) {
        if (this.activating) {
            // Check if player moved out of range - abort if so
            if (!this.canJump()) {
                this.cancelActivation();
                return this;
            }
            const dt = delta / 1000; // ms to s for physics
            this.activationTime += delta;
            
            // Spawn particles around the gate
            for (let i = 0; i < 5; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = this.size + Math.random() * 10;
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance;
                const speed = 0.5 + Math.random() * 0.5;
                const dx = -Math.cos(angle) * speed;
                const dy = -Math.sin(angle) * speed;
                
                const particle = new Particle(x, y, 2, dx, dy, this.pos);
                particle.color = 'rgba(100, 200, 255, 1)';
                particle.fadeSpeed = 0.02;
                this.particles.push(particle);
            }
            
            // Update and remove dead particles
            this.particles = this.particles.filter(p => {
                p.update(delta);
                return p.alpha > 0;
            });
            
            // Check if activation complete
            if (this.activationTime >= this.activationDuration) {
                this.completeActivation();
            }
        }
        return this;
    }
    
    activate(onComplete) {
        if (!this.activating && this.canJump()) {
            this.activating = true;
            this.activationTime = 0;
            this.onComplete = onComplete; // Callback when activation finishes
        }
    }
    
    completeActivation() {
        this.activating = false;
        this.activationTime = 0;
        this.particles = [];
        
        // Execute jump callback if provided
        if (this.onComplete) {
            this.onComplete(this);
            this.onComplete = null;
        }
    }

    cancelActivation() {
        this.activating = false;
        this.activationTime = 0;
        this.particles = [];
        this.onComplete = null;
    }

    canJump() {
        // Check if player is within jump range
        const jumpRange = 150;
        return this.pos.clone().sub(game.player.ship.pos).length() < jumpRange;
    }
}
