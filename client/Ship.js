import { Selectable } from "./Selectable.js";
import { Vec } from "./Vec.js"
import { MOVE } from "../shared/Constants.js"

export class Destructable extends Selectable {
    constructor() {
        super();

        this.maxShield = 0;
        this.shield = 0;
        this.maxHull = 0;
        this.hull = 0;

        this.type = '';
        this.acceleration = 0;
        this.vel = 0;
        this.maxVel = 0;
        this.target = Vec.ZERO;
        this.moveMode = MOVE.APPROACH;
        this.modules = []; // "equipped" modules
        this.inventory = []; // unequipped modules and ore
        this.orbitRadius = 150; // TODO: should be able to set this in the UI
        // TODO: all this should be function of equipped modules
        this.scanRange = 400;
        this.attackRange = 100;
        this.dam = 2;
        this.attackTime = 1000;
        this.attackCount = 0;

        // this.debug = true; // enable to show paths
        this.points = []; // used for orbiting
        this.targetCircle = [];
        this.numPoints = 30;
        for (let i = 0; i < this.numPoints; i++) {
            this.targetCircle.push(new Vec(0,0));
        }
    }

    update (delta) {
        this.move(delta);
    }

    draw () {
        super.draw(); // TODO: make sure children are calling this
    }

    damage (dam) { 
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

    die () { 
        // TODO: disable input. draw an explosive death with particles. remove all references
        // overidden in the children.
    }

    approach (target) {
        // console.log(`setting [${this.type}] target to ${target.toString()} and approaching`);
        this.target = target;
        this.moveMode = MOVE.APPROACH;
    }

    orbit (target) {
        // console.log(`setting [${this.type}] target to ${target.toString()} and orbiting`);
        this.target = target;
        this.moveMode = MOVE.ORBIT;
        this.nextPoint = undefined;
    }
    
    move (delta) {
        this.vel = Math.min(this.vel + this.acceleration * delta, this.maxVel);
        if (this.moveMode === MOVE.APPROACH) {
            const dir = this.target.sub(this.pos);
            if (dir.length() > this.size) {
                const normalizedDir = dir.normalize();
                this.pos.add(normalizedDir.scale(this.vel));
                this.angle = Math.atan2(normalizedDir.y, normalizedDir.x);
            } else {
                this.vel = 0;
            };

        } else if (this.moveMode === MOVE.ORBIT) {
            // TODO: move targetCircle generation to Selectable class
            // will have to move since it's based off its pos?
            for (let i = 0; i < this.numPoints; i++) {
                const angle = (i / this.numPoints) * Math.PI * 2; // angle for points in radians
                this.targetCircle[i].x = this.target.x + this.orbitRadius * Math.cos(angle);
                this.targetCircle[i].y = this.target.y + this.orbitRadius * Math.sin(angle);
            }
            let closestPoint = undefined;
            let closestDist = 100000;
            for (const p of this.targetCircle) {
                const dist = p.sub(this.pos).length();
                if (dist < closestDist) {
                    closestDist = dist;
                    closestPoint = p;
                }
            }
            const orbitDeadzone = 10;
            const firstNextPoint = !this.nextPoint || closestPoint.equals(this.nextPoint);
            if (closestDist < orbitDeadzone && firstNextPoint) { // pick next point
                const closestIndex = this.targetCircle.indexOf(closestPoint);
                const nextIndex = (closestIndex+1) % this.numPoints;
                this.nextPoint = this.targetCircle[nextIndex];
                const dir = this.nextPoint.sub(this.pos).normalize();
                this.pos.add(dir.scale(this.vel));
                this.angle = Math.atan2(dir.y, dir.x);
            } else if (this.nextPoint) { // go to next point
                const dir = this.nextPoint.sub(this.pos).normalize();
                this.pos.add(dir.scale(this.vel));
                this.angle = Math.atan2(dir.y, dir.x);
            } else { // go to closest point
                const dir = closestPoint.sub(this.pos).normalize();
                this.pos.add(dir.scale(this.vel));
                this.angle = Math.atan2(dir.y, dir.x);
            }
        }
        if (this.debug) this.points.push(this.pos);
    }
}
