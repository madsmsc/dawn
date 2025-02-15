import { game } from './game.js';
import { SPRITE } from '../shared/Constants.js';

export class UI {
    constructor() {
        // TODO: ask Cursor to refactor UI.js to maximize code re-use.

        // TODO: make buttons register themselves with callbacks
        // and implement it i the GameEventListener
        // { name (string), upper left (Vec), lower right (Vec), callback (()=>{}) } 
        this.buttons = [];
        this.selectables = [];
        this.fpsCount = 0;
        this.fpsTime = 0;
        this.fpsDisplay = 0;
        this.qDown = false;
        this.aDown = false;
        this.sDown = false;
        this.wDown = false;
        this.eDown = false;
        this.dDown = false;
        this.k1down = false;
        this.k2down = false;
        this.k3down = false;
        this.dialogWidth = 300;
        this.dialogHeight = 400;
        this.dialogX = game.canvas.width / 2 - this.dialogWidth / 2;
        this.dialogY = game.canvas.height / 2 - this.dialogHeight / 2;

        this.sprites = [];
        this.loadSprites();
    }

    update (delta) {
        this.fpsCount++;
        this.fpsTime += delta;
        if (this.fpsTime >= 1000) {

            this.fpsDisplay = this.fpsCount;
            this.fpsCount = 0;
            this.fpsTime = 0;
        }
        return this;
    }

    draw () {
        if (this.wDown) {
            this.drawShipDialog();
        } else if (this.eDown) {
            this.drawPilotDialog();
        } else if (this.dDown) {
            this.drawSettingsDialog();
        } else if (this.k1down && !game.player.docked) {
            this.drawWarpDialog();
        }
        this.drawFps();
        this.drawButtons();
        // draw system info
        // ui.drawPanel({ x: 0, y: 100 }, 100, 200);
        const texts = [`system: ${game.system.name}`, `station: ${game.system.stations[0].name}`];
        this.drawTexts(texts, { x: 10, y: 120 });
    }

    drawIcon (spriteIndex, pos, selected = false, text = undefined, 
              outline = true, scale = 1, rotation = 0) {
        const size = 40*scale;
        if (!this.sprites[spriteIndex]) return;
        if (selected) game.ctx.globalAlpha = 0.5;
        if (rotation !== 0) {
            game.ctx.save();
            game.ctx.translate(pos.x, pos.y);
            game.ctx.rotate(rotation);
            game.ctx.drawImage(this.sprites[spriteIndex], -size/2, -size/2, size, size);
            game.ctx.restore();

        } else {
            game.ctx.drawImage(this.sprites[spriteIndex], pos.x, pos.y, size, size);
        }
        if (outline) {
            game.ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)';
            game.ctx.strokeRect(pos.x, pos.y, 40, 40);
        }
        if (text !== undefined) {
            game.ctx.font = '11px Arial';
            game.ctx.fillStyle = 'black';
            game.ctx.fillText(text, pos.x+1, pos.y+5);
            game.ctx.fillText(text, pos.x-1, pos.y+4);
            game.ctx.fillStyle = 'white';
            game.ctx.fillText(text, pos.x, pos.y+4);
        }
        game.ctx.globalAlpha = 1;
    }

    roundedRectExt (x, y, width, height, radius) {
        this.roundedRect(x, y, width, height, radius);
    }

    roundedRect (x, y, width, height, radius) {
        game.ctx.fillStyle = 'rgba(20, 20, 20, 0.9)';
        game.ctx.strokeStyle = 'rgba(100, 100, 255, 0.8)';
        game.ctx.lineWidth = 2;
        game.ctx.beginPath();
        game.ctx.moveTo(x + radius, y);
        game.ctx.lineTo(x + width - radius, y);
        game.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        game.ctx.lineTo(x + width, y + height - radius);
        game.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        game.ctx.lineTo(x + radius, y + height);
        game.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        game.ctx.lineTo(x, y + radius);
        game.ctx.quadraticCurveTo(x, y, x + radius, y);
        game.ctx.closePath();
        game.ctx.fill();
        game.ctx.stroke();
    }

    loadSprites () {
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

            // Extract each sprite
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < columns; col++) {
                    tempCtx.clearRect(0, 0, spriteWidth, spriteHeight);

                    // Draw the portion of the sprite sheet we want
                    tempCtx.drawImage(
                        spriteSheet,
                        col * spriteWidth,    // source x
                        row * spriteHeight,   // source y
                        spriteWidth,          // source width
                        spriteHeight,         // source height
                        0,                    // dest x
                        0,                    // dest y
                        spriteWidth,          // dest width
                        spriteHeight          // dest height
                    );
                    
                    // Convert to an image and store
                    const sprite = new Image();
                    sprite.src = tempCanvas.toDataURL();
                    this.sprites.push(sprite);
                }
            }
        };
    }

    drawWarpDialog () {
        this.roundedRect(this.dialogX, this.dialogY, this.dialogWidth, this.dialogHeight, 10);
        let yOffset = this.dialogY;
        yOffset = this.drawSectionHeader('Warp to:', this.dialogWidth, yOffset, this.dialogX);
        game.ctx.fillStyle = 'rgba(150, 150, 255, 0.8)';
        const keys = ['R', 'T'];
        for (let i = 0; i < game.system.connections.length; i++) {
            const c = game.system.connections[i];
            // TODO: use the draw text function instead.
            // and read up on what a method is vs. a function - what is a "member" in JS?
            game.ctx.fillText(`name: ${c.system.name}`, this.dialogX + 30, yOffset += 20);
            game.ctx.fillText(`dist: ${c.distance}`, this.dialogX + 30, yOffset += 20);
            game.ctx.fillText(`press ${keys[i]} to warp`, this.dialogX + 30, yOffset += 20);
            yOffset += 30
        }
    }

    drawPanel (pos, w, h) {
        game.ctx.setLineDash([]);
        game.ctx.strokeStyle = 'black';
        game.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        game.ctx.fillRect(pos.x, pos.y, w, h);

        game.ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        game.ctx.lineWidth = 2;
        game.ctx.strokeRect(pos.x, pos.y, w, h);
    }

    drawTexts (texts, pos, off = 30, hor = false, 
               selected = -1, color = 'white') {
        let lastLength = 0
        texts.forEach((text, i) => {
            const x = pos.x + (hor ? off * i + lastLength * 8 : 0);
            const y = pos.y + (hor ? 0 : off * i);
            if (i === selected) game.ctx.fillStyle = 'blue';
            else game.ctx.fillStyle = color;
            game.ctx.font = '14px Arial';
            game.ctx.fillText(text, x, y);
            lastLength += text.length;
        });
    }

    drawFps () {
        this.drawPanel({ x: 0, y: 0 }, 100, 50);
        this.drawTexts(['fps: ' + this.fpsDisplay], { x: 10, y: 30 });
    }

    drawHealthCircle (radius, percentage, color) {
        const thickness = 8;
        game.ctx.beginPath();
        game.ctx.strokeStyle = 'rgba(100, 100, 100, 0.5)';
        game.ctx.lineWidth = thickness;
        game.ctx.arc(game.canvas.width / 2, game.canvas.height - 60, radius, 0, Math.PI * 2);
        game.ctx.stroke();
        if (percentage > 0) {
            game.ctx.beginPath();
            game.ctx.strokeStyle = color;
            game.ctx.lineWidth = thickness;
            const startAngle = -0.5 * Math.PI;
            const endAngle = (-0.5 + 2 * percentage / 100) * Math.PI;
            game.ctx.arc(game.canvas.width / 2, game.canvas.height - 60, radius, startAngle, endAngle);
            game.ctx.stroke();
        }
        game.ctx.lineWidth = 1;
    }

    // TODO: simplify and re-use code for the UI - there's too much
    // and it's too complicated
    drawButtons () {
        const border = 15;
        const off = 40;
        let i = 1;
        let i2pos = (i) => { return { x: border, y: game.canvas.height - i * off - border}; };
        this.drawIcon(SPRITE.SHIP, i2pos(i++), this.wDown, 'W');
        this.drawIcon(SPRITE.PILOT, i2pos(i++), this.eDown, 'E');
        this.drawIcon(SPRITE.SETTINGS, i2pos(i++), this.dDown, 'D');
        if (game.player.docked) return;
        const shieldPercentage = game.spaceship.shield / game.spaceship.maxShield * 100;
        const hullPercentage = game.spaceship.hull / game.spaceship.maxHull * 100;
        this.drawHealthCircle(40, shieldPercentage, 'rgba(0, 150, 255, 0.8)');
        this.drawHealthCircle(30, hullPercentage, 'rgba(255, 150, 0, 0.8)');
        this.drawTexts(['shield', `${shieldPercentage.toFixed(1)}%`],
                    { x: game.canvas.width / 2 - 90, y: game.canvas.height - 80 }, 15);
        this.drawTexts(['hull', `${hullPercentage.toFixed(1)}%`], 
                    { x: game.canvas.width / 2 + 60, y: game.canvas.height - 80 }, 15);
        i = 3;
        i2pos = (i) => { return { x: game.canvas.width / 2 - off * i, y: game.canvas.height - off - border}; };
        this.drawIcon(SPRITE.FLY_TO, i2pos(i++), this.qDown, 'Q');
        this.drawIcon(SPRITE.APPROACH, i2pos(i++), this.aDown, 'A');
        this.drawIcon(SPRITE.ORBIT, i2pos(i++), this.sDown, 'S');
        i = -4;
        this.drawIcon(SPRITE.FIRE, i2pos(i++), this.k3down, '3');
        this.drawIcon(SPRITE.MINE, i2pos(i++), this.k2down, '2');
        this.drawIcon(SPRITE.WARP, i2pos(i++), this.k1down, '1');
    }

    drawPilotDialog () {
        this.roundedRect(this.dialogX, this.dialogY, this.dialogWidth, this.dialogHeight, 10);
        let yOffset = this.dialogY;
        yOffset = this.drawSectionHeader('Pilot', this.dialogWidth, yOffset, this.dialogX);
        game.ctx.fillStyle = 'rgba(150, 150, 255, 0.8)';
        game.ctx.fillText(`name: ${game.player.name}`, this.dialogX + 30, yOffset += 20);
        game.ctx.fillText(`credits: ${game.player.credits}`, this.dialogX + 30, yOffset += 20);
    }

    drawSettingsDialog () {
        this.roundedRect(this.dialogX, this.dialogY, this.dialogWidth, this.dialogHeight, 10);
        let yOffset = this.dialogY;
        yOffset = this.drawSectionHeader('Settings', this.dialogWidth, yOffset, this.dialogX);
        yOffset += 20;
        game.ctx.fillStyle = 'rgba(150, 150, 255, 0.8)';
        game.ctx.fillText('Exit Now', this.dialogX + 30, yOffset);
    }

    drawShipDialog () {
        this.roundedRect(this.dialogX, this.dialogY, this.dialogWidth, this.dialogHeight, 10);
        let yOffset = this.dialogY;
        yOffset = this.drawSectionHeader('Equipped Modules', this.dialogWidth, yOffset, this.dialogX);
        yOffset = this.drawSectionItems(game.spaceship.modules, yOffset, this.dialogX);
        yOffset = this.drawSectionHeader('Inventory', this.dialogWidth, yOffset, this.dialogX);
        this.drawSectionItems(game.spaceship.inventory, yOffset, this.dialogX);
    }

    drawSectionHeader (text, width, yOffset, x) {
        yOffset += 20;
        game.ctx.fillStyle = 'white';
        game.ctx.font = 'bold 20px Arial';
        game.ctx.fillText(text, x + 20, yOffset += 20);
        game.ctx.beginPath();
        game.ctx.strokeStyle = 'rgba(100, 100, 255, 0.5)';
        game.ctx.moveTo(x + 10, yOffset += 20);
        game.ctx.lineTo(x + width - 10, yOffset);
        game.ctx.stroke();
        game.ctx.font = '14px Arial';
        return yOffset + 20;
    }

    drawSectionItems (modules, yOffset, x) {
        modules.forEach((module) => {
            const m = module;
            game.ctx.fillStyle = 'rgba(150, 150, 255, 0.8)';
            game.ctx.fillText(`${module.name}`, x + 30, yOffset);
            game.ctx.fillStyle = 'rgba(200, 200, 200, 0.8)';
            const amount = module.amount > 1 ? module.amount.toFixed(2) : module.amount;
            game.ctx.fillText(`${amount} ${module.unit}`, x + 150, yOffset);
            yOffset += 20;
        });
        return yOffset;
    }
}
