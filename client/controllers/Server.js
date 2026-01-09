import { COLOR } from '../../shared/Constants.js';
import { Player } from './Player.js';
import { PlayerShip } from '../destructables/PlayerShip.js';
import { System } from './System.js';
import { Station } from '../selectables/Station.js';
import { Gate } from '../selectables/Gate.js';
import { Vec } from './Vec.js';
import { game } from './game.js';

export class Server {
    constructor() {
        this.loginAttempts = 4; // TODO: set to 4 for testing - set to 0 for production
        this.loggingIn = false;
        this.ws = new WebSocket('ws://localhost:8080');
        this.ws.onopen = () => {
            console.log('Connected to server');
            this.isConnected = true;
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log(`Message from server: ${data}`);
            if (data.action === 'login') {
                game.player = new Player(data.player);
                game.player.ship = new PlayerShip(data.spaceship);
            }
        };

        this.ws.onclose = () => {
            console.log('Connection closed');
            this.isConnected = false;
        };

        // Start periodic login retries; fallback to demo handled in login()
        this.startLoginRetry();
    }

    loadSystem() {
        // TODO: move logic to server
        const namePrefix = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta',
            'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi', 'Rho',
            'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega'];
        const stationSuffix = ['Station', 'Hub', 'Port', 'Mining', 'Factory', 'Research', 'Academy'];

        const randomNamePrefix = () => {
            return namePrefix[Math.floor(Math.random() * namePrefix.length)];
        };

        const randomStationSuffix = () => {
            return stationSuffix[Math.floor(Math.random() * stationSuffix.length)];
        };

        const usedSystemNames = [];
        const randomSystemName = () => {
            let name = `${randomNamePrefix()}-${Math.floor(Math.random() * 9)}`;
            while (usedSystemNames.includes(name)) {
                name = `${randomNamePrefix()}-${Math.floor(Math.random() * 9)}`;
            }
            usedSystemNames.push(name);
            return name;
        };

        const usedStationNames = [];
        const randomStation = () => {
            const pos = new Vec(Math.random() * 600 + 100, Math.random() * 600 + 100);
            let name = `${randomNamePrefix()} ${randomStationSuffix()}`;
            while (usedStationNames.includes(name)) {
                name = `${randomNamePrefix()} ${randomStationSuffix()}`;
            }
            usedStationNames.push(name);
            return new Station(name, pos);
        };

        // create systems
        const A = new System(randomSystemName(), COLOR.RED, [randomStation()], []);
        const B = new System(randomSystemName(), COLOR.GREEN, [randomStation()], []);
        const C = new System(randomSystemName(), COLOR.BLUE, [randomStation()], []);

        // create gates connecting systems
        const gateA_B = new Gate('Gate to ' + B.name, new Vec(400, 250), B);
        const gateB_A = new Gate('Gate to ' + A.name, new Vec(200, 250), A);
        const gateA_C = new Gate('Gate to ' + C.name, new Vec(600, 200), C);
        const gateC_A = new Gate('Gate to ' + A.name, new Vec(300, 150), A);
        const gateB_C = new Gate('Gate to ' + C.name, new Vec(500, 300), C);
        const gateC_B = new Gate('Gate to ' + B.name, new Vec(350, 400), B);

        // add stations and gates as warpables
        A.warpables = [A.stations[0], gateA_B, gateA_C];
        B.warpables = [B.stations[0], gateB_A, gateB_C];
        C.warpables = [C.stations[0], gateC_A, gateC_B];

        // Initialize quantum stash (shared across all stations)
        game.quantumStash = [];

        return A;
    }

    login(user, pass) {
        if (this.loginAttempts > 5) return;
        if (this.ws.readyState !== WebSocket.OPEN) {
            this.loginAttempts += 1;
            console.log('login: not connected - login attempt ' + this.loginAttempts);
            // DEMO mode when no server
            if (this.loginAttempts === 5) {
                console.log('starting DEMO mode without server')
                fetch('client/demo.json')
                    .then(response => response.json())
                    .then(data => {
                        game.gameLoop.demo = true;
                        game.player = new Player(data[0].player);
                        game.player.ship = new PlayerShip(data[0].spaceship);
                    })
                    .catch(error => console.log(error));
            }
            return;
        }
        this.loggingIn = true;
        const message = {
            action: 'login',
            user,
            pass
        };
        this.ws.send(JSON.stringify(message));
    }

    startLoginRetry() {
        if (this.loginInterval) return;
        this.loginInterval = setInterval(() => {
            if (game.player && game.player.ship) {
                clearInterval(this.loginInterval);
                this.loginInterval = undefined;
                return;
            }
            this.login('demo', 'pass');
        }, 1000);
    }
}
