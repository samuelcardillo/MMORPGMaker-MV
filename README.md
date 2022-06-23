# (MMO)RPG Maker MZ 
###  **Disclaimer :** *You have to own both RPG Maker MV and MZ licenses in order to use this repack !*
---

## Summary
Hello, my name is Axel Fiolle.

I started this project in late 2020. I discovered the MMO plugin project by Samuel Cardillo and was quite impressed by the quality of the result. Samuel and his community have made good work on it. 
It was running on RPG Maker MV –which runs in JavaScript– and as a web developer I decided to make my very own MMO with it because I'm quite good with the technos the project uses. 
After some weeks working on my game, I started to feel the need to have a better engine so I decided to migrate the MMO_Core plugins from MV to RPG Maker MZ. 
After some tricky fixes and "bandages" I finally produced something surprisingly stable. 

## History
Samuel Cardillo has used RPG Maker since its 2000 version. Discovered it when he was a kid and used it to make many (very bad he says) games. It clearly impacted a lot on his creativity and his development desires. Later on, as a French-speaking person, he discovered a (now dead) project named FROG Creator which was a dedicated at creating MMORPG in a RPG Maker-like environment. 

With the release of RPG MAKER MV which allows usage of JavaScript and its HTML5 export, he decided to give it a try and discovered quickly that yes, RPG Maker MV could easily be used to create an MMORPG creator interface.

I joined the project in September 2020 and made the MZ version a few weeks later, after discovering it was easy to migrate basic MMO features to RPG Maker MZ. 

--- 

## How to use ? 

1. Watch [the MV tutorial video](https://www.youtube.com/watch?v=TcAmU2bdKvE) to learn the basics
2. Then take a look at [the MZ tutorial](https://www.youtube.com/watch?v=VhUWKwOxv5Q) :

[![Watch the tutorial](https://img.youtube.com/vi/4V4YhMcNRng/0.jpg)](https://www.youtube.com/watch?v=VhUWKwOxv5Q) 

*Note : It's not needed to touch any package file anymore*

### Plugins requirement 

**Disclaimer :** *The following files are already contained in the project.*

- Orange Custom Events : http://download.hudell.com/OrangeCustomEvents.js

### Launch steps

1. `git clone` the repo

2. Check that you're on to the `MMOMZ/develop` branch

3. Install [NodeJS](https://nodejs.org/en/) *(we recommend using version 16 or higher)*

4. Install [RethinkDB](https://rethinkdb.com/docs/install/)

5. Run `rethinkdb` in a terminal

6. Run `npm install` then `node mmo.js` in the `server/` folder

7. Congratulations ! You can now play, develop, improve, overcome and do your stuff :) 

8. When you deploy your game, update line 103 in `register.html`, set your own server (domain name + port, ex : http://mynew.mmo:8097/ ) to let users register

### Keep the game up to date on players browser

1. Deploy your game
2. Edit your game...
3. Once you're done, change the `CacheOverride` gameVersion parameter in the plugin manager
4. Upload/Update your game on a website

---

### Documentation 

-Are you a developer ? [Read the developer documentation](https://github.com/samuelcardillo/MMORPGMaker-MV/wiki#developers-documentation)

-Are you a maker ? [Read the maker documentation](https://github.com/samuelcardillo/MMORPGMaker-MV/wiki#makers-documentation)

### Current functionalities
- Administrator command to add and remove synchronised NPCs
- Synchronised NPC random movements
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

---

This repack includes Creative Commons graphics by : 
 - Avery
 - Chalkdust
 - hidenone
 - whtdragon

---

**See the progress : https://trello.com/b/m4leXuBa/mmorpg-maker-mv-version-1-todo-list**

**Join us on Discord : https://discord.gg/GVqyAwp**

**Check the original project : https://github.com/samuelcardillo/MMORPGMaker-MV**
