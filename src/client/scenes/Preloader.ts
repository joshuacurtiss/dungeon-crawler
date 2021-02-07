import Phaser from 'phaser'
import WebFont from 'webfontloader'

export default class Preloader extends Phaser.Scene {

    constructor() {
        super('preloader')
    }

    preload() {
        // Progress handlers
        const progressBar = this.add.graphics()
        const progressBox = this.add.graphics()
        const width = this.cameras.main.width
        const height = this.cameras.main.height
        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        })
        const percentText = this.make.text({
            x: width / 2,
            y: height / 2 - 5,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        })
        percentText.setOrigin(0.5, 0.5)
        loadingText.setOrigin(0.5, 0.5)
        progressBox.fillStyle(0x222222, 0.8)
        progressBox.fillRect(width/4-5, height/2-25, width/2+10, 40)
        this.load.on('progress', function (value) {
            percentText.setText(Math.floor(value * 100) + '%');
            progressBar.clear()
            progressBar.fillStyle(0xffffff, 1)
            progressBar.fillRect(width/4, height/2-20, width/2 * value, 30)
        })
        this.load.on('complete', function () {
            loadingText.destroy()
            percentText.destroy()
            progressBar.destroy()
            progressBox.destroy()
        })
        // Tiles
        this.load.image('cave', 'tiles/cave.png')
        this.load.image('dungeon', 'tiles/dungeon_tiles_extruded.png')
        this.load.image('dungeon_tiles', 'tiles/dungeon_tiles_extruded.png')
        this.load.image('ffi', 'tiles/ffi.png')
        this.load.image('ffi_snow', 'tiles/ffi_snow.png')
        this.load.image('forest', 'tiles/forest.png')
        this.load.image('legend_of_faune_tiles', 'tiles/legend_of_faune_tiles.png')
        this.load.image('legend_of_faune_water', 'tiles/legend_of_faune_water.png')
        this.load.image('lava', 'tiles/lava.png')
        this.load.image('overworld', 'tiles/overworld.png')
        this.load.image('roguelike_transparent', 'tiles/roguelike_transparent_extruded.png')
        this.load.tilemapTiledJSON('dungeon-start', 'levels/start.json')
        // Textures
        this.load.atlas('textures', 'media/textures.png', 'media/textures.json')
        // Audio
        this.load.audioSprite('sfx', 'media/sfx.json', ['media/sfx.ogg', 'media/sfx.m4a', 'media/sfx.mp3'])
        this.load.audio('music-menu', 'media/music-menu.mp3')
    }

    create() {
        WebFont.load({
            google: {
                families: [ 'Nova Script' ]
            },
            active: ()=>{
                this.scene.start('mainmenu')
            }
        })
    }
    
}