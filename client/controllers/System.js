import { game } from './game.js';

export class System {
    constructor(name, color, instances) {
        this.name = name;
        this.color = color;
        this.instances = instances;
        this.currentInstance = instances[0];
    }

    setCurrentInstance(warpable) {
        const instance = this.instances.filter(i => i.warpable.id == warpable.id)[0];
        if (instance) {
            // Mark previous instance as inactive and reset it
            if (this.currentInstance) {
                this.currentInstance.reset();
            }
            // Mark new instance as active
            this.currentInstance = instance;
        } else {
            console.error('Failed to find instance for warpable:', warpable.name);
        }
    }

    update(delta) {
        // Only update the current instance
        if (this.currentInstance) {
            this.currentInstance.update(delta);
        }
        this.instances.map(i => i.warpable).forEach(w => w.update(delta));
        return this;
    }

    draw() {
        // TODO: system should probably delegate this to instance
        this.currentInstance.warpable.draw();
        // Show docking or warp prompt for current warpable
        const warpable = this.currentInstance.warpable;
        if (warpable.canDock && warpable.canDock()) {
            this.showDockingPrompt(warpable);
        } else if (warpable.targetSystem && warpable.canJump && warpable.canJump()) {
            this.showWarpPrompt(warpable);
        }
        // Don't draw asteroids/enemies if docked
        if (game.player.docked) return;
        // Draw current instance content (asteroids and enemies)
        if (this.currentInstance) {
            this.currentInstance.draw();
        }
    }

    showDockingPrompt(station) {
        game.ctx.save();
        game.ctx.fillStyle = 'grey';
        game.ctx.font = '12px Arial';
        game.ctx.textAlign = 'center';
        game.ctx.fillText(`Press E to dock`, station.pos.x, station.pos.y - 60);
        game.ctx.restore();
    }

    showWarpPrompt(gate) {
        game.ctx.save();
        game.ctx.fillStyle = '555555';
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
        const warpable = this.currentInstance.warpable
        if (warpable.type == 'station' && warpable.canDock()) {
            game.player.docked = warpable;
            return;
        }
        if (warpable.type == 'gate' && warpable.canJump() && !warpable.activating) {
            warpable.activate((completedGate) => this.jumpThroughGate(completedGate));
        }
    }

    jumpThroughGate(gate) {
        const targetSystem = game.server.loadSystem(gate.targetGate)
        game.system = targetSystem;
        // Find the corresponding gate in the new system that leads back
        const returnGate = targetSystem.instances
            .map(i => i.warpables)
            .filter(w => w.targetGate == gate.id);
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
