import { game } from './game.js';
import { GameLoop } from './GameLoop.js';
import { UI } from './UI.js';
import { Server } from './Server.js';
import { StarField } from './Starfield.js';
import { Camera } from './Camera.js';
import { MissionManager } from './MissionManager.js';

game.canvas.width = window.innerWidth;
game.canvas.height = window.innerHeight;
game.ctx = game.canvas.getContext('2d');
game.gameLoop = new GameLoop();
game.ui = new UI();
game.server = new Server();
game.starField = new StarField();
game.camera = new Camera();
game.missionManager = new MissionManager();
game.system = game.server.loadSystem();

game.gameLoop.start();
