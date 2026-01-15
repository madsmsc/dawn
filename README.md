# Instructions

- root contains icons.png and index.html which comprise the front-end.
- the server folder contains the node.js back-end.
- install node.js (https://nodejs.org/en/download).
- run 'npm install' to install the dependency.
- run 'npm start' to start the server.
- the front-end and back-end communicate via websockets.

# TODOs

- when not in demo mode, enter into intro space with intro missions:
  - the player needs to be introduced to warping at some point - are the missions instanced?
  - #1 given a frigate and 1 laser weapon: "we're under attack. please help. take out this frigate by flying to them, and firing your guns." (intros weapons)
  - #2 given a passive module boosting range: "our buddies need help too. kill three frigates. these frigates are equipped with short range weapons. stay out of range of their weapons while staying just in range of yours. kite as necessary and take them down." (intros passive modules and range/kiting)
  - #3 given nothing, but promised reward of new ship: "it doesn't seem like there's any way out of this alive. oo many ships are warping in and our warp drive is down. let's go down fighting. after all, a good fight is what it's all about." (intros death)
  - #4 given new ship with weapons: "welcome back pilot. you have awoken in another clone. here's how a station works. you have been given a replacement frigate." (intros clones)
  - #5 given mining laser: "all ships and modules are made from refined ore. let's get you started on mining." (intros mining)
  - #6 promised drone control: "we are having some trouble with rogue drones harassing our miners. please go deal with the drone hub" (intros drones)
  - #7 a few crafting missions.
  - #8 "contratulations on finishing our new pilot course and receiving your pilot certification. you are now authorized for all jump gates, which allow you access to other systems."
- aoe weapon, long cast time
- make bigger and better ships
- make small indicators for where stations and asteroids are in your current instance
- ships are completely lost on death, but credits and quantum stash are kept
  - fix respawning at station - which station? clones?
- no xp or levels
