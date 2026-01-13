import { game } from '../controllers/game.js';
import { UIHelper } from './UIHelper.js';
import { UI_COLORS, UI_FONTS, ORE, RARITY } from '../../shared/Constants.js';
import { Module } from '../modules/Module.js';

// TODO: introduce new modules for increasing inventory size
// TODO: remove rep - eventually a better system than credits should be done
// TODO: make the text be longer for modules and probably break it.

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
        this.activeModulesGrid = {
            cols: 4,
            rows: 1,
            x: 0,
            y: 0
        };
        
        this.passiveModulesGrid = {
            cols: 2,
            rows: 1,
            x: 0,
            y: 0
        };
        
        this.equippedGrid = {  // Legacy - keep for compatibility
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

    draw(dialogX, dialogWidth, yOffset) {
        // Draw equipped modules section - split into active and passive
        const activeModules = game.player.ship.modules.filter(m => Module.isActive(m.name));
        const passiveModules = game.player.ship.modules.filter(m => !Module.isActive(m.name));
        
        // Active modules (4 slots, 2 rows x 2 cols)
        yOffset = UIHelper.drawSectionHeader('Active Modules', dialogWidth, yOffset, dialogX);
        this.activeModulesGrid.x = dialogX + 30;
        this.activeModulesGrid.y = yOffset;
        yOffset = this.#drawGrid(activeModules, this.activeModulesGrid, 'active');
        
        // Passive modules (2 slots, 1 row x 2 cols)
        yOffset += 5;
        yOffset = UIHelper.drawSectionHeader('Passive Modules', dialogWidth, yOffset, dialogX);
        this.passiveModulesGrid.x = dialogX + 30;
        this.passiveModulesGrid.y = yOffset;
        yOffset = this.#drawGrid(passiveModules, this.passiveModulesGrid, 'passive');
        
        // Draw inventory section
        yOffset += 10;
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
        const activeModules = game.player.ship.modules.filter(m => Module.isActive(m.name));
        const passiveModules = game.player.ship.modules.filter(m => !Module.isActive(m.name));
        
        // Draw "Active Modules" label
        game.ctx.fillStyle = UI_COLORS.TEXT_SECONDARY;
        game.ctx.font = UI_FONTS.SMALL;
        game.ctx.textAlign = 'left';
        game.ctx.fillText('Active Modules', columnX, yOffset);
        yOffset += 18;
        
        // Draw active modules
        this.activeModulesGrid.x = columnX;
        this.activeModulesGrid.y = yOffset;
        this.#drawGrid(activeModules, this.activeModulesGrid, 'active');
        
        // Draw passive modules below active
        const activeHeight = this.activeModulesGrid.rows * (this.cellSize + this.cellPadding);
        yOffset += activeHeight + 15;
        
        // Draw "Passive Modules" label
        game.ctx.fillStyle = UI_COLORS.TEXT_SECONDARY;
        game.ctx.font = UI_FONTS.SMALL;
        game.ctx.textAlign = 'left';
        game.ctx.fillText('Passive Modules', columnX, yOffset);
        yOffset += 18;
        
        this.passiveModulesGrid.x = columnX;
        this.passiveModulesGrid.y = yOffset;
        this.#drawGrid(passiveModules, this.passiveModulesGrid, 'passive');
        
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
        this.#drawGrid(game.player.quantumStash, this.stashGrid, 'stash', salvageMode);
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
            case RARITY.SIMPLE: return 'rgba(150, 150, 150, 0.6)';
            case RARITY.MODIFIED: return 'rgba(100, 150, 255, 0.6)';
            case RARITY.COMPLEX: return 'rgba(255, 200, 50, 0.6)';
            default: return 'rgba(200, 200, 200, 0.6)';
        }
    }

    handleMouseDown(clickPos, preventStashDrag = false, researchUI = null) {
        // Check research slot first (if on research tab)
        if (researchUI && this.researchSlotGrid) {
            const researchIndex = this.#getSlotAtPosition(clickPos, this.researchSlotGrid);
            if (researchIndex !== -1 && researchUI.researchSlot) {
                this.draggedItem = researchUI.researchSlot;
                this.draggedFrom = { type: 'research', index: 0, researchUI: researchUI };
                this.dragOffset = {
                    x: clickPos.x - this.researchSlotGrid.x,
                    y: clickPos.y - this.researchSlotGrid.y
                };
                return true;
            }
        }
        
        // Check active modules
        const activeModules = game.player.ship.modules.filter(m => Module.isActive(m.name));
        const activeIndex = this.#getSlotAtPosition(clickPos, this.activeModulesGrid);
        if (activeIndex !== -1 && activeIndex < activeModules.length) {
            const actualIndex = game.player.ship.modules.indexOf(activeModules[activeIndex]);
            this.draggedItem = game.player.ship.modules[actualIndex];
            this.draggedFrom = { type: 'active', index: actualIndex };
            this.dragOffset = {
                x: clickPos.x - (this.activeModulesGrid.x + (activeIndex % this.activeModulesGrid.cols) * (this.cellSize + this.cellPadding)),
                y: clickPos.y - (this.activeModulesGrid.y + Math.floor(activeIndex / this.activeModulesGrid.cols) * (this.cellSize + this.cellPadding))
            };
            return true;
        }
        
        // Check passive modules
        const passiveModules = game.player.ship.modules.filter(m => !Module.isActive(m.name));
        const passiveIndex = this.#getSlotAtPosition(clickPos, this.passiveModulesGrid);
        if (passiveIndex !== -1 && passiveIndex < passiveModules.length) {
            const actualIndex = game.player.ship.modules.indexOf(passiveModules[passiveIndex]);
            this.draggedItem = game.player.ship.modules[actualIndex];
            this.draggedFrom = { type: 'passive', index: actualIndex };
            this.dragOffset = {
                x: clickPos.x - (this.passiveModulesGrid.x + (passiveIndex % this.passiveModulesGrid.cols) * (this.cellSize + this.cellPadding)),
                y: clickPos.y - (this.passiveModulesGrid.y + Math.floor(passiveIndex / this.passiveModulesGrid.cols) * (this.cellSize + this.cellPadding))
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
            if (stashIndex !== -1 && stashIndex < game.player.quantumStash.length) {
                this.draggedItem = game.player.quantumStash[stashIndex];
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
        
        if (!game.player || !game.player.ship) return;
        
        if (!this.draggedItem) {
            // Update hovered slot
            const activeModules = game.player.ship.modules.filter(m => Module.isActive(m.name));
            const activeIndex = this.#getSlotAtPosition(mousePos, this.activeModulesGrid);
            if (activeIndex !== -1) {
                this.hoveredSlot = { type: 'active', index: activeIndex };
                return;
            }
            
            const passiveModules = game.player.ship.modules.filter(m => !Module.isActive(m.name));
            const passiveIndex = this.#getSlotAtPosition(mousePos, this.passiveModulesGrid);
            if (passiveIndex !== -1) {
                this.hoveredSlot = { type: 'passive', index: passiveIndex };
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
                
                // Check research slot
                if (this.researchSlotGrid) {
                    const researchIndex = this.#getSlotAtPosition(mousePos, this.researchSlotGrid);
                    if (researchIndex !== -1) {
                        this.hoveredSlot = { type: 'research', index: researchIndex };
                        return;
                    }
                }
            }
            
            this.hoveredSlot = null;
        } else {
            // Update hovered slot while dragging
            const activeIndex = this.#getSlotAtPosition(mousePos, this.activeModulesGrid);
            if (activeIndex !== -1 && activeIndex < this.activeModulesGrid.cols * this.activeModulesGrid.rows) {
                this.hoveredSlot = { type: 'active', index: activeIndex };
                return;
            }
            
            const passiveIndex = this.#getSlotAtPosition(mousePos, this.passiveModulesGrid);
            if (passiveIndex !== -1 && passiveIndex < this.passiveModulesGrid.cols * this.passiveModulesGrid.rows) {
                this.hoveredSlot = { type: 'passive', index: passiveIndex };
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
                
                // Check research slot while dragging
                if (this.researchSlotGrid) {
                    const researchIndex = this.#getSlotAtPosition(mousePos, this.researchSlotGrid);
                    if (researchIndex !== -1) {
                        this.hoveredSlot = { type: 'research', index: researchIndex };
                        return;
                    }
                }
            }
            
            this.hoveredSlot = null;
        }
    }

    #drawHoverTooltip() {
        if (!this.hoveredSlot || !this.lastMousePos) return;
        const { type, index } = this.hoveredSlot;
        let sourceArray;
        if (type === 'active' || type === 'passive') {
            // For active/passive, we need to get the filtered array
            const activeModules = game.player.ship.modules.filter(m => Module.isActive(m.name));
            const passiveModules = game.player.ship.modules.filter(m => !Module.isActive(m.name));
            sourceArray = type === 'active' ? activeModules : passiveModules;
        } else if (type === 'inventory') {
            sourceArray = game.player.ship.inventory;
        } else if (type === 'stash') {
            sourceArray = game.player.quantumStash;
        } else if (type === 'research') {
            sourceArray = [this.researchSlot];
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
        if (rarity === RARITY.SIMPLE) return 'Simple';
        if (rarity === RARITY.MODIFIED) return 'Modified';
        if (rarity === RARITY.COMPLEX) return 'Complex';
        return 'Common';
    }

    #formatAmount(amount) {
        if (amount >= 1000) return `${Math.floor(amount)}+`;
        if (Number.isInteger(amount)) return amount.toString();
        return amount.toFixed(1);
    }

    handleMouseUp(clickPos, researchUI = null) {
        if (!this.draggedItem) return false;
        
        // Find target slot
        let targetSlot = null;
        
        // Check research slot first (if on research tab)
        if (researchUI && this.researchSlotGrid) {
            const researchIndex = this.#getSlotAtPosition(clickPos, this.researchSlotGrid);
            if (researchIndex !== -1) {
                // Only allow non-ore modules in research slot
                const oreNames = Object.keys(ORE);
                if (!oreNames.includes(this.draggedItem.name)) {
                    targetSlot = { type: 'research', index: 0, researchUI: researchUI };
                }
            }
        }
        
        if (!targetSlot) {
            // Check active modules grid
            const activeIndex = this.#getSlotAtPosition(clickPos, this.activeModulesGrid);
            if (activeIndex !== -1 && activeIndex < this.activeModulesGrid.cols * this.activeModulesGrid.rows) {
                targetSlot = { type: 'active', index: activeIndex };
            } else {
                // Check passive modules grid
                const passiveIndex = this.#getSlotAtPosition(clickPos, this.passiveModulesGrid);
                if (passiveIndex !== -1 && passiveIndex < this.passiveModulesGrid.cols * this.passiveModulesGrid.rows) {
                    targetSlot = { type: 'passive', index: passiveIndex };
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
        if (!pos || !grid) return -1;
        
        const relX = pos.x - grid.x;
        const relY = pos.y - grid.y;
        
        if (relX < 0 || relY < 0) return -1;
        
        // Use grid's cellSize if available, otherwise use default
        const cellSize = grid.cellSize || this.cellSize;
        const cellPadding = this.cellPadding;
        
        const col = Math.floor(relX / (cellSize + cellPadding));
        const row = Math.floor(relY / (cellSize + cellPadding));
        
        if (col >= grid.cols || row >= grid.rows) return -1;
        
        // Check if actually inside the cell (not in padding)
        const cellX = relX % (cellSize + cellPadding);
        const cellY = relY % (cellSize + cellPadding);
        
        if (cellX >= cellSize || cellY >= cellSize) return -1;
        
        return row * grid.cols + col;
    }

    #moveItem(from, to) {
        // Handle research slot specially
        if (from.type === 'research' || to.type === 'research') {
            const researchUI = from.researchUI || to.researchUI;
            if (!researchUI) return;
            
            if (from.type === 'research' && to.type === 'research') {
                // Same slot, do nothing
                return;
            } else if (from.type === 'research') {
                // Moving from research to another location
                const sourceItem = researchUI.researchSlot;
                if (!sourceItem) return;
                
                // Get target array
                let targetArray;
                if (to.type === 'active' || to.type === 'passive' || to.type === 'equipped') {
                    targetArray = game.player.ship.modules;
                } else if (to.type === 'inventory') {
                    targetArray = game.player.ship.inventory;
                } else if (to.type === 'stash') {
                    targetArray = game.player.quantumStash;
                }
                
                if (!targetArray) return;
                
                const targetItem = to.index < targetArray.length ? targetArray[to.index] : null;
                
                if (targetItem) {
                    // Swap
                    targetArray[to.index] = sourceItem;
                    researchUI.researchSlot = targetItem;
                } else {
                    // Move to empty slot
                    targetArray.splice(to.index, 0, sourceItem);
                    researchUI.researchSlot = null;
                }
                return;
            } else if (to.type === 'research') {
                // Moving to research slot
                let sourceArray;
                if (from.type === 'active' || from.type === 'passive' || from.type === 'equipped') {
                    sourceArray = game.player.ship.modules;
                } else if (from.type === 'inventory') {
                    sourceArray = game.player.ship.inventory;
                } else if (from.type === 'stash') {
                    sourceArray = game.player.quantumStash;
                }
                
                if (!sourceArray) return;
                
                const sourceItem = sourceArray[from.index];
                if (!sourceItem) return;
                
                const targetItem = researchUI.researchSlot;
                
                if (targetItem) {
                    // Swap
                    sourceArray[from.index] = targetItem;
                    researchUI.researchSlot = sourceItem;
                } else {
                    // Move to empty research slot
                    sourceArray.splice(from.index, 1);
                    researchUI.researchSlot = sourceItem;
                }
                return;
            }
        }
        
        // Get source and target arrays
        let sourceArray, targetArray;
        let actualToIndex = to.index; // Will be adjusted for active/passive grids
        
        if (from.type === 'active' || from.type === 'passive' || from.type === 'equipped') {
            sourceArray = game.player.ship.modules;
        } else if (from.type === 'inventory') {
            sourceArray = game.player.ship.inventory;
        } else if (from.type === 'stash') {
            sourceArray = game.player.quantumStash;
        }
        
        if (to.type === 'active' || to.type === 'passive' || to.type === 'equipped') {
            targetArray = game.player.ship.modules;
            
            // Convert grid index to actual modules array index
            if (to.type === 'active') {
                const activeModules = game.player.ship.modules.filter(m => Module.isActive(m.name));
                if (to.index < activeModules.length) {
                    actualToIndex = game.player.ship.modules.indexOf(activeModules[to.index]);
                } else {
                    // Dropping into empty active slot - find first empty active slot or add at end
                    actualToIndex = game.player.ship.modules.length;
                }
            } else if (to.type === 'passive') {
                const passiveModules = game.player.ship.modules.filter(m => !Module.isActive(m.name));
                if (to.index < passiveModules.length) {
                    actualToIndex = game.player.ship.modules.indexOf(passiveModules[to.index]);
                } else {
                    // Dropping into empty passive slot - add at end
                    actualToIndex = game.player.ship.modules.length;
                }
            }
            
            // Validate module type for active/passive slots
            const sourceItem = sourceArray[from.index];
            if (sourceItem && to.type !== 'equipped') {
                const isActiveModule = Module.isActive(sourceItem.name);
                if ((to.type === 'active' && !isActiveModule) || (to.type === 'passive' && isActiveModule)) {
                    // Invalid placement - active module in passive slot or vice versa
                    return;
                }
            }
        } else if (to.type === 'inventory') {
            targetArray = game.player.ship.inventory;
        } else if (to.type === 'stash') {
            targetArray = game.player.quantumStash;
        }
        
        if (!sourceArray || !targetArray) return;
        
        // Use the adjusted index
        to.index = actualToIndex;
        
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
    
    // Public method for drawing items in custom slots
    _drawItemInSlot(item, x, y, slotSize) {
        // Draw item background with rarity color
        const rarityColor = this.#getRarityColor(item.rarity);
        game.ctx.fillStyle = rarityColor;
        game.ctx.fillRect(x + 2, y + 2, slotSize - 4, slotSize - 4);
        
        // Draw item border
        const borderColor = rarityColor.replace('0.6', '0.9');
        game.ctx.strokeStyle = borderColor;
        game.ctx.lineWidth = 2;
        game.ctx.strokeRect(x + 2, y + 2, slotSize - 4, slotSize - 4);
        
        // Draw item icon/text
        game.ctx.fillStyle = UI_COLORS.TEXT_WHITE;
        game.ctx.font = UI_FONTS.LABEL;
        game.ctx.textAlign = 'center';
        game.ctx.textBaseline = 'middle';
        
        // Draw abbreviated name
        const abbrev = this.#getAbbreviation(item.name);
        game.ctx.fillText(abbrev, x + slotSize / 2, y + slotSize / 2 - 5);
        
        // Draw amount if > 1
        if (item.amount > 1) {
            game.ctx.font = UI_FONTS.TINY;
            game.ctx.fillStyle = UI_COLORS.TEXT_HIGHLIGHT;
            const amountText = item.amount > 999 ? '999+' : item.amount.toFixed(0);
            game.ctx.fillText(amountText, x + slotSize / 2, y + slotSize - 8);
        }
        
        game.ctx.textAlign = 'left';
        game.ctx.textBaseline = 'alphabetic';
    }
}

