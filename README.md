# Instructions

- root contains icons.png and index.html which comprise the front-end.
- the server folder contains the node.js back-end.
- install node.js (https://nodejs.org/en/download).
- run 'npm install' to install the dependency.
- run 'npm start' to start the server.
- the front-end and back-end communicate via websockets.

# TODOs

- when not in demo mode, make small intro
  - you start with only the weapon and kill a single enemy
  - you get the mining laser and are asked to complete a mining mission
  - you get the warp drive are are told to warp to the drone hive
    and kill it, as a reward you get the drone link (renamed from drones)
  - from there, your pilot is granted access to use system gates
- add colored "blotches" as galaxies/nebulae - 32x32 or 200x200 pngs?
  - will need to redraw when flying to new systems because of the colors
  - also just for immersion, so backdrop changes.
- find out how to do performance meassurements.
  - some breakdown of which methods use resources.
  - need some way to meassure if the "improvements" I make
  - actually help or not.
- space station background - how?
- aoe weapon, long cast time
- ambience: music, lasers, particle trails, background planets with rings, etc.
- shoot mercenaries to increase fighter reputation
- mine asteroids to increase miner reputation
- run missions to increase specific reputations
- increase reputation to earn better ship licenses, allowing you to fly bigger and better ships.
- most activities reward your with credits and/or reputation, and credits rule the galaxy.
- trade credits for new modules, ships, and even reputation by bribing the right people.
- crafting system ("research facility") like PoE but using credits when docked in stations
- 3 ways to play/progress: kill stuff, missions, and mining.
- all stations share "folding vault" containing all your items.
- make small indicators for where stations and asteroids are in your current instance.
- make some way of handling instances.
- no gates. space is small instances that you can warp between. usually at planets, moons, or structures in space.
- make all buttons clickable.
- first MISSIONS...
  - #1 given a frigate. we're under attack. please help. take out this frigate by locking them up, flying to them, and firing your guns.
  - #2 our buddies need help too. kill three frigates. these frigates are equipped with short range weapons. stay out of range of their weapons while staying just in range of yours. kite as necessary and take them down.
  - #3 it doesn't seem like there's any way out of this alive. oo many ships are warping in and our warp drive is down. let's go down fighting. after all, a good fight is what it's all about. 
  - #4 welcome back pilot. you have awoken in another clone. here's how a station works. you have been given a new frigate and a choice between weapons. a few more fighting missions follow explaining more mechanics and dropping some cool loot.
  - #5 finally some crafting mission(s).
- ships are completely lost on death but rep, credits, and components/loot outside the lost ship are kept.
- no xp or levels. but rep could potentially be used as a level mechanic where some thing are unlocked. this may come later.
