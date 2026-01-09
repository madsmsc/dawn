import { Selectable } from "../selectables/Selectable.js";
import { Vec } from "../controllers/Vec.js"
import { MOVE } from "../../shared/Constants.js"
import { game } from "../controllers/game.js";
import { Particle } from "../ui/Particle.js";

export class Destructable extends Selectable {
    constructor() {
        super();

        this.maxShield = 0;
        this.shield = 0;
        this.maxHull = 0;
        this.hull = 0;
        // Engine trail settings
        this.trailSpawnInterval = 30; // ms between trail particle spawns
        this.trailSpawnTimer = 0;
        // Movement and combat
        this.type = '';
        this.acceleration = 0.05;
        this.vel = 0;
        this.maxVel = 1;
        this.target = Vec.ZERO;
        this.moveMode = MOVE.APPROACH;
        this.modules = []; // "equipped" modules
        this.inventory = []; // unequipped modules and ore
        this.orbitRadius = 120; // TODO: should depend on the ship type and weapons/modules
        // TODO: all this should be function of equipped modules
        this.scanRange = 10000; // TODO: should depend on ship type and modules
        this.attackRange = 150; // should depend on ship type and modules ...
        this.dam = 2; // ...
        this.attackTime = 1000;
        this.attackCount = 0;
    }

    #particles = [];
    #trailParticles = [];

    update(delta) {
        this.move(delta);
        this.#updateEngineTrails(delta);
    }

    draw(sprite) {
        super.draw();
        game.ctx.save();
        // position correctly
        game.ctx.translate(this.pos.x, this.pos.y);
        game.ctx.rotate(this.angle + Math.PI / 2.0);
        const off = this.size * 1.0;
        game.ctx.translate(-off, -off);
        // draw ship
        game.sprites.draw(sprite, new Vec(0, 0), false, undefined, false, 1);

        // draw vector
        game.ctx.translate(off, 0);
        game.ctx.lineWidth = 3;
        game.ctx.globalAlpha = 0.3;
        game.ctx.strokeStyle = 'rgb(40, 40, 255)';
        game.ctx.beginPath();
        game.ctx.setLineDash([]);
        game.ctx.moveTo(0, 0);
        game.ctx.lineTo(0, -this.vel * 30);
        game.ctx.stroke();

        game.ctx.restore();

        if (this.shooting) {
            // laser dissipate over 500ms and then set shooting false
            if (this.attackCount > 500) {
                this.shooting = false;
            } else {
                game.ctx.lineWidth = 3;
                game.ctx.strokeStyle = 'rgba(200, 100, 255, 1)';
                game.ctx.globalAlpha = 1.0 - this.attackCount / 500.0;
                game.ctx.beginPath();
                game.ctx.moveTo(this.pos.x, this.pos.y);
                game.ctx.lineTo(this.target.x, this.target.y);
                game.ctx.stroke();
                game.ctx.globalAlpha = 1.0;
            }
        }

        // Draw engine trail particles
        this.#trailParticles.forEach((particle, i) => {
            if (particle.alpha <= 0) {
                this.#trailParticles.splice(i, 1);
            } else {
                particle.update();
            }
        });

        // Draw death explosion particles
        if (this.#particles.length > 0) {
            this.#particles.forEach((particle, i) => {
                if (particle.alpha <= 0) {
                    this.#particles.splice(i, 1);
                } else particle.update()
            })
        }
    }

    damage(dam) {
        if (dam <= this.shield) {
            this.shield -= dam;
            return;
        }
        dam -= this.shield;
        this.shield = 0;
        if (this.hull <= dam) {
            this.hull = 0;
            this.die();
            return;
        }
        this.hull -= dam;
    }

    #updateEngineTrails(delta) {
        // Only emit trails when ship is moving
        if (this.vel < 0.1) return;

        this.trailSpawnTimer += delta;

        if (this.trailSpawnTimer >= this.trailSpawnInterval) {
            this.trailSpawnTimer = 0;

            // Calculate position behind the ship
            const trailDistance = this.size * 0.8; // Distance behind ship center
            const trailX = -Math.cos(this.angle) * trailDistance;
            const trailY = -Math.sin(this.angle) * trailDistance;

            // Add slight randomness to particle emission
            const spreadX = (Math.random() - 0.5) * this.size * 0.3;
            const spreadY = (Math.random() - 0.5) * this.size * 0.3;

            // Particle velocity opposite to ship direction (trails behind)
            const particleSpeed = 0.5;
            const dx = -Math.cos(this.angle) * particleSpeed + (Math.random() - 0.5) * 0.2;
            const dy = -Math.sin(this.angle) * particleSpeed + (Math.random() - 0.5) * 0.2;

            const radius = 2 + Math.random() * 2;
            const particle = new Particle(trailX + spreadX, trailY + spreadY, radius, dx, dy, this.pos.clone());
            particle.fadeSpeed = 0.02; // Custom fade speed for trails
            particle.color = this.#getTrailColor();

            this.#trailParticles.push(particle);
        }
    }

    #getTrailColor() {
        // Blue-ish engine trail for players, red-ish for enemies
        if (this.isPlayer) {
            return `rgba(100, 150, 255, ${1})`;
        } else {
            return `rgba(255, 100, 100, ${1})`;
        }
    }

    die() {
        for (let i = 0; i <= 50; i++) {
            let dx = (Math.random() - 0.5) * (Math.random() * 6);
            let dy = (Math.random() - 0.5) * (Math.random() * 6);
            let radius = Math.random() * 3;
            let particle = new Particle(this.pos.x, this.pos.y, radius, dx, dy, this.pos);
            this.#particles.push(particle);
        }
        // overridden and called in the children.
    }

    move(delta) {
        // AI movement - player is controlled in player class
        if (this.isPlayer) return;

        // AI velocity accumulation so approach/orbit actually move
        this.vel = Math.min(this.vel + this.acceleration * delta, this.maxVel);

        if (this.moveMode === MOVE.APPROACH) {
            const len = this.target.clone().sub(this.pos);
            if (len.length() > this.size) {
                const normalizedDir = len.normalize();
                this.pos.add(len.normalize().scale(this.vel));
                this.angle = Math.atan2(normalizedDir.y, normalizedDir.x);
            } else {
                this.vel = 0;
            }

        } else if (this.moveMode === MOVE.ORBIT) {
            // Smooth orbit: steer tangentially and correct radial error so orbit is smooth and stable
            if (!this.target) return;
            const rel = this.pos.clone().sub(this.target);
            let r = rel.length();
            // if we are exactly at the center, nudge outwards
            if (r === 0) {
                rel.x = this.orbitRadius;
                rel.y = 0;
                r = this.orbitRadius;
            }
            const dirToSelf = rel.clone().normalize();
            // tangent direction (perpendicular)
            const tangent = new Vec(-dirToSelf.y, dirToSelf.x);
            // choose orbit direction if not set
            if (this.orbitDir === undefined) this.orbitDir = (Math.random() < 0.5 ? 1 : -1);
            // tangential component scaled by current vel
            const tangentialMove = tangent.clone().scale(this.vel * this.orbitDir);
            // radial correction proportional to the radial error
            const radialError = r - this.orbitRadius;
            const radialCorrection = dirToSelf.clone().scale(-radialError * 0.2);
            // combine steering
            let moveVec = tangentialMove.add(radialCorrection);
            // clamp movement to current vel to avoid jumps
            const maxMove = Math.max(this.vel, 0.01);
            if (moveVec.length() > maxMove) moveVec = moveVec.clone().normalize().scale(maxMove);
            this.pos.add(moveVec);
            if (moveVec.x !== 0 || moveVec.y !== 0) this.angle = Math.atan2(moveVec.y, moveVec.x);
        }
    }
}
