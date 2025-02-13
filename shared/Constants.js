export const Constants = {
    MOVE: {
        APPROACH: 0,
        ORBIT: 1
    },
    ORES: {
        Iron: 0,
        Ice: 1,
        Silicon: 2,
        Gold: 3,
        Titanium:4
    },
    COMPONENT: {
        A: 0, // transmute: common to magic (1-2 modifiers)
        B: 1, // augment: add modifier to magic (max 2 modifiers)
        C: 2, // alteration: reroll magic (1-2 modifiers)
        D: 3, // alchemy: magic to rare (2-6 modifiers)
        E: 4, // chaos: reroll rare (2-6 modifiers)
        F: 5 // scour: magic/rare to common (0 modifiers)
    },
    SPRITE: {
        // icons
        MINE: 0,
        PILOT: 1,
        SHIP: 2,
        FIRE: 3,
        FLY_TO: 4,
        ORBIT: 5,
        APPROACH: 6,
        SETTINGS: 7,
        WARP: 8,
        // models
        ASTEROID: 9,
        SPACESHIP: 10
    },
    COLOR: {
        RED: '255, 50, 50',
        GREEN: '50, 255, 50',
        BLUE: '50, 50, 255'
    }
};
