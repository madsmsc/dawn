import { Player } from './Player.js';
import { PlayerShip } from '../actors/PlayerShip.js';
import { System } from './System.js';
import { Station } from '../actors/Station.js';
import { Gate } from '../actors/Gate.js';
import { game } from './game.js';
import { Instance } from './Instance.js';
import { Vec } from '../util/Vec.js';

export class Server {
    constructor() {
        this.db = undefined;
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
                this.deserializePlayer(data.player);
            }
        };

        this.ws.onclose = () => {
            console.log('Connection closed');
            this.isConnected = false;
        };

        this.startLoginRetry(); // periodic login retries; fallback to demo handled in login()
    }

    deserializePlayer(player) {
        game.player = new Player(player);
        const ship = game.player.ships.filter(s => s.id == player.activeShip)[0];
        console.log('found active ship ' + JSON.stringify(ship));
        game.player.ship = new PlayerShip(ship);
    }

    loadSystem(gateId) {
        this.db.systems.forEach(s => {
            const warpableIds = s.instances.map(i => i.warpable.id);
            if (warpableIds.includes(gateId)) {
                console.log("found gate " + gateId + " in system " + s.id);
                return this.deserializeSystem(s);
            }
        });
        console.log('could not load system with gateId=' + gateId);
        return null;
    }

    deserializeSystem(system) {
        let instances = [];
        system.instances.forEach(instance => {
            let warpable;
            const type = instance.warpable.type;
            if (type === 'station') warpable = new Station(instance.warpable);
            if (type === 'gate') warpable = new Gate(instance.warpable);
            warpable.pos = new Vec(instance.warpable.pos.x, instance.warpable.pos.y);
            instances.push(new Instance(warpable));
        });
        return new System(system.name, system.color, instances);
    }

    login(user, pass) {
        if (this.loginAttempts > 5) return;
        if (this.ws.readyState !== WebSocket.OPEN) {
            this.loginAttempts += 1;
            console.log('login: not connected - login attempt ' + this.loginAttempts);
            // DEMO mode when no server
            if (this.loginAttempts === 5) {
                console.log('starting DEMO mode without server')
                fetch('client/static/demo.json')
                    .then(response => response.json())
                    .then(data => {
                        this.db = data;
                        const user = this.db.users[0];
                        this.deserializePlayer(user.player);
                        const system = this.db.systems.filter(s => s.id == user.player.system)[0];
                        console.log('found active system ' + JSON.stringify(system));
                        game.system = this.deserializeSystem(system);
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
