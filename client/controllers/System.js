import { game } from './game.js';
import { Instance } from './Instance.js';

export class System {
    constructor(name, color, stations, warpables = []) {
        this.name = name;
        this.color = color;
        this.stations = stations;
        this.warpables = warpables; // stations, planets, sun, gates - all things you can warp to
        this.instances = new Map(); // Map of warpable -> Instance
        this.currentInstance = null; // Currently active instance
    }

    createInstances() {
        this.warpables.forEach(warpable => {
            this.instances.set(warpable, new Instance(warpable));
        });
    }

    setCurrentInstance(warpable) {
        const instance = this.instances.get(warpable);
        if (instance) {
            // Mark previous instance as inactive and reset it
            if (this.currentInstance) {
                this.currentInstance.isActive = false;
                this.currentInstance.reset();
            }
            // Mark new instance as active
            this.currentInstance = instance;
            this.currentInstance.isActive = true;
        } else {
            console.error('Failed to find instance for warpable:', warpable.name);
        }
    }

    update(delta) {
        // Only update the current instance
        if (this.currentInstance) {
            this.currentInstance.update(delta);
        }
        this.warpables.forEach(w => w.update(delta));
        return this;
    }

    draw() {
        // Only draw warpable for current instance
        if (this.currentInstance && this.currentInstance.warpable) {
            this.currentInstance.warpable.draw();
            // Show docking or warp prompt for current warpable
            const warpable = this.currentInstance.warpable;
            if (warpable.canDock && warpable.canDock()) {
                this.#showDockingPrompt(warpable);
            } else if (warpable.targetSystem && warpable.canJump && warpable.canJump()) {
                this.#showWarpPrompt(warpable);
            }
        }
        // Don't draw asteroids/enemies if docked
        if (game.player.docked) return;
        // Draw current instance content (asteroids and enemies)
        if (this.currentInstance) {
            this.currentInstance.draw();
        }
    }

    #showDockingPrompt(station) {
        game.ctx.save();
        game.ctx.fillStyle = 'grey';
        game.ctx.font = '12px Arial';
        game.ctx.textAlign = 'center';
        game.ctx.fillText(`Press E to dock`, station.pos.x, station.pos.y - 60);
        game.ctx.restore();
    }

    #showWarpPrompt(gate) {
        game.ctx.save();
        game.ctx.fillStyle = '#555555';
        game.ctx.font = '12px Arial';
        game.ctx.textAlign = 'center';
        game.ctx.fillText(`Press E to jump`, gate.pos.x, gate.pos.y - 45);
        game.ctx.restore();
    }

    handleDocking() {
        if (game.player.docked) {
            game.player.docked = undefined;
            return;
        }
        // Check if current warpable is a dockable station
        if (this.currentInstance && this.currentInstance.warpable.canDock) {
            const station = this.currentInstance.warpable;
            if (station.canDock()) {
                game.player.docked = station;
                return;
            }
        }
        // Check if current warpable is a gate that can be jumped through
        if (this.currentInstance && this.currentInstance.warpable.canJump) {
            const gate = this.currentInstance.warpable;
            if (gate.canJump() && !gate.activating) {
                gate.activate((completedGate) => this.jumpThroughGate(completedGate));
            }
        }
    }

    jumpThroughGate(gate) {
        if (!gate.targetSystem) return;
        const previousSystem = game.system;
        game.system = gate.targetSystem;        
        // Find the corresponding gate in the new system that leads back
        const returnGate = gate.targetSystem.warpables.find(w => 
            w.targetSystem === previousSystem
        );
        if (returnGate) {
            game.system.setCurrentInstance(returnGate);
            game.player.ship.pos.x = returnGate.pos.x + 50;
            game.player.ship.pos.y = returnGate.pos.y + 50;
        } else {
            // Fallback to first warpable
            const fallback = gate.targetSystem.warpables[0];
            game.system.setCurrentInstance(fallback);
            game.player.ship.pos.x = fallback.pos.x + 50;
            game.player.ship.pos.y = fallback.pos.y + 50;
        }
    }
}
