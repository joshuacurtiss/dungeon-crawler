# Writing a crawler game with Phaser 3

I'm going through the tutorial on [Making a Dungeon Crawler with Phaser 3](https://www.youtube.com/watch?v=_fK6MVLPrMA)
to learn how to use [Phaser 3, Parcel, and TypeScript](https://github.com/ourcade/phaser3-parcel-template) to make a
Zelda-type top-down perspective game. 

## Progress

So far, I've completed parts 1 to 6. We have a map with enemies and a character that can walk around and get hurt by the
enemies and throw knives to destroy them.

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

Start development server:

```
npm run start
```

To create a production build:

```
npm run build
```

Production files will be placed in the `dist` folder. Then upload those files to a web server. 🎉

## Dev Server Port

You can change the dev server's port number by modifying the `start` script in `package.json`. We use Parcel's `-p` option to specify the port number.

The script looks like this:

```
parcel src/index.html -p 8000
```

Change 8000 to whatever you want.
