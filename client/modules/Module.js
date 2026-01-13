import { RARITY, AFFIX } from '../../shared/Constants.js';
import { ORE, STACK_SIZES } from '../../shared/Constants.js';

export class Module {
    static isActive(moduleName) {
        const activeModules = ['laser weapon', 'mining laser', 'warp drive', 'drones'];
        return activeModules.includes(moduleName.toLowerCase());
    }
    constructor(name, sprite = undefined, amount = 1, unit = 'units', rarity = RARITY.SIMPLE) {
        this.name = name;
        this.sprite = sprite;
        this.amount = amount;
        this.unit = unit;
        this.rarity = rarity;

        this.prefixes = []; // [key,tier] []
        this.suffixes = []; // [key,tier] []
        
        const oreNames = Object.keys(ORE);
        const isOre = oreNames.includes(name);
        this.stackSize = isOre ? STACK_SIZES.ORE : STACK_SIZES.MODULE;
    }

    canAddAffix(isPrefix) {
        if (this.rarity === RARITY.SIMPLE) return false;
        const affix = isPrefix ? this.prefixes : this.suffixes;
        if (affix.length > 1 && this.rarity === RARITY.MODIFIED) return false;
        if (affix.length > 2) return false;
        return true;
    }

    addAffix(isPrefix) {
        const affix = isPrefix ? this.prefixes : this.suffixes;
        const available = Object.keys(AFFIX);
        const index = Math.floor(Math.random() * available.length);
        const tier = Math.floor(Math.random() * 3);
        affix.push([AFFIX[available[index]], tier]);
    }

    addPrefixOrSuffix(num) {
        for (let i = 0; i < num; i++) {
            const prefixOrSuffix = Math.floor(Math.random() * 2); // 1 = prefix, 0 = suffix
            const isPrefix = !!prefixOrSuffix;
            if (this.canAddAffix(isPrefix)) {
                this.addAffix(isPrefix);
            } else if (this.canAddAffix(!isPrefix)) {
                this.addAffix(!isPrefix);
            } else {
                console.log('cannot add affix');
                return;
            }
        }
    }
    
    apply(research) {
        // Handle different research types
        switch(research.short) {
            case 'tra': // Transmute: SIMPLE -> MODIFIED
                if (this.rarity === RARITY.SIMPLE) {
                    this.rarity = RARITY.MODIFIED;
                    this.addPrefixOrSuffix(1); // Add one random affix
                }
                break;
                
            case 'alt': // Alterate: reroll affixes on MODIFIED
                if (this.rarity === RARITY.MODIFIED) {
                    const totalAffixes = this.prefixes.length + this.suffixes.length;
                    this.prefixes = [];
                    this.suffixes = [];
                    this.addPrefixOrSuffix(totalAffixes);
                }
                break;
                
            case 'aug': // Augment: add missing affix to MODIFIED
                if (this.rarity === RARITY.MODIFIED) {
                    const totalAffixes = this.prefixes.length + this.suffixes.length;
                    if (totalAffixes < 2) {
                        this.addPrefixOrSuffix(1);
                    }
                }
                break;
                
            case 'reg': // Regal: MODIFIED -> COMPLEX
                if (this.rarity === RARITY.MODIFIED) {
                    this.rarity = RARITY.COMPLEX;
                    this.addPrefixOrSuffix(1);
                }
                break;
                
            case 'alc': // Alchemy: SIMPLE -> COMPLEX
                if (this.rarity === RARITY.SIMPLE) {
                    this.rarity = RARITY.COMPLEX;
                    this.addPrefixOrSuffix(2);
                }
                break;
                
            case 'sco': // Scour: any -> SIMPLE
                if (this.rarity === RARITY.MODIFIED || this.rarity === RARITY.COMPLEX) {
                    this.rarity = RARITY.SIMPLE;
                    this.prefixes = [];
                    this.suffixes = [];
                }
                break;
                
            case 'exa': // Exalt: add affix to COMPLEX
                if (this.rarity === RARITY.COMPLEX) {
                    const totalAffixes = this.prefixes.length + this.suffixes.length;
                    if (totalAffixes < 4) {
                        this.addPrefixOrSuffix(1);
                    }
                }
                break;
        }
    }
}