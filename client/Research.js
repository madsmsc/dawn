class Research {
    constructor(name, short, cost, worksOn, desc) {
        this.name = name; // string
        this.short = short; // string
        this.cost = cost; // int 
        this.worksOn = worksOn; // Constants.RARITY[]
        this.desc = desc; // string
    }

    apply(module) {
        if (!this.worksOn.includes(module.rarity)) {
            console.log('cannot use on this module');
            return;
        }
        module.apply(this);
    }

    static availableResearch() {
        // big boy station: all research available at this station
        return [
            new Research('Transmute', 'tra', 100, [RARITY.SIMPLE],
                'turn simple module into modified, allowing 1 prefix and 1 suffix.',
                (m) => {
                    m.addPrefixOrSuffix(Math.floor(Math.random() * 2));
                }),
            new Research('Alterate', 'alt', 200, [RARITY.MODIFIED],
                'reroll prefixes and suffixes on a modified item.',
                (m) => {
                    m.removeAllAffixes();
                    m.addPrefixOrSuffix(Math.floor(Math.random() * 2));
                }),
            new Research('Augment', 'aug', 150, [RARITY.MODIFIED],
                'add a missing prefix or suffix to modified item.'),
            new Research('Regal', 'reg', 400, [RARITY.MODIFIED],
                'turn modified module into complex, allowing 2 prefix and 2 suffix.'),
            new Research('Alchemy', 'alc', 300, [RARITY.SIMPLE],
                'turn simple module info a complex, allowing 2 prefix and 2 suffix.'),
            new Research('Scour', 'sco', 300, [RARITY.MODIFIED, RARITY.COMPLEX],
                'turn any module into simple, allowing no prefixes or suffixes.'),
            new Research('Exalt', 'exa', 500, [RARITY.COMPLEX],
                'add a missing prefix or suffix to a complex item.')
                // TODO: add annuls
        ];
    }
}