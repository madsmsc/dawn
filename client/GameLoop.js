import { game } from './game.js';
import { GameEventListener } from './GameEventListener.js';
import { UI } from './UI.js';
import { Server } from './Server.js';
import { StarField } from './StarField.js';
import { Camera } from './Camera.js';
import { MissionManager } from './MissionManager.js';

export class GameLoop {
    constructor() {
        this.lastDelta = 0;
    }

    gameLoop (delta) {
        game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
        const newDelta = delta - this.lastDelta;
        this.lastDelta = delta;

        // TODO: login UI - move...
        if (!game.player || !game.spaceship){
            game.ui.roundedRect(game.ui.dialogX, game.ui.dialogY, game.ui.dialogWidth, game.ui.dialogHeight, 10);
            let yOffset = 100;
            yOffset = game.ui.drawSectionHeader('Logging in...', game.ui.dialogWidth, yOffset, game.ui.dialogX);
            game.ctx.fillStyle = 'rgba(150, 150, 255, 0.8)';
            game.ctx.fillText(`user: ${'bob'}`, game.ui.dialogX + 30, yOffset += 20);
            game.ctx.fillText(`pass: ${'1234'}`, game.ui.dialogX + 30, yOffset += 20);

            if (!game.server.loggingIn) {
                console.log('logging in');
                game.server.login('bob', '1234');
            }
            return requestAnimationFrame(this.gameLoop);
        }

        // TODO: move... draw the station UI
        // TODO: remove all the early returns from the draw methods. 
        // the individual draw methods should not
        // worry about whether to render. That is the jobs of the Game class.
        if (game.player.docked) {
            game.ctx.fillStyle = 'white';
            game.ctx.font = '22px Arial';
            let yOffset = 100;
            const text = (s) => {game.ctx.fillText(s, game.canvas.width / 2, yOffset += 30)};
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
            game.missionManager.update().draw();
            game.ui.update(newDelta).draw();
            return requestAnimationFrame(this.gameLoop);
        }

        game.starField.update(newDelta).draw();

        // start camera transformation
        game.camera.update();
        game.camera.apply();
        game.system.update(newDelta).draw();
        game.spaceship.update(newDelta).draw();
        // stop transformation
        game.camera.restore();

        game.missionManager.update(newDelta).draw();
        game.player.update(newDelta).draw();
        game.ui.update(newDelta).draw();

        requestAnimationFrame(this.gameLoop);
    }

    start () {
        // init game variables
        game.canvas = document.getElementById('gameCanvas');
        game.canvas.width = window.innerWidth;
        game.canvas.height = window.innerHeight;
        game.ctx = game.canvas.getContext('2d');
        game.gameLoop = this;
        game.ui = new UI();
        game.server = new Server();
        game.starField = new StarField();
        game.camera = new Camera();
        game.missionManager = new MissionManager();
        game.system = game.server.loadSystem();

        // register event listeners
        new GameEventListener().register();

        // generate missions
        setInterval(() => {
            if (!game.player || game.player.docked) return;
            game.missionManager.generateNewMissions();
        }, 30); // TODO: make greater - low for testing...

        // start game loop
        this.gameLoop = this.gameLoop.bind(this); // dunno wtf this is...
        requestAnimationFrame(this.gameLoop);
    }
}
