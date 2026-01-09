import { Mission } from './Mission.js';
import { game } from '../controllers/game.js';

export class MiningMission extends Mission {
    constructor(station, requiredOre, amount, reward) {
        const description = `Deliver ${amount} units of ${requiredOre} to ${station.name}`;
        super(description, station, reward);
        this.requiredOre = requiredOre;
        this.amount = amount;
    }

    canComplete () {
        // Check ship inventory first
        const shipAmount = game.player.ship.inventory
            .filter(item => item.name === this.requiredOre)
            .reduce((sum, item) => sum + item.amount, 0);
        
        if (shipAmount >= this.amount) return true;
        
        // Check quantum stash if docked
        if (game.player.docked) {
            const stashAmount = game.quantumStash
                .filter(item => item.name === this.requiredOre)
                .reduce((sum, item) => sum + item.amount, 0);
            
            return (shipAmount + stashAmount) >= this.amount;
        }
        
        return false;
    }

    complete () {
        this.completeSuper();
        
        let remaining = this.amount;
        
        // Remove from ship inventory first
        const shipStacks = game.player.ship.inventory.filter(m => m.name === this.requiredOre);
        for (const stack of shipStacks) {
            if (remaining <= 0) break;
            
            const toRemove = Math.min(remaining, stack.amount);
            stack.amount -= toRemove;
            remaining -= toRemove;
            
            if (stack.amount <= 0) {
                const index = game.player.ship.inventory.indexOf(stack);
                game.player.ship.inventory.splice(index, 1);
            }
        }
        
        // If still need more, remove from quantum stash
        if (remaining > 0 && game.player.docked) {
            const stashStacks = game.quantumStash.filter(m => m.name === this.requiredOre);
            for (const stack of stashStacks) {
                if (remaining <= 0) break;
                
                const toRemove = Math.min(remaining, stack.amount);
                stack.amount -= toRemove;
                remaining -= toRemove;
                
                if (stack.amount <= 0) {
                    const index = game.quantumStash.indexOf(stack);
                    game.quantumStash.splice(index, 1);
                }
            }
        }
    }
}