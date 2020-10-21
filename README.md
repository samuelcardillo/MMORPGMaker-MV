# (MMO)RPG Maker MZ 
### (by [Axel FIOLLE](https://axelfiolle.be), and based on [MV version by Samuel Cardillo](https://github.com/samuelcardillo/MMORPGMaker-MV))

## **Disclaimer :** *You HAVE to own an RPG Maker MV AND MZ in order to use this repack !!!*
---

## Summary
This is a project I started in 2016 and on which I worked for only few weeks. In 2019 I stumbled upon an old version of the code which I have tested & refactored (a little bit). I also decided to restart working on it on my free time - which I almost have not - and open source it with the hopes that some other cool people upgrade it!

## History
Samuel Cardillo has used RPG Maker since its 2000 version. Discovered it when he was a kid and used it to make many (very bad he says) games. It clearly impacted a lot on his creativity and his development desires. Later on, as a French-speaking person, he discovered a (now dead) project named FROG Creator which was a dedicated at creating MMORPG in a RPG Maker-like environment. 

With the release of RPG MAKER MV which allows usage of JavaScript and its HTML5 export, he decided to give it a try and discovered quickly that yes, RPG Maker MV could easily be used to create an MMORPG creator interface.

Axel Fiolle joined the project in September 2020 and made the MZ update a few months later, after discovering it was easy to migrate basic MMO features to RPG Maker MZ)

--- 

## How to use ? 

Watch the [video](https://www.youtube.com/watch?v=4V4YhMcNRng) !

---

### Plugins requirement 

**Disclaimer :** *All the files are already contained in the project.*

- Orange Custom Events : http://download.hudell.com/OrangeCustomEvents.js
- Orange Custom Event Creator : http://download.hudell.com/OrangeCustomEventCreator.js

---

### Launch steps
1. `git clone` the repo
2. Get to the `MMOMZ/develop` branch
3. In the project root folder, copy `package.json.exemple` text content into `package.json`
4. Install [NodeJS](https://nodejs.org/en/) and `npm i` in the `server` folder
5. Install [RethinkDB](https://rethinkdb.com/docs/install/) and `rethinkdb` in the `server` folder
6. `node mmo.js` in the `server` folder
7. `php -S localhost:1337` in the root folder
8. Visit `http://localhost:1337` on your browser

### **Warning :** *If you run the game with the RPG Maker editor, it will delete your `package.json` and need to re-copy the example.*

Congratulations! Your game is now an MMORPG. 

---

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

---

**See the progress : https://trello.com/b/m4leXuBa/mmorpg-maker-mv-version-1-todo-list**

**Join us on Discord : https://discord.gg/GVqyAwp**
