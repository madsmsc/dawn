import { RARITY, AFFIX } from '../../shared/Constants.js';

export class Module {
    constructor(name, sprite = undefined, amount = 1, unit = 'units') {
        this.name = name;
        this.sprite = sprite;
        this.amount = amount;
        this.unit = unit;
        this.rarity = undefined;
        this.prefixes = []; // [key,tier] []
        this.suffixes = []; // [key,tier] []
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
}