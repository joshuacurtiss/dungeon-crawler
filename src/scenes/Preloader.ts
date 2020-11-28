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
        this.load.image('ui-heart-empty', 'ui/heart_empty.png')
        this.load.image('ui-heart-full', 'ui/heart_full.png')
        this.load.image('ui-heart-half', 'ui/heart_half.png')
    }

    create() {
        this.scene.start('game')
    }
    
}