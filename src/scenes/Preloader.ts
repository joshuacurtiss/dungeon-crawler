import Phaser from 'phaser'

export default class Preloader extends Phaser.Scene {

    constructor() {
        super('preloader')
    }

    preload() {
        this.load.image('tiles', 'tiles/dungeon_tiles.png')
        this.load.tilemapTiledJSON('dungeon', 'tiles/dungeon-01.json')
        this.load.atlas('faune', 'character/faune.png', 'character/faune.json')
        this.load.atlas('lizard', 'enemies/lizard.png', 'enemies/lizard.json')
        this.load.atlas('treasure', 'items/treasure.png', 'items/treasure.json')
        this.load.image('ui-heart-empty', 'ui/heart_empty.png')
        this.load.image('ui-heart-full', 'ui/heart_full.png')
        this.load.image('ui-heart-half', 'ui/heart_half.png')
        this.load.image('knife', 'weapons/knife.png')
        this.load.audio('coin', 'audio/coin.mp3')
        this.load.image('potion', 'items/flask_potion.png')
        this.load.image('poison', 'items/flask_poison.png')
        this.load.audio('door', 'audio/door.mp3')
        this.load.audio('impact', 'audio/impact.mp3')
        this.load.audio('ouch-m', 'audio/ouch-m.mp3')
        this.load.audio('ouch-f', 'audio/ouch-f.mp3')
        this.load.audio('melee-1', 'audio/melee-1.wav')
        this.load.audio('melee-2', 'audio/melee-2.wav')
        this.load.audio('monster-1', 'audio/monster-1.mp3')
        this.load.audio('monster-2', 'audio/monster-2.mp3')
        this.load.audio('monster-3', 'audio/monster-3.mp3')
        this.load.audio('monster-4', 'audio/monster-4.mp3')
        this.load.audio('monster-5', 'audio/monster-5.mp3')
        this.load.audio('rise', 'audio/rise-3.mp3')
        this.load.audio('music-game', 'audio/music-game.mp3')
    }

    create() {
        this.scene.start('game')
    }
    
}