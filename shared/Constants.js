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

export const SPRITE = {
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
    SPACESHIP: 10,
    STATION: 11
};

export const COLOR = {
    RED: '255, 50, 50',
    GREEN: '50, 255, 50',
    BLUE: '50, 50, 255'
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
