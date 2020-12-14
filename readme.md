# Writing a crawler game with Phaser 3

I went through the tutorial on [Making a Dungeon Crawler with Phaser 3](https://www.youtube.com/watch?v=_fK6MVLPrMA)
to learn how to use [Phaser 3, Parcel, and TypeScript](https://github.com/ourcade/phaser3-parcel-template) to make a
Zelda-type top-down perspective game. After finishing the tutorial, I continued applying my knowledge to just add
some creative features to the game. This is currently a work in progress.

## Progress

I've completed the tutorial, and in the end, I had a map with enemies and a character that can walk around and get hurt by the
enemies and throw knives to destroy them. There were chests to collect coins and potion to hurt/help player health. Since then some features I've added have been:

  * More levels 
  * More enemies
  * More characters the player can choose
  * Different weapons for each character 
  * Spikes as another item that hurts the player
  * Sound effects and music
  * Menu, Options, and Start screens, as well as a Pause screen
  * Cheat codes 😁
  * Refactored the code to have general classes for enemies, players, items, and weapons. 

## To Build This Game

You'll need [Node.js](https://nodejs.org/en/), [npm](https://www.npmjs.com/), and [Parcel](https://parceljs.org/) installed.

Clone this repository to your local machine:

```bash
git clone https://github.com/joshuacurtiss/dungeon-crawler.git
```

This will create a folder named `dungeon-crawler`.

Go into the project folder and install dependencies:

```bash
cd dungeon-crawler
npm install
```

## Start a development server

```
npm run start
```

The game will be hosted on port 4000, like: http://localhost:4000

## To create a production build

```
npm run build
```

Production files will be placed in the `dist` folder. Then upload those files to a web server. 🎉
