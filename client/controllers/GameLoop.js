import { game } from './game.js';
import { GameEventListener } from './GameEventListener.js';
import { UI } from '../ui/UI.js';
import { Server } from './Server.js';
import { StarField } from '../ui/StarField.js';
import { Camera } from './Camera.js';
import { MissionManager } from '../missions/MissionManager.js';
import { Sprites } from '../ui/Sprites.js';

export class GameLoop {
    constructor() {
        this.lastDelta = 0;
    }

    gameLoop(delta) {
        game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
        // timings
        const newDelta = delta - this.lastDelta;
        this.lastDelta = delta;
        // UI
        if (game.ui.showStationUI()
            || game.ui.showLoginUI()
            || game.player.dead) {
            game.ui.update(newDelta).draw();
            return requestAnimationFrame(this.gameLoop);
        }
        // background
        game.starField.update(newDelta).draw();
        // start camera transformation
        game.camera.update();
        game.camera.apply();
        // update game objects
        game.system.update(newDelta).draw();
        game.player.update(newDelta).draw();
        // stop transformation
        game.camera.restore();
        // UI
        game.missionManager.update(newDelta).draw();
        game.ui.update(newDelta).draw();
        // next frame
        requestAnimationFrame(this.gameLoop);
    }

    start() {
        // init game variables
        game.canvas = document.getElementById('gameCanvas');
        game.canvas.width = window.innerWidth;
        game.canvas.height = window.innerHeight;
        game.ctx = game.canvas.getContext('2d');
        game.sprites = new Sprites();
        game.gameLoop = this;
        game.ui = new UI();
        game.server = new Server();
        game.camera = new Camera();
        game.missionManager = new MissionManager();
        game.system = game.server.loadSystem();
        game.starField = new StarField();

        // register event listeners
        new GameEventListener().register();

        // generate missions
        setInterval(() => {
            if (!game.player || game.player.docked) return;
            game.missionManager.generateNewMissions();
        }, 30); // TODO: make greater - low for testing...

        // start game loop
        this.gameLoop = this.gameLoop.bind(this);
        requestAnimationFrame(this.gameLoop);
    }
}
