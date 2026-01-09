export const ICON_SIZE = 40;

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

// TODO: try generating these with pixellab
export const SPRITE = {
    // icons
    MINE: 6,
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
    SPACESHIP: 10,
    STATION: 11
};

export const COLOR = {
    RED: '255, 50, 50',
    GREEN: '50, 255, 50',
    BLUE: '50, 50, 255'
};

export const UI_COLORS = {
    // Text colors
    TEXT_PRIMARY: 'rgba(200, 220, 255, 0.9)',
    TEXT_SECONDARY: 'rgba(150, 170, 200, 0.8)',
    TEXT_LIGHT: 'rgba(200, 200, 200, 0.8)',
    TEXT_DISABLED: 'rgba(150, 150, 150, 0.6)',
    TEXT_WHITE: 'white',
    TEXT_REWARD: 'rgba(100, 255, 100, 0.9)',
    TEXT_HIGHLIGHT: 'rgba(255, 255, 100, 0.9)',
    TEXT_COST: 'rgba(255, 200, 100, 0.9)',
    // Backgrounds
    BG_DARK: 'rgba(0, 0, 0, 0.5)',
    BG_DARKER: 'rgba(0, 0, 0, 0.8)',
    BG_PANEL: 'rgba(50, 50, 100, 0.3)',
    BG_GRID: 'rgba(20, 20, 40, 0.6)',
    // Borders
    BORDER: 'rgba(100, 100, 150, 0.5)',
    BORDER_BRIGHT: 'rgba(100, 100, 255, 0.5)',
    BORDER_DARK: 'rgba(0, 0, 0, 0.8)',
    // Interactive states
    HOVER: 'rgba(100, 150, 255, 0.3)',
    HOVER_BORDER: 'rgba(150, 200, 255, 0.8)',
    // Health/Status
    SHIELD_BG: 'rgba(30, 60, 120, 0.7)',
    SHIELD_FILL: 'rgba(100, 150, 255, 0.8)',
    HULL_BG: 'rgba(120, 30, 30, 0.7)',
    HULL_FILL: 'rgba(255, 100, 100, 0.8)',
    BAR_GREEN: 'rgba(30, 150, 30, 0.8)',
    BAR_YELLOW: 'rgba(200, 200, 50, 0.8)',
    // Buttons
    BUTTON_ENABLED_BORDER: 'rgba(50, 200, 50, 1)',
    BUTTON_DISABLED: 'rgba(100, 100, 100, 0.5)'
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
