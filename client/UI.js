import { game } from './game.js';
import { SPRITE } from '../shared/Constants.js';
import { Vec } from './Vec.js';
import { Button } from './Button.js';

export class UI {
    constructor() {
        this.selectables = [];
        this.fpsCount = 0;
        this.fpsTime = 0;
        this.fpsDisplay = 0;
        this.dialogWidth = 300;
        this.dialogHeight = 400;
        this.dialogX = game.canvas.width / 2 - this.dialogWidth / 2;
        this.dialogY = game.canvas.height / 2 - this.dialogHeight / 2;
        this.#loadButtons();
    }

    #loadButtons() {
        const off = 50;
        const border = 2;
        this.buttons = [];
        let i2vec = (i) => new Vec(border, game.canvas.height - i * off - border);
        let i = 1;
        this.buttons.push(new Button('i', i2vec(i++), SPRITE.SHIP));
        this.buttons.push(new Button('c', i2vec(i++), SPRITE.PILOT));
        this.buttons.push(new Button('p', i2vec(i++), SPRITE.SETTINGS));
        i = 3;
        i2vec = (i) => new Vec(game.canvas.width / 2 - off * i, game.canvas.height - off - border);
        this.buttons.push(new Button('w', i2vec(i++), SPRITE.UP, () => !game.player.docked));
        this.buttons.push(new Button('a', i2vec(i++), SPRITE.LEFT, () => !game.player.docked));
        this.buttons.push(new Button('s', i2vec(i++), SPRITE.DOWN, () => !game.player.docked));
        this.buttons.push(new Button('d', i2vec(i++), SPRITE.RIGHT, () => !game.player.docked));
        this.buttons.push(new Button('q', i2vec(i++), SPRITE.FLY_TO, () => !game.player.docked));
        this.buttons.push(new Button('e', i2vec(i++), SPRITE.APPROACH, () => !game.player.docked));
        this.buttons.push(new Button('r', i2vec(i++), SPRITE.ORBIT, () => !game.player.docked));
        i = -4;
        this.buttons.push(new Button('1', i2vec(i++), SPRITE.FIRE, () => !game.player.docked));
        this.buttons.push(new Button('2', i2vec(i++), SPRITE.MINE, () => !game.player.docked));
        this.buttons.push(new Button('3', i2vec(i++), SPRITE.WARP, () => !game.player.docked));

        // TODO: find and remove comments where not necessary

        // TODO: is this necessary? aren't they empty by default?
        // Movement handled in PlayerShip.update now (WASD). Keep button visuals but don't mutate ship here.
        this.buttons.find((b) => b.key === 'w').onDraw = () => {};
        this.buttons.find((b) => b.key === 's').onDraw = () => {};
        this.buttons.find((b) => b.key === 'a').onDraw = () => {};
        this.buttons.find((b) => b.key === 'd').onDraw = () => {};

        this.buttons.find((b) => b.key === 'i').onDraw = () => this.drawShipDialog();
        this.buttons.find((b) => b.key === 'c').onDraw = () => this.drawPilotDialog();
        this.buttons.find((b) => b.key === 'p').onDraw = () => this.drawSettingsDialog();
        this.buttons.find((b) => b.key === '3').onDraw = () => this.drawWarpDialog();
        // Approach/orbit behavior removed - WASD controls movement now
        this.buttons.find((b) => b.key === 'e').onClick = () => {
            // interaction placeholder: use selected
            const selected = this.selectables.find(s => s.selected);
            if (selected) {
                // interaction left intentionally empty; WASD handles movement
            }
        };
        // remove orbit-on-'s' click handler (movement is WASD now)
        this.buttons.find((b) => b.key === 's').onClick = () => {};


        this.buttons.push(new Button('f', undefined, undefined));
        this.buttons.find((b) => b.key === 's').onClick = () => {
            game.system.handleDocking();
        };

        this.buttons.push(new Button('m', undefined, () => game.player.docked));
        this.buttons.find((b) => b.key === 's').onClick = () => {
            game.player.docked.acceptMission();
        };

        this.buttons.push(new Button('n', undefined, () => game.player.docked));
        this.buttons.find((b) => b.key === 's').onClick = () => {
            game.missionManager.activeMissions.find(m => m.canComplete())?.complete();
        };
        
        const button1 = this.buttons.find((b) => b.key === '1');
        this.buttons.push(new Button('r', undefined, () => button1.down));
        this.buttons.find((b) => b.key === 'r').onClick = () => {
            // TODO add loading bar
            game.system = game.system.connections[0].system;
            // new Vec(game.canvas.width / 2, game.canvas.height / 2);
        };
                
        this.buttons.push(new Button('t', undefined, () => 
            button1.down && game.system.connections.length > 1));
        this.buttons.find((b) => b.key === 't').onClick = () => {
            game.system = game.system.connections[1].system;
            // new Vec(game.canvas.width / 2, game.canvas.height / 2);
        };
    }

    update(delta) {
        this.fpsCount++;
        this.fpsTime += delta;
        if (this.fpsTime >= 1000) {
            this.fpsDisplay = this.fpsCount;
            this.fpsCount = 0;
            this.fpsTime = 0;
        }
        if (this.showStationUI()) {
            game.missionManager.update(delta);
        }
        return this;
    }

    draw() {
        this.drawFps();
        this.#demoText();
        if (this.showLoginUI()) { 
            this.#loginUI(); 
        } else if (this.showStationUI()) { 
            this.#stationUI();
            game.missionManager.draw();
            this.draw();
        } else {
            this.drawButtons();
            this.drawHUD();
        }
    }

    showLoginUI() {
        return !game.player || !game.player.ship;
    }

    showStationUI() {
        return game.player?.docked;
    }

    roundedRect(x, y, width, height, radius) {
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

    #loginUI() {
        this.roundedRect(this.dialogX, this.dialogY, this.dialogWidth, this.dialogHeight, 10);
        let yOffset = 100;
        yOffset = this.drawSectionHeader('Logging in...', this.dialogWidth, yOffset, this.dialogX);
        game.ctx.fillStyle = 'rgba(150, 150, 255, 0.8)';
        game.ctx.fillText(`user: ${'bob'}`, this.dialogX + 30, yOffset += 20);
        game.ctx.fillText(`pass: ${'1234'}`, this.dialogX + 30, yOffset += 20);

        // TODO: callback instead of repeatedly calling?
        if (!game.server.loggingIn) {
            game.server.login('bob', '1234');
        }
    }

    #demoText() {
        if (game.gameLoop.demo) {
            game.ctx.fillStyle = 'green';
            game.ctx.font = '22px Arial';
            const text = (s) => { game.ctx.fillText(s, game.canvas.width / 2, 30) };
            text('No server - DEMO');
        }
    }

    #stationUI() {
        game.ctx.fillStyle = 'white';
        game.ctx.font = '22px Arial';
        let yOffset = 100;
        const text = (s) => { game.ctx.fillText(s, game.canvas.width / 2, yOffset += 30) };
        text('YOU ARE DOCKED! - (F to undock)');
        text('this is the station UI!');
        text('---')
        const mission = game.player.docked.missionToAccept();
        if (mission) {
            text('this is the next mission to accept: (M to accept)');
            text('---')
            text(mission.description);
            text(`Reward: ${mission.reward} credits`);
            text('---')
        }
    }

    drawWarpDialog() {
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

    drawPanel(pos, w, h) {
        game.ctx.setLineDash([]);
        game.ctx.strokeStyle = 'black';
        game.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        game.ctx.fillRect(pos.x, pos.y, w, h);

        game.ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        game.ctx.lineWidth = 2;
        game.ctx.strokeRect(pos.x, pos.y, w, h);
    }

    drawTexts(texts, pos, off = 30, hor = false,
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

    drawFps() {
        game.ctx.fillStyle = 'white';
        game.ctx.font = 'bold 14px Arial';
        game.ctx.fillText(`fps: ${this.fpsDisplay}`, 10, 30);
    }

    drawHealthCircle(radius, percentage, color) {
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

    drawButtons() {
        this.buttons.forEach((b) => { b.draw() });
    }

    drawHUD() {
        game.ctx.fillStyle = 'white';
        game.ctx.font = 'bold 14px Arial';
        let yOffset = 80;
        game.ctx.fillText('System', 10, yOffset);
        game.ctx.font = '12px Arial';
        game.ctx.fillText(game.system.name, 20, yOffset += 20);
        game.ctx.font = 'bold 14px Arial';
        game.ctx.fillText('Station', 10, yOffset += 30);
        game.ctx.font = '12px Arial';
        game.ctx.fillText(game.system.stations[0].name, 20, yOffset += 20);
        if (game.player.docked) return;
        const shieldPercentage = game.player.ship.shield / game.player.ship.maxShield * 100;
        const hullPercentage = game.player.ship.hull / game.player.ship.maxHull * 100;
        this.drawHealthCircle(40, shieldPercentage, 'rgba(0, 150, 255, 0.8)');
        this.drawHealthCircle(30, hullPercentage, 'rgba(255, 150, 0, 0.8)');
        this.drawTexts(['shield', `${shieldPercentage.toFixed(1)}%`],
            { x: game.canvas.width / 2 - 90, y: game.canvas.height - 80 }, 15);
        this.drawTexts(['hull', `${hullPercentage.toFixed(1)}%`],
            { x: game.canvas.width / 2 + 60, y: game.canvas.height - 80 }, 15);
    }

    drawPilotDialog() {
        this.roundedRect(this.dialogX, this.dialogY, this.dialogWidth, this.dialogHeight, 10);
        let yOffset = this.dialogY;
        yOffset = this.drawSectionHeader('Pilot', this.dialogWidth, yOffset, this.dialogX);
        game.ctx.fillStyle = 'rgba(150, 150, 255, 0.8)';
        const text = (str) => { game.ctx.fillText(str, this.dialogX + 30, yOffset += 20); }
        text(`name: ${game.player.name}`);
        text(`credits: ${game.player.credits}`);
        text(`rep: ${game.player.rep}`);
    }

    drawSettingsDialog() {
        this.roundedRect(this.dialogX, this.dialogY, this.dialogWidth, this.dialogHeight, 10);
        let yOffset = this.dialogY;
        yOffset = this.drawSectionHeader('Settings', this.dialogWidth, yOffset, this.dialogX);
        yOffset += 20;
        game.ctx.fillStyle = 'rgba(150, 150, 255, 0.8)';
        game.ctx.fillText('Exit Now', this.dialogX + 30, yOffset);
    }

    drawShipDialog() {
        this.roundedRect(this.dialogX, this.dialogY, this.dialogWidth, this.dialogHeight, 10);
        let yOffset = this.dialogY;
        yOffset = this.drawSectionHeader('Equipped Modules', this.dialogWidth, yOffset, this.dialogX);
        yOffset = this.drawSectionItems(game.player.ship.modules, yOffset, this.dialogX);
        yOffset = this.drawSectionHeader('Inventory', this.dialogWidth, yOffset, this.dialogX);
        this.drawSectionItems(game.player.ship.inventory, yOffset, this.dialogX);
    }

    drawSectionHeader(text, width, yOffset, x) {
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

    drawSectionItems(modules, yOffset, x) {
        modules.forEach((module) => {
            const m = module;
            game.ctx.fillStyle = 'rgba(150, 150, 255, 0.8)';
            game.ctx.fillText(`${module.name}`, x + 30, yOffset);
            game.ctx.fillStyle = 'rgba(200, 200, 200, 0.8)';
            const amount = module.amount > 1 ? module.amount.toFixed(2) : module.amount;
            game.ctx.fillText(`${amount} ${module.unit}`, x + 200, yOffset);
            yOffset += 20;
        });
        return yOffset;
    }
}
