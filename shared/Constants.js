export const ICON_SIZE = 32;

export const STACK_SIZES = {
    MODULE: 1,
    ORE: 200
};

export const MOVE = {
    APPROACH: 0,
    ORBIT: 1
};

export const ORE = {
    IRON: 0,
    ICE: 1,
    SILICON: 2,
    GOLD: 3,
    TITANIUM: 4
};

export const RARITY = {
    SIMPLE: 0,
    MODIFIED: 1,
    COMPLEX: 2
};

export const AFFIX = {
    QUALITY: {
        desc: 'Quality: adds effect of module',
        tier: [10, 7, 4]
    },
    SPEED: {
        desc: 'Speed: adds ship speed',
        tier: [10, 7, 4]
    },
    FIRE_RATE: {
        desc: 'Fire rate: adds gun fire speed',
        tier: [10, 7, 4]
    },
    ACCURACY: {
        desc: 'Accuracy: adds tracking speed',
        tier: [10, 7, 4]
    },
    DAMAGE: {
        desc: 'Damage: adds gun damage',
        tier: [10, 7, 4]
    }
}

export const SPRITE = {
    X0: 0,
    MINE: 1,
    DRONES: 2,
    FIRE: 3,
    STATION: 4,
    SHEET: 5,
    QUESTION: 6,
    EXCLAMATION: 7,
    WARP: 8,
    ASTEROID: 9,
    SPACESHIP: 10,
    CROSS: 11,
    SHIP_1: 12,
    SHIP_2: 13,
    SHIP_3: 14,
    SHIP_4: 15,
    SHIP_5: 16,
    SHIP_6: 17,
    SHIP_7: 18,
    DRONE: 19
};

export const COLOR = {
    RED: '255, 50, 50',
    GREEN: '50, 255, 50',
    BLUE: '50, 50, 255'
};

export const UI_COLORS = {
    // Text colors
    TEXT_PRIMARY: 'rgba(220, 220, 220, 0.95)',
    TEXT_SECONDARY: 'rgba(160, 160, 160, 0.9)',
    TEXT_LIGHT: 'rgba(180, 180, 180, 0.85)',
    TEXT_DISABLED: 'rgba(100, 100, 100, 0.6)',
    TEXT_WHITE: 'white',
    TEXT_REWARD: 'rgba(100, 255, 100, 0.9)',
    TEXT_HIGHLIGHT: 'rgba(255, 255, 100, 0.9)',
    TEXT_COST: 'rgba(255, 200, 100, 0.9)',
    // Backgrounds
    BG_DARK: 'rgba(0, 0, 0, 0.92)',
    BG_DARKER: 'rgba(0, 0, 0, 0.95)',
    BG_PANEL: 'rgba(20, 20, 20, 0.5)',
    BG_GRID: 'rgba(10, 10, 10, 0.7)',
    // Borders
    BORDER: 'rgba(60, 60, 60, 0.8)',
    BORDER_BRIGHT: 'rgba(100, 100, 100, 0.8)',
    BORDER_DARK: 'rgba(0, 0, 0, 0.9)',
    // Interactive states
    HOVER: 'rgba(80, 80, 80, 0.4)',
    HOVER_BORDER: 'rgba(150, 150, 150, 0.9)',
    // Health/Status
    SHIELD_BG: 'rgba(30, 30, 40, 0.7)',
    SHIELD_FILL: 'rgba(100, 150, 255, 0.8)',
    HULL_BG: 'rgba(40, 30, 30, 0.7)',
    HULL_FILL: 'rgba(255, 100, 100, 0.8)',
    BAR_GREEN: 'rgba(30, 150, 30, 0.8)',
    BAR_YELLOW: 'rgba(200, 200, 50, 0.8)',
    // Buttons
    BUTTON_ENABLED_BORDER: 'rgba(50, 200, 50, 1)',
    BUTTON_DISABLED: 'rgba(60, 60, 60, 0.5)'
};

export const UI_FONTS = {
    // bold
    TITLE: 'bold 20px Arial',
    ITEM: 'bold 16px Arial',
    HEADER: 'bold 14px Arial',
    BUTTON: 'bold 12px Arial',
    LABEL: 'bold 10px Arial',
    // normal
    LARGE: '30px Arial',
    MEDIUM: '14px Arial',
    SMALL: '12px Arial',
    TINY: '9px Arial'
};

// 6 types of modules, 6 tiers (1 good, 6 bad)
export const MODULE = {
    HULL: [
        'Nano-Weave Reinforcer',
        'Molecular Binder',
        'Structural Harmonizer',
        'Lattice Stabilizer',
        'Shell Fortifier',
        'Frame Integrator'
    ],
    SHIELD: [
        'Field Resonator',
        'Barrier Amplifier',
        'Shield Modulator',
        'Defense Matrix Core',
        'Aegis Synchronizer',
        'Deflector Enhancer'
    ],
    WEAPON: [
        'Targeting Matrix',
        'Damage Accelerator',
        'Impact Calibrator',
        'Strike Optimizer',
        'Combat Synchronizer',
        'Attack Amplifier'
    ],
    CARGO: [
        'Space Expander',
        'Cargo Optimizer',
        'Storage Densifier',
        'Hold Maximizer',
        'Volume Enhancer',
        'Capacity Amplifier'
    ],
    ENGINE: [
        'Thrust Amplifier',
        'Velocity Modulator',
        'Drive Optimizer',
        'Speed Harmonizer',
        'Propulsion Enhancer',
        'Momentum Accelerator'
    ],
    SCANNER: [
        'Range Extender',
        'Signal Booster',
        'Detection Matrix',
        'Sensor Amplifier',
        'Scan Optimizer',
        'Radar Enhancer'
    ]
};
