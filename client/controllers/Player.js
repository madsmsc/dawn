import { game } from './game.js';
import { Vec } from '../util/Vec.js';

export class Player {
    constructor(obj) {
        this.name = '';
        this.credits = 0;
        this.docked = undefined; // Station
        this.ship = undefined;
        this.settings = {
            showVelocityVectors: false
        };
        Object.assign(this, obj);
    }

    update(delta) {
        // Apply player WASD input to the player's ship directly (directional movement)
        if (!this.ship || this.docked) return this;
        const bW = game.ui.buttons.find(b => b.key === 'w');
        const bA = game.ui.buttons.find(b => b.key === 'a');
        const bS = game.ui.buttons.find(b => b.key === 's');
        const bD = game.ui.buttons.find(b => b.key === 'd');
        const ship = this.ship;

        // Direction vector: D-right, A-left, S-down, W-up
        const dx = (bD?.down ? 1 : 0) - (bA?.down ? 1 : 0);
        const dy = (bS?.down ? 1 : 0) - (bW?.down ? 1 : 0);
        const moveVec = new Vec(dx, dy);

        ship.velVec = ship.velVec || new Vec(0, 0);
        const dt = delta / 1000; // ms to s for physics

        // Input handling
        if (moveVec.x !== 0 || moveVec.y !== 0) {
            const dir = moveVec.clone().normalize();
            const targetVel = dir.scale(ship.maxVel);
            // Scale acceleration by dt
            ship.velVec.x += (targetVel.x - ship.velVec.x) * ship.acceleration * dt;
            ship.velVec.y += (targetVel.y - ship.velVec.y) * ship.acceleration * dt;
        } else {
            // Gentle damping when no input
            const damping = Math.pow(0.90, dt * 60); // scale damping per frame time
            ship.velVec.x *= damping;
            ship.velVec.y *= damping;
            if (Math.abs(ship.velVec.x) < 0.01) ship.velVec.x = 0;
            if (Math.abs(ship.velVec.y) < 0.01) ship.velVec.y = 0;
        }

        // Apply velocity
        if (ship.velVec && (ship.velVec.x !== 0 || ship.velVec.y !== 0)) {
            // scale movement by dt
            ship.pos.add(ship.velVec.clone().scale(dt));
            ship.vel = ship.velVec.length();
            ship.angle = Math.atan2(ship.velVec.y, ship.velVec.x);
        } else {
            ship.vel = 0;
        }

        this.ship.update(delta);
        return this;
    }

    draw() {
        this.ship.draw();
    }
}
