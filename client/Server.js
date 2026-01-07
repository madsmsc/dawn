import { COLOR } from '../shared/Constants.js';
import { Player } from './Player.js';
import { PlayerShip } from './destructables/PlayerShip.js';
import { System } from './System.js';
import { Station } from './selectables/Station.js';
import { Vec } from './util/Vec.js';
import { game } from './game/game.js';

export class Server {
    constructor() {
        this.loginAttempts = 0;
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
        };
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
        const A = new System(randomSystemName(), COLOR.RED, [randomStation()]);
        const B = new System(randomSystemName(), COLOR.GREEN, [randomStation()]);
        const C = new System(randomSystemName(), COLOR.BLUE, [randomStation()]);

        // create connections
        const A_B = { system: B, distance: 100 };
        const A_C = { system: C, distance: 200 };
        const B_A = { system: A, distance: A_B.distance };
        const C_A = { system: A, distance: A_C.distance };
        A.connections = [A_B, A_C];
        B.connections = [B_A];
        C.connections = [C_A];

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
                fetch('./demo.json')
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
}
