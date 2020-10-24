# (MMO)RPG Maker MV

## Summary
This is a project I started in 2016 and on which I worked for only few weeks. In 2019 I stumbled upon an old version of the code which I have tested & refactored (a little bit). I also decided to restart working on it on my free time - which I almost have not - and open source it with the hopes that some other cool people upgrade it!

## History
I have used RPG Maker since its 2000 version. Discovered it when I was a kid and used it to make many (very bad) games. It clearly impacted a lot on my creativity and my development desires. Later on, as a French-speaking person, I discovered a (now dead) project named FROG Creator which was a dedicated at creating MMORPG in a RPG Maker-like environment. 

With the release of RPG MAKER MV which allows usage of JavaScript and its HTML5 export, I decided to give it a try and discovered quickly that yes, RPG Maker MV could easily be used to create an MMORPG creator interface.

## How to use ? 

Video : [![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/TcAmU2bdKvE/0.jpg)](https://www.youtube.com/watch?v=TcAmU2bdKvE)

## Can I use it on RPG Maker MZ ? 

Yes, please go on the MZ branch of this project: https://github.com/samuelcardillo/MMORPGMaker-MV/tree/MMOMZ/develop

### Plugins requirement 

**Disclaimer :** *All the files are already contained in the project.*

- Orange Custom Events : http://download.hudell.com/OrangeCustomEvents.js
- Orange Custom Event Creator : http://download.hudell.com/OrangeCustomEventCreator.js

### Launch steps
1. `git clone` the repo
2. Install [NodeJS](https://nodejs.org/en/) and `npm i` in the `server` folder
3. Install [RethinkDB](https://rethinkdb.com/docs/install/) and `rethinkdb` in the `server` folder
4. `node mmo.js` in the `server` folder
5. Start the RPG Maker MV project.

Congratulations! Your game is now an MMORPG. 

### Contribution

This is an open source project supported by the community. We are always looking for more developers to help building MMOMV/MZ! Feel free to push commits and [join the community Discord](https://discord.gg/GVqyAwp). **Beware: Commits that modify the core of RPG Maker MV/MZ are not accepted.**

### Documentation 

-Are you a developer ? [Read the developer documentation](https://github.com/samuelcardillo/MMORPGMaker-MV/wiki#developers-documentation)

-Are you a maker ? [Read the maker documentation](https://github.com/samuelcardillo/MMORPGMaker-MV/wiki#makers-documentation)

### Current functionalities
- Synchronised player movements
- Synchronised skins
- Account creation (password hashed with SHA256 + customizable salt)
- RESTFUL API support (with JSON Web Token)
- Persistance of position & skin
- Persistance of player stats
- Persistance of inventory & equipments
- Persistance of local switches
- Persistance of party switches
- Persistance of global switches
- Persistance of local variables
- Persistance of global variables
- Global and local map system
- Party system
- Party combat system
- Respawn system
- In-game chat
- Registration page

**See the progress : https://trello.com/b/m4leXuBa/mmorpg-maker-mv-version-1-todo-list**

**Join us on Discord : https://discord.gg/GVqyAwp**
