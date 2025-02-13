# Instructions

root contains icons.png and index.html which comprise the front-end.

the server folder contains the node.js back-end.
run 'npm start' to start the server.

the front-end and back-end communicate via websockets.


# TODOs

3 ways to play/progress: kill stuff, missions, and mining.
killing stuff drops modules and components.
missions grant components. and often has you killing stuff.
mining grants ore.
ore can be built into components at station vendors.
modules can be destructed into components at station vendors.
components can be used on modules like PoE currency orbs.
remove the concept of credits.
all stations share "folding vault" containing all your items.
make small indicators for where stations and asteroids are in your current instance.
make some way of handling instances.

no gates. space is small instances that you can warp between.
usually at planets, moons, or structures in space.
move menu buttons to the left side. and make all buttons clickable.

first MISSIONS...

first mission. given a frigate.
we're under attack. please help.
take out this frigate by locking them up, flying to them, and firing your guns.

second mission: our buddies need help too.
kill three frigates. these frigates are equipped with short range weapons.
stay out of range of their weapons while just staying in range of yours.
kite as necessary and take them down.

third mission. it doesn't seem like there any way out of this alive.
too many ships are warping in and our ward drive is down.
let's go do fighting. after all, a good fight is what it's all about.
welcome back pilot. you have awoken in another clone.
here's how a station works. you have been given a new frigate and 
a choice between weapons. a few more fighting missions follow
explaining more mechanics and dropping some cool loot.
then comes crafting. there are 2 aspects. mining and manufactoring.
levels are trained in both.
as you kill and loot and sell, you get xp and credits.
xp has some inherent bonuses to the skills you level
and credits can be used to buy ships and components.
credits carry over between deaths.

-- come up with module names
-- and modifier names - or are these the module names? - maybe modifiers should have simpler names?
COMPONENT_NAMES = {
    'HULL': [
        'Nano-Weave Reinforcer',
        'Molecular Binder',
        'Structural Harmonizer',
        'Lattice Stabilizer',
        'Shell Fortifier',
        'Frame Integrator'
    ],
    'SHIELD': [
        'Field Resonator',
        'Barrier Amplifier',
        'Shield Modulator',
        'Defense Matrix Core',
        'Aegis Synchronizer',
        'Deflector Enhancer'
    ],
    'WEAPON': [
        'Targeting Matrix',
        'Damage Accelerator',
        'Impact Calibrator',
        'Strike Optimizer',
        'Combat Synchronizer',
        'Attack Amplifier'
    ],
    'CARGO': [
        'Space Expander',
        'Cargo Optimizer',
        'Storage Densifier',
        'Hold Maximizer',
        'Volume Enhancer',
        'Capacity Amplifier'
    ],
    'ENGINE': [
        'Thrust Amplifier',
        'Velocity Modulator',
        'Drive Optimizer',
        'Speed Harmonizer',
        'Propulsion Enhancer',
        'Momentum Accelerator'
    ],
    'SCANNER': [
        'Range Extender',
        'Signal Booster',
        'Detection Matrix',
        'Sensor Amplifier',
        'Scan Optimizer',
        'Radar Enhancer'
    ]
}
