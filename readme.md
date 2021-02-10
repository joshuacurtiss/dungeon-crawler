# Writing a crawler game with Phaser 3

I went through the tutorial on [Making a Dungeon Crawler with Phaser 3](https://www.youtube.com/watch?v=_fK6MVLPrMA)
to learn how to use [Phaser 3, Parcel, and TypeScript](https://github.com/ourcade/phaser3-parcel-template) to make a
Zelda-type top-down perspective game. After finishing the tutorial, I continued applying my knowledge to just add
some creative features to the game.

Play the game here:  
https://www.curtiss.me/dungeon-crawler 

*Disclaimer:* This is a work in progress. I am not responsible for injury caused by frustration from bugs or incomplete levels. 🤪

## Progress

I've completed the tutorial, and in the end, I had a map with enemies and a character that can walk around and get hurt by the enemies and throw knives to destroy them. There were chests to collect coins and potion to hurt/help player health. Since then some features I've added have been:

  * More levels 
  * More enemies
  * More characters the player can choose
  * Different weapons for each character 
  * Multiplayer *(work in progress)*
  * Spikes as another item that hurts the player
  * Sound effects and music
  * Menu, Options, and Start screens, as well as a Pause screen
  * Cheat codes 😁
  * Refactored the code to have general classes for enemies, players, items, and weapons. 
  * And more...

## To Build This Game

**Prerequisites.**
Both the client and server portion of this game require [Node.js](https://nodejs.org). After installing that, install [Parcel](https://parceljs.org/) and [FFmpeg](https://ffmpeg.org), which are used to pack and build the client.

Install Parcel with npm: 
```
npm install -g parcel
```

Install FFmpeg with a package installer of your choice. For Windows users, try these instructions: [Install FFmpeg on Windows](https://www.wikihow.com/Install-FFmpeg-on-Windows). Here's an example using [brew](https://brew.sh) on macOS:
```
brew install ffmpeg
```

Using [git](https://git-scm.com), clone this repository to your local machine:
```bash
git clone https://github.com/joshuacurtiss/dungeon-crawler.git
```

This will create a folder named `dungeon-crawler`.

Go into the project folder and install dependencies:

```bash
cd dungeon-crawler
npm install
```

## How to start/run the game

The game has a server component for multiplayer. If you are only using the *single-player* mode, you can start the client:

```
npm run start
```

The game will be hosted on port 4000, like: http://localhost:4000

To build the game for production:

```
npm run build
```

Production files will be placed in the `dist` folder. Then run the server component to server up everything: 

```
npm run server
```

To *develop* on multiplayer functionality, you may need to manipulate both the client and server bits of the project. To do that, run two separate processes in different terminals:

`npm run watch`       *(Builds the client while watching for changes)*  
`npm run serverdev`   *(Runs the server while watching for changes)*
