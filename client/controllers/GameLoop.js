import { game } from './game.js';
import { GameEventListener } from './GameEventListener.js';
import { UI } from '../ui/UI.js';
import { Server } from './Server.js';
import { StarField } from './StarField.js';
import { Camera } from './Camera.js';
import { MissionManager } from '../missions/MissionManager.js';
import { Sprites } from '../util/Sprites.js';
import { Sounds } from '../util/Sounds.js';

export class GameLoop {
    constructor() {
        this.lastTime = 0;
    }

    gameLoop(time) {
        const frameStart = performance.now();
        const delta = time - this.lastTime;
        game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);

        // pure UI - no game
        if (game.ui.showStationUI()
            || game.ui.showLoginUI()
            || game.player.dead) {
            game.ui.update(delta).draw();
            return requestAnimationFrame(this.gameLoop);
        }
        // background
        game.starField.update(delta).draw();
        // start camera transformation
        game.camera.update();
        game.camera.apply();
        // update game objects
        game.system.update(delta).draw();
        game.player.update(delta).draw();
        // stop transformation
        game.camera.restore();
        // UI
        game.missionManager.update(delta).draw();
        game.ui.update(delta).draw();

        if (time % 1000 < this.lastTime % 1000) { // new second
            const workTime = performance.now() - frameStart;
            const FRAME_BUDGET = 1000 / 60; // TODO: change hardcoded 60 to actual fps
            const spareTime = FRAME_BUDGET - workTime;
            const sparePerc = Math.floor((spareTime) / FRAME_BUDGET * 100)
            game.ui.spareTime = `spare ms: ${Math.floor(spareTime)} (${sparePerc}%)`;
        }
        this.lastTime = time;
        // next frame
        requestAnimationFrame(this.gameLoop);
    }

    start() {
        // init game variables
        game.canvas = document.getElementById('gameCanvas');
        game.canvas.width = window.innerWidth;
        game.canvas.height = window.innerHeight;
        game.ctx = game.canvas.getContext('2d');

        game.sounds = new Sounds();
        game.sprites = new Sprites();
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
        }, 3000);

        // start background music
        game.sounds.background();

        // start game loop
        this.gameLoop = this.gameLoop.bind(this);
        requestAnimationFrame(this.gameLoop);
    }
}
