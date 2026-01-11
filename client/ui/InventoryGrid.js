import { game } from '../controllers/game.js';
import { UIHelper } from './UIHelper.js';
import { UI_COLORS, UI_FONTS, ORE } from '../../shared/Constants.js';

// TODO: introduce new modules for increasing inventory size

// TODO: split equipped modules into 4 active, 2 passive - with text indicators
// new ships can have more passive modules, no ship has more than 4 actives

// turn credit and rep into favor. and use favor to research.

export class InventoryGrid {
    constructor() {
        this.cellSize = 40;
        this.cellPadding = 4;
        this.draggedItem = null;
        this.draggedFrom = null; // { type: 'equipped'|'inventory', index: number }
        this.dragOffset = { x: 0, y: 0 };
        this.hoveredSlot = null;
        this.lastMousePos = null;
        
        // Grid layouts
        this.equippedGrid = {
            cols: 3,
            rows: 2,
            x: 0,
            y: 0
        };
        
        this.inventoryGrid = {
            cols: 5,
            rows: 4,
            x: 0,
            y: 0
        };
        
        this.stashGrid = {
            cols: 5,
            rows: 4,
            x: 0,
            y: 0
        };
    }

    // TODO: make the text be longer for modules
    // and probably break it.

    draw(dialogX, dialogWidth, yOffset) {
        // Draw equipped modules section
        yOffset = UIHelper.drawSectionHeader('Equipped Modules', dialogWidth, yOffset, dialogX);
        this.equippedGrid.x = dialogX + 30;
        this.equippedGrid.y = yOffset;
        yOffset = this.#drawGrid(game.player.ship.modules, this.equippedGrid, 'equipped');
        
        // Draw inventory section
        yOffset += 20;
        yOffset = UIHelper.drawSectionHeader('Inventory', dialogWidth, yOffset, dialogX);
        this.inventoryGrid.x = dialogX + 30;
        this.inventoryGrid.y = yOffset;
        yOffset = this.#drawGrid(game.player.ship.inventory, this.inventoryGrid, 'inventory');
        
        // Draw dragged item on top
        if (this.draggedItem) {
            this.#drawItem(
                this.draggedItem,
                this.lastMousePos.x - this.dragOffset.x,
                this.lastMousePos.y - this.dragOffset.y,
                true
            );
        }
        
        return yOffset;
    }

    drawEquipped(columnX, columnWidth, yOffset) {
        this.equippedGrid.x = columnX;
        this.equippedGrid.y = yOffset;
        this.#drawGrid(game.player.ship.modules, this.equippedGrid, 'equipped');
        this.#drawHoverTooltip();
    }

    drawInventoryOnly(columnX, columnWidth, yOffset) {
        this.inventoryGrid.x = columnX;
        this.inventoryGrid.y = yOffset;
        this.#drawGrid(game.player.ship.inventory, this.inventoryGrid, 'inventory');
        this.#drawHoverTooltip();
    }

    drawStash(columnX, columnWidth, yOffset, salvageMode = false) {
        this.stashGrid.x = columnX;
        this.stashGrid.y = yOffset;
        this.#drawGrid(game.quantumStash, this.stashGrid, 'stash', salvageMode);
        this.#drawHoverTooltip();
    }

    drawDraggedItem() {
        if (this.draggedItem && this.lastMousePos) {
            this.#drawItem(
                this.draggedItem,
                this.lastMousePos.x - this.dragOffset.x,
                this.lastMousePos.y - this.dragOffset.y,
                true
            );
        }
    }

    #drawGrid(items, grid, gridType, salvageMode = false) {
        const totalWidth = grid.cols * (this.cellSize + this.cellPadding);
        const totalHeight = grid.rows * (this.cellSize + this.cellPadding);
        
        // Draw grid background
        game.ctx.fillStyle = UI_COLORS.BG_GRID;
        game.ctx.fillRect(grid.x, grid.y, totalWidth, totalHeight);
        
        // Draw grid cells
        for (let row = 0; row < grid.rows; row++) {
            for (let col = 0; col < grid.cols; col++) {
                const index = row * grid.cols + col;
                const x = grid.x + col * (this.cellSize + this.cellPadding);
                const y = grid.y + row * (this.cellSize + this.cellPadding);
                
                // Check if hovered
                const isHovered = this.hoveredSlot && 
                                 this.hoveredSlot.type === gridType && 
                                 this.hoveredSlot.index === index;
                
                // Draw cell background
                if (isHovered && this.draggedItem) {
                    game.ctx.fillStyle = UI_COLORS.HOVER;
                } else {
                    game.ctx.fillStyle = UI_COLORS.BG_GRID;
                }
                game.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                
                // Draw cell border
                game.ctx.strokeStyle = isHovered ? UI_COLORS.HOVER_BORDER : UI_COLORS.BORDER;
                game.ctx.lineWidth = 1;
                game.ctx.strokeRect(x, y, this.cellSize, this.cellSize);
                
                // Draw item if present
                if (index < items.length) {
                    const item = items[index];
                    // Don't draw if this is the item being dragged
                    if (this.draggedItem !== item) {
                        // Check if item should be greyed out in salvage mode
                        const isGreyedOut = salvageMode && Object.keys(ORE).includes(item.name);
                        this.#drawItem(item, x, y, false, isGreyedOut);
                    }
                }
            }
        }
        
        return grid.y + totalHeight + this.cellPadding;
    }

    #drawItem(item, x, y, isDragging, isGreyedOut = false) {
        // Draw item background with rarity color
        const rarityColor = this.#getRarityColor(item.rarity);
        game.ctx.fillStyle = isGreyedOut ? 'rgba(50, 50, 50, 0.6)' : rarityColor;
        game.ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
        
        // Draw item border
        const borderColor = isGreyedOut ? 'rgba(100, 100, 100, 0.9)' : (isDragging ? 'rgba(255, 255, 255, 0.9)' : rarityColor.replace('0.6', '0.9'));
        game.ctx.strokeStyle = borderColor;
        game.ctx.lineWidth = 2;
        game.ctx.strokeRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
        
        // Draw item icon/text
        game.ctx.fillStyle = isGreyedOut ? 'rgba(150, 150, 150, 0.7)' : UI_COLORS.TEXT_WHITE;
        game.ctx.font = UI_FONTS.LABEL;
        game.ctx.textAlign = 'center';
        game.ctx.textBaseline = 'middle';
        
        // Draw abbreviated name
        const abbrev = this.#getAbbreviation(item.name);
        game.ctx.fillText(abbrev, x + this.cellSize / 2, y + this.cellSize / 2 - 5);
        
        // Draw amount if > 1
        if (item.amount > 1) {
            game.ctx.font = UI_FONTS.TINY;
            game.ctx.fillStyle = isGreyedOut ? 'rgba(150, 150, 150, 0.7)' : UI_COLORS.TEXT_HIGHLIGHT;
            const amountText = item.amount > 999 ? '999+' : item.amount.toFixed(0);
            game.ctx.fillText(amountText, x + this.cellSize / 2, y + this.cellSize - 8);
        }
        
        game.ctx.textAlign = 'left';
        game.ctx.textBaseline = 'alphabetic';
    }

    #getAbbreviation(name) {
        // Create 2-3 letter abbreviation from name
        const words = name.split(' ');
        if (words.length > 1) {
            return words.map(w => w[0]).join('').substring(0, 3).toUpperCase();
        }
        return name.substring(0, 3).toUpperCase();
    }

    #getRarityColor(rarity) {
        switch(rarity) {
            case 'SIMPLE': return 'rgba(150, 150, 150, 0.6)';
            case 'MODIFIED': return 'rgba(100, 150, 255, 0.6)';
            case 'COMPLEX': return 'rgba(255, 200, 50, 0.6)';
            default: return 'rgba(200, 200, 200, 0.6)';
        }
    }

    handleMouseDown(clickPos, preventStashDrag = false) {
        // Check equipped modules
        const equippedIndex = this.#getSlotAtPosition(clickPos, this.equippedGrid);
        if (equippedIndex !== -1 && equippedIndex < game.player.ship.modules.length) {
            this.draggedItem = game.player.ship.modules[equippedIndex];
            this.draggedFrom = { type: 'equipped', index: equippedIndex };
            this.dragOffset = {
                x: clickPos.x - (this.equippedGrid.x + (equippedIndex % this.equippedGrid.cols) * (this.cellSize + this.cellPadding)),
                y: clickPos.y - (this.equippedGrid.y + Math.floor(equippedIndex / this.equippedGrid.cols) * (this.cellSize + this.cellPadding))
            };
            return true;
        }
        
        // Check inventory
        const inventoryIndex = this.#getSlotAtPosition(clickPos, this.inventoryGrid);
        if (inventoryIndex !== -1 && inventoryIndex < game.player.ship.inventory.length) {
            this.draggedItem = game.player.ship.inventory[inventoryIndex];
            this.draggedFrom = { type: 'inventory', index: inventoryIndex };
            this.dragOffset = {
                x: clickPos.x - (this.inventoryGrid.x + (inventoryIndex % this.inventoryGrid.cols) * (this.cellSize + this.cellPadding)),
                y: clickPos.y - (this.inventoryGrid.y + Math.floor(inventoryIndex / this.inventoryGrid.cols) * (this.cellSize + this.cellPadding))
            };
            return true;
        }
        
        // Check stash (if docked) - but not if in salvage mode
        if (game.player && game.player.docked && !preventStashDrag) {
            const stashIndex = this.#getSlotAtPosition(clickPos, this.stashGrid);
            if (stashIndex !== -1 && stashIndex < game.quantumStash.length) {
                this.draggedItem = game.quantumStash[stashIndex];
                this.draggedFrom = { type: 'stash', index: stashIndex };
                this.dragOffset = {
                    x: clickPos.x - (this.stashGrid.x + (stashIndex % this.stashGrid.cols) * (this.cellSize + this.cellPadding)),
                    y: clickPos.y - (this.stashGrid.y + Math.floor(stashIndex / this.stashGrid.cols) * (this.cellSize + this.cellPadding))
                };
                return true;
            }
        }
        
        return false;
    }

    handleMouseMove(mousePos) {
        this.lastMousePos = mousePos;
        
        if (!this.draggedItem) {
            // Update hovered slot
            const equippedIndex = this.#getSlotAtPosition(mousePos, this.equippedGrid);
            if (equippedIndex !== -1) {
                this.hoveredSlot = { type: 'equipped', index: equippedIndex };
                return;
            }
            
            const inventoryIndex = this.#getSlotAtPosition(mousePos, this.inventoryGrid);
            if (inventoryIndex !== -1) {
                this.hoveredSlot = { type: 'inventory', index: inventoryIndex };
                return;
            }
            
            if (game.player && game.player.docked) {
                const stashIndex = this.#getSlotAtPosition(mousePos, this.stashGrid);
                if (stashIndex !== -1) {
                    this.hoveredSlot = { type: 'stash', index: stashIndex };
                    return;
                }
            }
            
            this.hoveredSlot = null;
        } else {
            // Update hovered slot while dragging
            const equippedIndex = this.#getSlotAtPosition(mousePos, this.equippedGrid);
            if (equippedIndex !== -1 && equippedIndex < this.equippedGrid.cols * this.equippedGrid.rows) {
                this.hoveredSlot = { type: 'equipped', index: equippedIndex };
                return;
            }
            
            const inventoryIndex = this.#getSlotAtPosition(mousePos, this.inventoryGrid);
            if (inventoryIndex !== -1 && inventoryIndex < this.inventoryGrid.cols * this.inventoryGrid.rows) {
                this.hoveredSlot = { type: 'inventory', index: inventoryIndex };
                return;
            }
            
            if (game.player && game.player.docked) {
                const stashIndex = this.#getSlotAtPosition(mousePos, this.stashGrid);
                if (stashIndex !== -1 && stashIndex < this.stashGrid.cols * this.stashGrid.rows) {
                    this.hoveredSlot = { type: 'stash', index: stashIndex };
                    return;
                }
            }
            
            this.hoveredSlot = null;
        }
    }

    #drawHoverTooltip() {
        if (!this.hoveredSlot || !this.lastMousePos) return;
        const { type, index } = this.hoveredSlot;
        let sourceArray;
        if (type === 'equipped') {
            sourceArray = game.player.ship.modules;
        } else if (type === 'inventory') {
            sourceArray = game.player.ship.inventory;
        } else if (type === 'stash') {
            sourceArray = game.quantumStash;
        }
        if (!sourceArray || index >= sourceArray.length) return;
        const item = sourceArray[index];
        if (!item) return;
        const lines = this.#buildTooltipLines(item);
        UIHelper.drawTooltipLines(this.lastMousePos.x + 16, this.lastMousePos.y - 12, lines);
    }

    #buildTooltipLines(item) {
        const rarityLabel = this.#rarityLabel(item.rarity);
        const amountText = item.amount > 1 ? `${this.#formatAmount(item.amount)} ${item.unit}` : `${item.unit || ''}`.trim();
        const lines = [
            `${rarityLabel} ${item.name}`.trim(),
            amountText || '1 unit'
        ];

        const affixLines = [...(item.prefixes || []), ...(item.suffixes || [])]
            .map(([affix, tier]) => {
                const desc = affix?.desc || 'Affix';
                const tierVal = Array.isArray(affix?.tier) ? affix.tier[tier] : undefined;
                return tierVal !== undefined ? `${desc} (+${tierVal})` : desc;
            });
        if (affixLines.length) {
            lines.push('Affixes:', ...affixLines);
        }
        return lines;
    }

    #rarityLabel(rarity) {
        if (rarity === 0 || rarity === 'SIMPLE') return 'Simple';
        if (rarity === 1 || rarity === 'MODIFIED') return 'Modified';
        if (rarity === 2 || rarity === 'COMPLEX') return 'Complex';
        return 'Common';
    }

    #formatAmount(amount) {
        if (amount >= 1000) return `${Math.floor(amount)}+`;
        if (Number.isInteger(amount)) return amount.toString();
        return amount.toFixed(1);
    }

    handleMouseUp(clickPos) {
        if (!this.draggedItem) return false;
        
        // Find target slot
        let targetSlot = null;
        
        const equippedIndex = this.#getSlotAtPosition(clickPos, this.equippedGrid);
        if (equippedIndex !== -1 && equippedIndex < this.equippedGrid.cols * this.equippedGrid.rows) {
            targetSlot = { type: 'equipped', index: equippedIndex };
        } else {
            const inventoryIndex = this.#getSlotAtPosition(clickPos, this.inventoryGrid);
            if (inventoryIndex !== -1 && inventoryIndex < this.inventoryGrid.cols * this.inventoryGrid.rows) {
                targetSlot = { type: 'inventory', index: inventoryIndex };
            } else if (game.player && game.player.docked) {
                const stashIndex = this.#getSlotAtPosition(clickPos, this.stashGrid);
                if (stashIndex !== -1 && stashIndex < this.stashGrid.cols * this.stashGrid.rows) {
                    targetSlot = { type: 'stash', index: stashIndex };
                }
            }
        }
        
        // Perform the move/swap
        if (targetSlot) {
            this.#moveItem(this.draggedFrom, targetSlot);
        }
        
        this.draggedItem = null;
        this.draggedFrom = null;
        this.hoveredSlot = null;
        return true;
    }

    #getSlotAtPosition(pos, grid) {
        if (!pos) return -1;
        
        const relX = pos.x - grid.x;
        const relY = pos.y - grid.y;
        
        if (relX < 0 || relY < 0) return -1;
        
        const col = Math.floor(relX / (this.cellSize + this.cellPadding));
        const row = Math.floor(relY / (this.cellSize + this.cellPadding));
        
        if (col >= grid.cols || row >= grid.rows) return -1;
        
        // Check if actually inside the cell (not in padding)
        const cellX = relX % (this.cellSize + this.cellPadding);
        const cellY = relY % (this.cellSize + this.cellPadding);
        
        if (cellX >= this.cellSize || cellY >= this.cellSize) return -1;
        
        return row * grid.cols + col;
    }

    #moveItem(from, to) {
        // Get source and target arrays
        let sourceArray, targetArray;
        if (from.type === 'equipped') {
            sourceArray = game.player.ship.modules;
        } else if (from.type === 'inventory') {
            sourceArray = game.player.ship.inventory;
        } else if (from.type === 'stash') {
            sourceArray = game.quantumStash;
        }
        
        if (to.type === 'equipped') {
            targetArray = game.player.ship.modules;
        } else if (to.type === 'inventory') {
            targetArray = game.player.ship.inventory;
        } else if (to.type === 'stash') {
            targetArray = game.quantumStash;
        }
        
        if (!sourceArray || !targetArray) return;
        
        // Get the items
        const sourceItem = sourceArray[from.index];
        if (!sourceItem) return;
        
        const targetItem = to.index < targetArray.length ? targetArray[to.index] : null;
        
        // Check if we can stack items (same name, both have stackSize)
        if (targetItem && sourceItem.name === targetItem.name && sourceItem.stackSize && targetItem.stackSize) {
            const spaceInTarget = sourceItem.stackSize - targetItem.amount;
            if (spaceInTarget > 0) {
                const amountToMove = Math.min(sourceItem.amount, spaceInTarget);
                targetItem.amount += amountToMove;
                sourceItem.amount -= amountToMove;
                
                // Remove source item if depleted
                if (sourceItem.amount <= 0) {
                    sourceArray.splice(from.index, 1);
                }
                return;
            }
        }
        
        // Handle swap/move
        if (from.type === to.type && sourceArray === targetArray) {
            // Same array - simple swap or move
            if (targetItem) {
                // Swap items
                sourceArray[from.index] = targetItem;
                sourceArray[to.index] = sourceItem;
            } else {
                // Move to empty slot in same array
                sourceArray.splice(from.index, 1);
                // Adjust index if moving forward in the same array
                const insertIndex = to.index > from.index ? to.index - 1 : to.index;
                sourceArray.splice(insertIndex, 0, sourceItem);
            }
        } else {
            // Different arrays
            // Remove from source
            sourceArray.splice(from.index, 1);
            
            if (targetItem) {
                // Swap: remove target and put it in source location
                targetArray.splice(to.index, 1, sourceItem);
                sourceArray.splice(from.index, 0, targetItem);
            } else {
                // Just insert into target at the specified index
                targetArray.splice(to.index, 0, sourceItem);
            }
        }
    }
}
